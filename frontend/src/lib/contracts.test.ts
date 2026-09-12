import { describe, expect, it } from 'vitest';
import successExample from '../../../docs/examples/success.json';
import clarificationExample from '../../../docs/examples/needs_clarification.json';
import unsupportedExample from '../../../docs/examples/unsupported.json';
import errorExample from '../../../docs/examples/error.json';
import { responseSchema, safeSourceUrl, validateInput, type Language } from './contracts';

const examples = [successExample, clarificationExample, unsupportedExample, errorExample];
const freshSuccess = () => responseSchema.parse(successExample);
const unsafeUrls = [
  'javascript:alert(1)',
  'data:text/html,test',
  'file:///etc/passwd',
  'ftp://example.invalid/test',
  '//example.invalid/test',
  '/relative',
  'https:',
  'https:///example.invalid',
  'https://',
  'https://user:secret@example.invalid/',
  'https://user@example.invalid/',
  'https://:secret@example.invalid/',
  'https://@example.invalid/',
  'https://%75ser@example.invalid/',
  'https://example.invalid@evil.invalid/',
  'https://example.invalid\\@evil.invalid/',
  'https:\\example.invalid',
  ' https://example.invalid/',
  'https://example.invalid/\n',
  'https://exam\tple.invalid/',
  'https://example.invalid/\u0000',
  'https://example.invalid:99999/',
];

const unsafePaths = [
  '/etc/example.md',
  'C:/example.md',
  '//example.invalid/file.md',
  'references/knowledge/epfo-other/file.md',
  'references/knowledge/epfo/../private.md',
  'references/knowledge/epfo/./file.md',
  'references/knowledge/epfo//file.md',
  'references/knowledge/epfo/a/../../file.md',
  'references/knowledge/epfo/..\\private.md',
  'references/knowledge/epfo/%2e%2e/file.md',
  'references/knowledge/epfo/%252e%252e/file.md',
  'references/knowledge/epfo/a%2fb.md',
  'references/knowledge/epfo/a%5cb.md',
  'references/knowledge/epfo/file.json',
  'references/knowledge/epfo/file.MD',
  'references/knowledge/epfo/file.md?other=.md',
  'references/knowledge/epfo/file.md#other.md',
  'references/knowledge/epfo/file:stream.md',
  'references/knowledge/epfo/a\u0000.md',
  'references/knowledge/epfo/a\n.md',
  'references/knowledge/epfo/file.md/',
];

describe('responseSchema', () => {
  it.each(examples)('accepts the documented $status fixture', (example) => {
    expect(responseSchema.parse(example)).toEqual(example);
  });

  it('supplies the same optional defaults as the backend', () => {
    expect(
      responseSchema.parse({ status: 'unsupported', warnings: ['Synthetic limitation.'] }),
    ).toEqual({
      schema_version: '1.0',
      status: 'unsupported',
      language: 'en',
      classification: null,
      explanation: [],
      actions: [],
      required_documents: [],
      draft: null,
      citations: [],
      warnings: ['Synthetic limitation.'],
      questions: [],
      error: null,
    });
  });

  it.each(['classification', 'explanation', 'citations'] as const)(
    'requires success %s',
    (field) => {
      const value = { ...freshSuccess(), [field]: field === 'classification' ? null : [] };
      expect(responseSchema.safeParse(value).success).toBe(false);
    },
  );

  it.each([clarificationExample, unsupportedExample, errorExample])(
    'rejects all guidance in $status',
    (example) => {
      for (const field of [
        'classification',
        'explanation',
        'actions',
        'required_documents',
        'draft',
        'citations',
      ] as const) {
        expect(
          responseSchema.safeParse({ ...example, [field]: successExample[field] }).success,
          field,
        ).toBe(false);
      }
    },
  );

  it.each([
    { ...clarificationExample, questions: [] },
    { ...unsupportedExample, warnings: [] },
    { ...errorExample, error: null },
    { ...successExample, questions: ['Synthetic question?'] },
    { ...unsupportedExample, questions: ['Synthetic question?'] },
    { ...errorExample, questions: ['Synthetic question?'] },
    { ...successExample, error: errorExample.error },
    { ...unsupportedExample, error: errorExample.error },
    { ...clarificationExample, error: errorExample.error },
    { ...errorExample, status: 'pending' },
    { ...errorExample, schema_version: '2.0' },
    { ...errorExample, language: 'fr' },
  ])('rejects inconsistent state %#', (value) => {
    expect(responseSchema.safeParse(value).success).toBe(false);
  });

  it.each(
    [
      [],
      ['classification'],
      ['explanation', 0],
      ['actions', 0],
      ['required_documents', 0],
      ['draft'],
      ['draft', 'blocks', 0],
      ['citations', 0],
    ].map((path) => ({ path })),
  )('rejects unknown object fields at path $path', ({ path }) => {
    const response = freshSuccess();
    let object: unknown = response;
    for (const key of path) object = (object as Record<string | number, unknown>)[key];
    const target = object as Record<string, unknown>;
    target.unexpected = 'not allowed';
    expect(responseSchema.safeParse(response).success).toBe(false);
  });

  it('rejects unknown error fields and non-object transport envelopes', () => {
    expect(
      responseSchema.safeParse({
        ...errorExample,
        error: { ...errorExample.error, debug: 'private' },
      }).success,
    ).toBe(false);
    for (const input of [
      null,
      [],
      'success',
      { error: { code: 'invalid_request', message: 'Invalid input.' } },
    ]) {
      expect(responseSchema.safeParse(input).success).toBe(false);
    }
  });

  it.each(['explanation', 'actions', 'required_documents'] as const)(
    'requires known evidence for %s',
    (field) => {
      for (const ids of [[], ['ev-unknown'], ['ev-synthetic-example', 'ev-unknown']]) {
        const response = freshSuccess();
        response[field][0].citation_ids = ids;
        expect(responseSchema.safeParse(response).success).toBe(false);
      }
      const response = freshSuccess();
      expect(
        responseSchema.safeParse({ ...response, [field]: [{ text: 'Synthetic text.' }] }).success,
      ).toBe(false);
    },
  );

  it('rejects duplicate citation IDs and uncited factual drafts', () => {
    const response = freshSuccess();
    response.citations.push(response.citations[0]);
    expect(responseSchema.safeParse(response).success).toBe(false);
    const draft = freshSuccess();
    draft.draft!.blocks[0].citation_ids = [];
    expect(responseSchema.safeParse(draft).success).toBe(false);
  });

  it.each(['factual', 'template', 'user_supplied'] as const)(
    'checks citation references even in %s drafts',
    (kind) => {
      const response = freshSuccess();
      response.draft!.blocks = [{ kind, text: 'Synthetic block.', citation_ids: ['ev-missing'] }];
      expect(responseSchema.safeParse(response).success).toBe(false);
    },
  );

  it.each(['template', 'user_supplied'] as const)('allows uncited %s draft blocks', (kind) => {
    const response = freshSuccess();
    response.draft!.blocks = [{ kind, text: 'Synthetic placeholder only.', citation_ids: [] }];
    expect(responseSchema.safeParse(response).success).toBe(true);
  });

  it.each(unsafePaths)('rejects unsafe Markdown path %j', (path) => {
    const response = freshSuccess();
    response.citations[0].path = path;
    expect(responseSchema.safeParse(response).success).toBe(false);
  });

  it.each(unsafeUrls)('rejects unsafe citation URL %j', (url) => {
    const response = freshSuccess();
    response.citations[0].source_urls = [url];
    expect(responseSchema.safeParse(response).success).toBe(false);
  });

  it.each([
    { start_line: 0 },
    { end_line: 0 },
    { start_line: 1.5 },
    { start_line: '1' },
    { start_line: 2, end_line: 1 },
    { start_line: Infinity },
    { end_line: Number.MAX_SAFE_INTEGER + 1 },
    { heading: '' },
    { heading: 'x'.repeat(301) },
    { id: 'bad-id' },
    { id: 'ev-' },
    { id: 'ev-synthetic-example\n' },
    { record_id: 'epfo-rr-001\n' },
    { record_id: 'epfo-rr-1' },
    { record_id: 'made-up' },
    { source_urls: Array(31).fill('https://example.invalid/') },
  ])('rejects malformed citation %#', (patch) => {
    const response = freshSuccess();
    expect(
      responseSchema.safeParse({ ...response, citations: [{ ...response.citations[0], ...patch }] })
        .success,
    ).toBe(false);
  });

  it.each([
    {},
    { start_column: null, end_column: null },
    { start_line: 1, end_line: 1, start_column: 0, end_column: 12 },
    { start_line: 1, end_line: 2, start_column: 12, end_column: 0 },
  ])('accepts optional citation columns %#', (patch) => {
    const response = freshSuccess();
    Object.assign(response.citations[0], patch);
    expect(responseSchema.safeParse(response).success).toBe(true);
  });

  it.each([
    { start_column: 0 },
    { end_column: 1 },
    { start_column: 0, end_column: null },
    { start_column: -1, end_column: 1 },
    { start_column: 0.5, end_column: 1 },
    { start_column: '0', end_column: 1 },
    { start_column: 0, end_column: Infinity },
    { start_column: 0, end_column: Number.MAX_SAFE_INTEGER + 1 },
    { start_line: 1, end_line: 1, start_column: 2, end_column: 1 },
  ])('rejects malformed citation columns %#', (patch) => {
    const response = freshSuccess();
    Object.assign(response.citations[0], patch);
    expect(responseSchema.safeParse(response).success).toBe(false);
  });

  it('permits supporting documents without record IDs or source URLs, without asserting fidelity', () => {
    const response = freshSuccess();
    response.citations[0].path = 'references/knowledge/epfo/glossary.md';
    response.citations[0].source_urls = [];
    expect(responseSchema.safeParse(response).success).toBe(true);
  });

  it('preserves backend acceptance of whitespace-only response text', () => {
    const response = freshSuccess();
    response.explanation[0].text = ' ';
    response.citations[0].heading = ' ';
    expect(responseSchema.safeParse(response).success).toBe(true);
  });

  it('counts response strings by Unicode code points, not UTF-16 units', () => {
    const response = freshSuccess();
    response.explanation[0].text = '😀'.repeat(6000);
    response.citations[0].heading = '😀'.repeat(300);
    expect(responseSchema.safeParse(response).success).toBe(true);
    response.explanation[0].text += '😀';
    expect(responseSchema.safeParse(response).success).toBe(false);
  });

  it('limits collection sizes and accepts classification confidence labels, not probabilities', () => {
    const response = freshSuccess();
    for (const confidence of [0.95, 'supported', 'certain']) {
      expect(
        responseSchema.safeParse({
          ...response,
          classification: { ...response.classification, confidence },
        }).success,
      ).toBe(false);
    }
    for (const confidence of ['low', 'medium', 'high']) {
      expect(
        responseSchema.safeParse({
          ...response,
          classification: { ...response.classification, confidence },
        }).success,
      ).toBe(true);
    }
    for (const field of ['explanation', 'actions', 'required_documents', 'warnings'] as const) {
      expect(
        responseSchema.safeParse({ ...response, [field]: Array(31).fill(response[field][0]) })
          .success,
      ).toBe(false);
    }
    expect(
      responseSchema.safeParse({
        ...clarificationExample,
        questions: Array(11).fill('Synthetic question?'),
      }).success,
    ).toBe(false);
    expect(
      responseSchema.safeParse({ ...response, draft: { ...response.draft, blocks: [] } }).success,
    ).toBe(false);
    expect(
      responseSchema.safeParse({
        ...response,
        draft: { ...response.draft, missing_fields: Array(21).fill('synthetic') },
      }).success,
    ).toBe(false);
  });
});

describe('safeSourceUrl', () => {
  it.each(unsafeUrls)('blocks %j', (url) => {
    expect(safeSourceUrl(url)).toBeNull();
  });

  it.each([
    'https://example.invalid/synthetic-evidence',
    'http://example.invalid/sample',
    'HTTPS://example.invalid/sample?q=synthetic%20only#heading',
    'https://example.invalid/a@b',
    'https://[::1]:8443/sample',
  ])('preserves safe original URL %j', (url) => {
    expect(safeSourceUrl(url)).toBe(url);
  });
});

describe('validateInput', () => {
  it.each([
    '',
    ' ',
    '\t\r\n',
    '\u00a0\u2003\u3000',
    '\u0085',
    '\u001c\u001d\u001e\u001f',
    '\ufeff',
  ])('rejects blank input %j', (text) => {
    expect(validateInput(text, 'en')).toMatch(/text|whitespace/i);
  });

  it.each(['en', 'hi', 'kn', 'ta', 'te', 'ml'] as const)(
    'accepts text in %s without echoing it in errors',
    (language) => {
      expect(validateInput('  SYNTHETIC DEMO only.  ', language)).toBeNull();
      expect(validateInput('काल्पनिक परीक्षण', language)).toBeNull();
      const text = 'SYNTHETIC_SECRET'.repeat(8000);
      expect(validateInput(text, language)).not.toContain('SYNTHETIC_SECRET');
    },
  );

  it('enforces the original codepoint length before trimming', () => {
    expect(validateInput('x'.repeat(8000), 'en')).toBeNull();
    expect(validateInput('x'.repeat(8001), 'en')).toMatch(/8,000/);
    expect(validateInput(` ${'x'.repeat(7999)}`, 'en')).toBeNull();
    expect(validateInput(` ${'x'.repeat(8000)}`, 'en')).toMatch(/8,000/);
    expect(validateInput(' '.repeat(8001), 'en')).toMatch(/8,000/);
    expect(validateInput('😀'.repeat(8000), 'hi')).toBeNull();
    expect(validateInput('😀'.repeat(8001), 'hi')).toMatch(/8,000/);
    expect(validateInput('e\u0301'.repeat(4000), 'en')).toBeNull();
    expect(validateInput('e\u0301'.repeat(4001), 'en')).toMatch(/8,000/);
  });

  it.each(['en', 'hi', 'kn', 'ta', 'te', 'ml'] as const)(
    'enforces inclusive serialized UTF-8 byte limits in %s',
    (language) => {
      const overhead = new TextEncoder().encode(JSON.stringify({ text: '', language })).byteLength;
      const available = 32768 - overhead;
      const text = '\u0000'.repeat(Math.floor(available / 6)) + 'x'.repeat(available % 6);
      expect(Array.from(text).length).toBeLessThan(8000);
      expect(new TextEncoder().encode(JSON.stringify({ text, language })).byteLength).toBe(32768);
      expect(validateInput(text, language)).toBeNull();
      expect(validateInput(text + 'x', language)).toMatch(/32,768/);
      expect(validateInput(`  ${text}  `, language)).toBeNull();
    },
  );

  it('counts JSON escapes rather than raw text bytes', () => {
    const text = '\u0000'.repeat(6000);
    expect(new TextEncoder().encode(text).byteLength).toBe(6000);
    expect(validateInput(text, 'en')).toMatch(/32,768/);
    expect(validateInput('"\\'.repeat(4000), 'en')).toBeNull();
  });

  it('rejects unsupported runtime language values', () => {
    expect(validateInput('Synthetic text.', 'fr' as Language)).toMatch(/supported output language/);
  });
});
