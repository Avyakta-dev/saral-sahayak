import { afterEach, expect, it, vi } from 'vitest';
import success from '../../../docs/examples/success.json';
import failure from '../../../docs/examples/error.json';
import { analyzeTextStream, ANALYSIS_TIMEOUT_MS, RESPONSE_BYTE_LIMIT } from './api';
import { activitySchema, liveResponseSchema } from './contracts';

const event = (name: string, value: unknown) =>
  `event: ${name}\ndata: ${JSON.stringify(value)}\n\n`;
const reading = {
  phase: 'reading',
  path: 'references/knowledge/epfo/reasons/epfo-rr-001.md',
  heading: 'ಹೆಸರು',
  start_line: 2,
  end_line: 4,
};
const sse = (text: string, fragmented = false) => {
  const bytes = new TextEncoder().encode(text);
  return new Response(
    new ReadableStream({
      start(controller) {
        if (fragmented) for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
        else controller.enqueue(bytes);
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } },
  );
};
const signal = () => new AbortController().signal;
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('parses split UTF8/CRLF, real activity and final validated result without history or retries', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      sse(
        (': heartbeat\n\n' + event('activity', reading) + event('result', success)).replaceAll(
          '\n',
          '\r\n',
        ),
        true,
      ),
    );
  vi.stubGlobal('fetch', fetcher);
  const activity = vi.fn();
  expect(await analyzeTextStream(' Synthetic ', 'en', signal(), activity)).toEqual(success);
  expect(activity).toHaveBeenCalledExactlyOnceWith(reading);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toBe('/api/v1/analyze/stream');
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ text: 'Synthetic', language: 'en' });
});

it.each([
  event('activity', reading),
  event('result', { ...success, language: 'hi' }),
  event('token', { text: 'never render' }),
  event('activity', { ...reading, path: 'references/knowledge/epfo/../secret.md' }),
  event('activity', { ...reading, heading: 'secret\ncontrol' }),
  event('activity', { ...reading, start_line: 8 }),
  event('activity', { phase: 'reading' }),
  event('activity', { phase: 'thinking', path: reading.path }),
  event('activity', { phase: 'thinking', private: 'secret' }),
  event('result', success) + event('result', success),
  event('result', success) + event('activity', reading),
  event('activity', reading).repeat(129) + event('result', success),
  'x'.repeat(RESPONSE_BYTE_LIMIT + 1),
])('fails closed for invalid, incomplete, duplicate or excessive stream %#', async (text) => {
  const fetcher = vi.fn().mockResolvedValue(sse(text));
  vi.stubGlobal('fetch', fetcher);
  await expect(analyzeTextStream('Synthetic', 'en', signal(), vi.fn())).rejects.toThrow();
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('allows 128 activities plus one terminal result and omitted safe heading', async () => {
  const { heading: _heading, ...withoutHeading } = reading;
  expect(activitySchema.safeParse(withoutHeading).success).toBe(true);
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        sse(event('activity', withoutHeading).repeat(128) + event('result', success)),
      ),
  );
  const activity = vi.fn();
  await analyzeTextStream('Synthetic', 'en', signal(), activity);
  expect(activity).toHaveBeenCalledTimes(128);
});

it('maps terminal error status under HTTP200 to safe local copy', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      sse(
        event('result', {
          ...failure,
          error: { code: 'analysis_timeout', message: 'PRIVATE_PROVIDER_SECRET' },
        }),
      ),
    ),
  );
  await expect(analyzeTextStream('Synthetic', 'en', signal(), vi.fn())).rejects.toThrow(
    'timed out',
  );
});

it('requires explicit citation metadata in live responses while retaining null/empty values', () => {
  for (const field of ['record_id', 'source_urls']) {
    const citation = { ...success.citations[0] } as Record<string, unknown>;
    delete citation[field];
    expect(liveResponseSchema.safeParse({ ...success, citations: [citation] }).success).toBe(false);
  }
  expect(
    liveResponseSchema.safeParse({
      ...success,
      citations: [{ ...success.citations[0], record_id: null, source_urls: [] }],
    }).success,
  ).toBe(true);
});

it('cancels midstream, stops callbacks and closes body', async () => {
  const cancel = vi.fn();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(value) {
            controller = value;
          },
          cancel,
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      ),
    ),
  );
  const abort = new AbortController();
  const activity = vi.fn();
  const result = analyzeTextStream('Synthetic', 'en', abort.signal, activity);
  const rejection = expect(result).rejects.toHaveProperty('name', 'AbortError');
  controller.enqueue(new TextEncoder().encode(event('activity', reading)));
  await vi.waitFor(() => expect(activity).toHaveBeenCalledTimes(1));
  abort.abort();
  await rejection;
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(() => controller.enqueue(new TextEncoder().encode(event('result', success)))).toThrow();
});

it('times out a hung body and never displays a final result before EOF', async () => {
  vi.useFakeTimers();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(value) {
            controller = value;
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      ),
    ),
  );
  const result = analyzeTextStream('Synthetic', 'en', signal(), vi.fn());
  const rejection = expect(result).rejects.toThrow('timed out');
  controller.enqueue(new TextEncoder().encode(event('result', success)));
  await vi.advanceTimersByTimeAsync(ANALYSIS_TIMEOUT_MS);
  await rejection;
});
