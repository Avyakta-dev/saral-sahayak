import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import successExample from '../../../docs/examples/success.json';
import clarificationExample from '../../../docs/examples/needs_clarification.json';
import unsupportedExample from '../../../docs/examples/unsupported.json';
import errorExample from '../../../docs/examples/error.json';
import { responseSchema } from './contracts';
import {
  demoScenarios,
  getDemoResponse,
  loadDemoResponse,
  sampleText,
  type DemoScenario,
} from './demo';

const examples = {
  success: successExample,
  needs_clarification: clarificationExample,
  unsupported: unsupportedExample,
  error: errorExample,
};
const scenarios: DemoScenario[] = ['success', 'needs_clarification', 'unsupported', 'error'];

describe('synthetic demo fixtures', () => {
  it('provides four English UI labels and a clearly fictional sample', () => {
    expect(demoScenarios.map((scenario) => scenario.value)).toEqual(scenarios);
    for (const scenario of demoScenarios) {
      expect(scenario.label).toMatch(/[A-Za-z]/);
      expect(scenario.description).toMatch(/[A-Za-z]/);
      expect(`${scenario.label} ${scenario.description}`).not.toMatch(/[\u0900-\u097f]/);
    }
    expect(sampleText).toContain('SYNTHETIC DEMO:');
    expect(sampleText).toContain('imaginary claim');
    expect(sampleText).toContain('not a real claim or policy statement');
    expect(sampleText.split('.').filter((sentence) => sentence.trim())).toHaveLength(2);
  });

  describe.each(['en', 'hi'] as const)('%s output', (language) => {
    it.each(scenarios)('validates the %s fixture and retains original warnings', (scenario) => {
      const response = getDemoResponse(scenario, language);
      expect(responseSchema.safeParse(response).success).toBe(true);
      expect(response.status).toBe(scenario);
      expect(response.language).toBe(language);
      expect(response.warnings).toEqual(expect.arrayContaining(examples[scenario].warnings));
      expect(response.citations).toEqual(examples[scenario].citations);
      if (scenario !== 'success') {
        expect(response.classification).toBeNull();
        expect(response.explanation).toEqual([]);
        expect(response.actions).toEqual([]);
        expect(response.required_documents).toEqual([]);
        expect(response.draft).toBeNull();
        expect(response.citations).toEqual([]);
      }
      if (language === 'hi') {
        expect(response.warnings).toContain(
          'Hindi translation demonstration only: preset synthetic content, not live Hindi analysis.',
        );
        expect(response.warnings.join(' ')).toMatch(/केवल हिंदी अनुवाद/);
        expect(
          response.warnings.filter((warning) => /[\u0900-\u097f]/.test(warning)).length,
        ).toBeGreaterThanOrEqual(examples[scenario].warnings.length + 1);
      }
    });
  });

  it.each(['kn', 'ta', 'te', 'ml'])('does not relabel English fixtures as %s', (language) => {
    // @ts-expect-error Runtime callers must also respect the en/hi fixture boundary.
    expect(() => getDemoResponse('success', language)).toThrow();
  });

  it('preserves the intentionally skeletal English success fixture', () => {
    const response = getDemoResponse('success', 'en');
    for (const field of [
      'classification',
      'explanation',
      'actions',
      'required_documents',
      'draft',
      'citations',
    ] as const) {
      expect(response[field]).toEqual(successExample[field]);
    }
    expect(response.warnings.join(' ')).toContain('not policy confidence');
    expect(response.classification?.rationale).toContain('does not assert a real classification');
    expect(response.citations[0].path).toContain('synthetic-examples/schema-only.md');
    expect(response.citations[0].source_urls).toEqual([
      'https://example.invalid/synthetic-evidence',
    ]);
  });

  it('translates displayed Hindi guidance and draft, not citation identifiers or headings', () => {
    const response = getDemoResponse('success', 'hi');
    for (const item of [
      ...response.explanation,
      ...response.actions,
      ...response.required_documents,
    ]) {
      expect(item.text).toContain('काल्पनिक उदाहरण');
      expect(item.citation_ids).toEqual(['ev-synthetic-example']);
    }
    expect(response.classification?.reason_id).toBe(successExample.classification.reason_id);
    expect(response.classification?.confidence).toBe('low');
    expect(response.classification?.rationale).toContain('वास्तविक वर्गीकरण का दावा नहीं');
    expect(response.draft?.title).toContain('जमा करने के लिए नहीं');
    expect(response.draft?.blocks.every((block) => /[\u0900-\u097f]/.test(block.text))).toBe(true);
    expect(response.draft?.blocks[1].text).toContain('CLAIMANT_NAME');
    expect(response.draft?.missing_fields).toEqual(['claimant_name']);
    expect(response.citations).toEqual(successExample.citations);
  });

  it('uses the requested question language and preserves the error code', () => {
    expect(getDemoResponse('needs_clarification', 'hi').questions).toEqual(
      clarificationExample.questions,
    );
    expect(getDemoResponse('needs_clarification', 'en').questions[0]).toContain(
      'imaginary example only',
    );
    expect(getDemoResponse('needs_clarification', 'en').questions.join(' ')).not.toMatch(
      /[\u0900-\u097f]/,
    );
    expect(getDemoResponse('error', 'hi').error?.code).toBe(errorExample.error.code);
    expect(getDemoResponse('error', 'hi').error?.message).toContain('विश्लेषण अभी लागू नहीं');
  });

  it('returns independent objects without mutating imports or other languages', () => {
    const before = JSON.stringify(examples);
    const first = getDemoResponse('success', 'hi');
    first.warnings.push('Mutation');
    first.explanation[0].text = 'Mutation';
    first.citations[0].source_urls.push('https://example.invalid/mutated');
    first.draft!.blocks[0].text = 'Mutation';
    const second = getDemoResponse('success', 'hi');
    expect(second.warnings).not.toContain('Mutation');
    expect(second.explanation[0].text).not.toBe('Mutation');
    expect(second.draft?.blocks[0].text).not.toBe('Mutation');
    expect(second.citations).toEqual(successExample.citations);
    expect(getDemoResponse('success', 'en').explanation).toEqual(successExample.explanation);
    expect(JSON.stringify(examples)).toBe(before);
  });
});

describe('loadDemoResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('Demo must never fetch.');
      }),
    );
  });

  afterEach(() => {
    expect(fetch).not.toHaveBeenCalled();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(scenarios)('returns the preset %s response after exactly 700ms', async (scenario) => {
    const controller = new AbortController();
    const settled = vi.fn();
    const promise = loadDemoResponse(scenario, 'en', controller.signal);
    void promise.then(settled);
    await vi.advanceTimersByTimeAsync(699);
    expect(settled).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toEqual(getDemoResponse(scenario, 'en'));
    expect(settled).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('supports Hindi output without a translation service', async () => {
    const promise = loadDemoResponse('success', 'hi', new AbortController().signal);
    await vi.advanceTimersByTimeAsync(700);
    await expect(promise).resolves.toEqual(getDemoResponse('success', 'hi'));
  });

  it('rejects an already-aborted signal without scheduling work', async () => {
    const controller = new AbortController();
    controller.abort('Synthetic cancellation');
    const addListener = vi.spyOn(controller.signal, 'addEventListener');
    await expect(loadDemoResponse('success', 'en', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(addListener).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the timer and listener when aborted during the delay', async () => {
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, 'removeEventListener');
    const promise = loadDemoResponse('success', 'en', controller.signal);
    const rejection = expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(350);
    controller.abort();
    await rejection;
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(1000);
  });

  it('does not return a stale result if aborted as the delay completes', async () => {
    const controller = new AbortController();
    const promise = loadDemoResponse('success', 'en', controller.signal);
    const rejection = expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    vi.advanceTimersByTime(700);
    controller.abort();
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes the abort listener on successful completion', async () => {
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, 'removeEventListener');
    const promise = loadDemoResponse('unsupported', 'en', controller.signal);
    await vi.advanceTimersByTimeAsync(700);
    await expect(promise).resolves.toHaveProperty('status', 'unsupported');
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function));
    controller.abort();
    await expect(promise).resolves.toHaveProperty('status', 'unsupported');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels one pending preview without affecting another', async () => {
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first = loadDemoResponse('success', 'en', firstController.signal);
    const rejection = expect(first).rejects.toMatchObject({ name: 'AbortError' });
    const second = loadDemoResponse('error', 'hi', secondController.signal);
    firstController.abort();
    await rejection;
    await vi.advanceTimersByTimeAsync(700);
    await expect(second).resolves.toEqual(getDemoResponse('error', 'hi'));
    expect(vi.getTimerCount()).toBe(0);
  });
});
