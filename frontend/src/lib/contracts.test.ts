import { describe, expect, it } from 'vitest';
import successExample from '../../../docs/examples/success.json';
import clarificationExample from '../../../docs/examples/needs_clarification.json';
import unsupportedExample from '../../../docs/examples/unsupported.json';
import errorExample from '../../../docs/examples/error.json';
import {
  languageSchema,
  requestSchema,
  responseSchema,
  safeSourceUrl,
  transportErrorSchema,
  validateInput,
  type Language,
} from './contracts';

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
    expect(responseSchema.parse(example)).toEqual({
      ...example,
      citations: example.citations.map((citation) => ({
        ...citation,
        start_column: null,
        end_column: null,
      })),
    });
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

  it('permits supporting documents without record IDs or source URLs, without asserting fidelity', () => {
    const response = freshSuccess();
    response.citations[0].path = 'references/knowledge/epfo/glossary.md';
    response.citations[0].source_urls = [];
    expect(responseSchema.safeParse(response).success).toBe(true);
  });

  it('rejects whitespace-only generated prose without restricting citation headings', () => {
    const response = freshSuccess();
    response.citations[0].heading = ' ';
    expect(responseSchema.safeParse(response).success).toBe(true);
    response.explanation[0].text = ' ';
    expect(responseSchema.safeParse(response).success).toBe(false);
  });

  it('supplies nested citation and draft defaults without adding unsupported restrictions', () => {
    const response = freshSuccess();
    const citation = response.citations[0];
    const parsed = responseSchema.parse({
      ...response,
      citations: [
        {
          id: citation.id,
          path: citation.path,
          heading: '\u0000',
          start_line: 1,
          end_line: 1,
        },
      ],
      draft: { title: 'Synthetic draft.', blocks: [{ kind: 'template', text: '...' }] },
    });
    expect(parsed.citations[0]).toEqual({
      id: citation.id,
      path: citation.path,
      heading: '\u0000',
      start_line: 1,
      end_line: 1,
      record_id: null,
      start_column: null,
      end_column: null,
      source_urls: [],
    });
    expect(parsed.draft).toEqual({
      title: 'Synthetic draft.',
      blocks: [{ kind: 'template', text: '...', citation_ids: [] }],
      missing_fields: [],
    });
    expect(
      responseSchema.parse({ status: 'error', error: { code: ' ', message: '...' } }),
    ).toMatchObject({ warnings: [], questions: [], error: { code: ' ', message: '...' } });
  });

  it.each([
    { columns: {}, valid: true },
    { columns: { start_column: null, end_column: null }, valid: true },
    { columns: { start_column: null }, valid: true },
    { columns: { end_column: null }, valid: true },
    { columns: { start_column: 0, end_column: 0 }, valid: true },
    { columns: { start_column: 0, end_column: 12 }, valid: true },
    { columns: { start_column: 12, end_column: 0, end_line: 2 }, valid: true },
    { columns: { start_column: 0 }, valid: false },
    { columns: { end_column: 12 }, valid: false },
    { columns: { start_column: null, end_column: 12 }, valid: false },
    { columns: { start_column: -1, end_column: 12 }, valid: false },
    { columns: { start_column: 0, end_column: -1 }, valid: false },
    { columns: { start_column: 12, end_column: 0 }, valid: false },
    { columns: { start_column: 0.5, end_column: 12 }, valid: false },
    { columns: { start_column: 0, end_column: '12' }, valid: false },
    { columns: { start_column: 0, end_column: Infinity }, valid: false },
    { columns: { start_column: 0, end_column: Number.MAX_SAFE_INTEGER + 1 }, valid: false },
  ])('validates paired citation columns %#', ({ columns, valid }) => {
    const response = freshSuccess();
    expect(
      responseSchema.safeParse({
        ...response,
        citations: [{ ...response.citations[0], ...columns }],
      }).success,
    ).toBe(valid);
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

const linkFreeCases = (text: string) => [
  { ...successExample, classification: { ...successExample.classification, category: text } },
  { ...successExample, classification: { ...successExample.classification, rationale: text } },
  { status: 'unsupported', warnings: [text] },
  { status: 'needs_clarification', questions: [text] },
];
const nonBlankCases = (text: string) => [
  ...['explanation', 'actions', 'required_documents'].map((field) => ({
    ...successExample,
    [field]: [{ text, citation_ids: ['ev-synthetic-example'] }],
  })),
  ...['factual', 'template', 'user_supplied'].map((kind) => ({
    ...successExample,
    draft: {
      title: 'Synthetic draft.',
      blocks: [{ text, kind, citation_ids: ['ev-synthetic-example'] }],
    },
  })),
  { ...successExample, draft: { ...successExample.draft, title: text } },
  { status: 'error', error: { code: 'synthetic', message: text } },
];

describe('generated prose validation mirrors backend output security', () => {
  it.each(['', ' ', '\n\t', '\u00a0', '\u0085', '\u200b\ufeff', '\u0000', '\u001c\u001f'])(
    'rejects blank/control-only generated text %j',
    (text) => {
      for (const value of [...linkFreeCases(text), ...nonBlankCases(text)]) {
        expect(responseSchema.safeParse(value).success).toBe(false);
      }
    },
  );

  it.each([
    'https://unread.example/path',
    'http:///malformed',
    'https://user:secret@example.org/',
    'www.example.com',
    '//example.org/',
    'javascript:alert(1)',
    'data:image/png;base64,AAA',
    'file:///etc/passwd',
    '[click](/relative)',
    '[click][ref]',
    '[ref]: /relative',
    '[click&#13;here](/relative)',
    '[click&unknown\rtext](/relative)',
    '<a href="/login">click</a>',
    '<img src="/image">',
    'https%3A%2F%2Fexample.org',
    'https&#58;//example.org',
    'h\u200bttps://example.org',
    'https:\\example.org',
    'visit evil.com',
    'mailto:someone@example.org',
    'ftp:sample',
    'tel:123',
    'vbscript:sample',
    'custom+app:\\relative',
    '\\\\relative',
    'https%253A%252F%252Fexample.org',
    'https%25253A%25252F%25252Fexample.org',
    'https&amp;#58;&sol;&sol;example.org',
    'https&colon;&sol;&sol;example.org',
    'ｈｔｔｐｓ：／／ｅｘａｍｐｌｅ．ｏｒｇ',
    '&lt;a href="/login"&gt;click',
    'htt&#1;ps:sample',
    'https\u0085:sample',
    'https%3A%FF',
    'https&#x3a;sample',
    'ｖｉｓｉｔ ｅｖｉｌ．ｃｏｍ',
    'vbscrıpt:sample',
    'fİle:sample',
    'https&#58sample',
    'unicode डाटाtel: sample', // Python treats the preceding vowel mark as non-word.
  ])('rejects link syntax in uncited fields %j', (text) => {
    for (const value of linkFreeCases(text)) {
      expect(responseSchema.safeParse(value).success).toBe(false);
    }
  });

  it.each([
    'Check Form 19 and your UAN.',
    'नाम का विवरण जाँचें।',
    'ಹೆಸರನ್ನು ಪರಿಶೀಲಿಸಿ.',
    'பெயரைச் சரிபார்க்கவும்.',
    'పేరును తనిఖీ చేయండి.',
    'പേര് പരിശോധിക്കുക.',
    'Use 2.5 years as the test value.',
    '...',
    '!? — ।',
    'क्\u200dष',
    'content\u0000inside\u200btext',
    'Note: (sample) [placeholder]',
    'literal 100% &amp; sample',
    'https%2525253Asample', // Like the backend, decoding stops after three rounds.
    'unicode कtel: sample',
  ])('preserves legitimate prose and punctuation exactly %j', (text) => {
    const padded = `  ${text}  `;
    for (const value of [...linkFreeCases(padded), ...nonBlankCases(padded)]) {
      const result = responseSchema.parse(value);
      expect(JSON.stringify(result)).toContain(JSON.stringify(padded));
    }
  });

  it('does not apply link-free checks to other response fields or infer evidence fidelity', () => {
    const text = 'https://example.invalid/synthetic';
    for (const value of nonBlankCases(text)) {
      expect(responseSchema.safeParse(value).success).toBe(true);
    }
    const response = freshSuccess();
    response.citations[0].heading = '[source](https://example.invalid/)';
    response.draft!.missing_fields = ['', ' ', '\u0000', text];
    expect(responseSchema.safeParse(response).success).toBe(true);
    expect(
      responseSchema.safeParse({
        status: 'unsupported',
        warnings: ['x'.repeat(7000)],
      }).success,
    ).toBe(true);
    expect(
      responseSchema.safeParse({
        status: 'needs_clarification',
        questions: ['x'.repeat(7000)],
      }).success,
    ).toBe(true);
  });

  it('bounds classification by code points, without trimming to pass the limit', () => {
    for (const [field, maximum] of [
      ['category', 100],
      ['rationale', 1000],
    ] as const) {
      const value = {
        ...successExample,
        classification: {
          ...successExample.classification,
          [field]: '𐐀'.repeat(maximum),
        },
      };
      expect(responseSchema.safeParse(value).success).toBe(true);
      value.classification[field] += ' ';
      expect(responseSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe('requestSchema', () => {
  it('defaults missing language and nullable details, retaining original text', () => {
    expect(requestSchema.parse({ text: '  Synthetic only.  ' })).toEqual({
      text: '  Synthetic only.  ',
      language: 'en',
      details: { claimant_name: null, claim_id: null, claim_type: null },
    });
    expect(requestSchema.parse({ text: 'Synthetic', details: { claim_id: '' } }).details).toEqual({
      claimant_name: null,
      claim_id: '',
      claim_type: null,
    });
  });

  it.each(languageSchema.options)(
    'accepts %s in both request and response contracts',
    (language) => {
      expect(requestSchema.parse({ text: 'Synthetic only.', language }).language).toBe(language);
      expect(responseSchema.parse({ ...successExample, language }).language).toBe(language);
    },
  );

  it.each([
    {},
    { text: '' },
    { text: ' \n\t\u0085\u001c' },
    { text: null },
    { text: 123 },
    { text: 'x'.repeat(8001) },
    { text: ` ${'x'.repeat(8000)}` },
    { text: 'Synthetic', language: 'fr' },
    { text: 'Synthetic', language: null },
    { text: 'Synthetic', unexpected: true },
    { text: 'Synthetic', details: null },
    { text: 'Synthetic', details: { unexpected: true } },
    { text: 'Synthetic', details: { claim_id: 123 } },
  ])('rejects malformed requests %#', (value) => {
    expect(requestSchema.safeParse(value).success).toBe(false);
  });

  it('applies no generated-prose or link-free rules to user input/details', () => {
    for (const text of ['\u0000', '\u200b', '\ufeff', 'https://example.invalid/', '...']) {
      const details = { claimant_name: ' ', claim_id: '', claim_type: '\u0000' };
      expect(requestSchema.parse({ text, details })).toEqual({ text, details, language: 'en' });
    }
  });

  it('uses inclusive code-point limits for text and each detail', () => {
    expect(requestSchema.safeParse({ text: '𐐀'.repeat(8000) }).success).toBe(true);
    expect(requestSchema.safeParse({ text: '𐐀'.repeat(8001) }).success).toBe(false);
    for (const [field, maximum] of [
      ['claimant_name', 200],
      ['claim_id', 100],
      ['claim_type', 100],
    ] as const) {
      const details = { [field]: '𐐀'.repeat(maximum) };
      expect(requestSchema.safeParse({ text: 'Synthetic', details }).success).toBe(true);
      details[field] += '𐐀';
      expect(requestSchema.safeParse({ text: 'Synthetic', details }).success).toBe(false);
    }
  });

  it('bounds serialized UTF-8 including details/defaults, escapes and original spaces', () => {
    const base = requestSchema.parse({ text: 'x' });
    const overhead = new TextEncoder().encode(JSON.stringify({ ...base, text: '' })).byteLength;
    const available = 32768 - overhead;
    const text = '\u0000'.repeat(Math.floor(available / 6)) + 'x'.repeat(available % 6);
    const payload = { ...base, text };
    expect(new TextEncoder().encode(JSON.stringify(payload)).byteLength).toBe(32768);
    expect(requestSchema.parse(payload)).toEqual(payload);
    expect(requestSchema.safeParse({ ...payload, text: text + 'x' }).success).toBe(false);
    expect(requestSchema.safeParse({ ...payload, text: ` ${text} ` }).success).toBe(false);
    expect(
      requestSchema.safeParse({
        text: '𐐀'.repeat(8000),
        details: { claimant_name: '𐐀'.repeat(200) },
      }).success,
    ).toBe(false);
  });
});

describe('transportErrorSchema (offline body examples, no HTTP)', () => {
  it.each([
    { status: 400, body: { detail: 'There was an error parsing the body' } },
    {
      status: 413,
      body: { error: { code: 'request_too_large', message: 'Request exceeds 32 KiB.' } },
    },
    {
      status: 422,
      body: {
        error: { code: 'invalid_request', message: 'Request does not match the API schema.' },
      },
    },
  ])('accepts the documented $status body separately from analysis results', ({ body }) => {
    expect(transportErrorSchema.parse(body)).toEqual(body);
    expect(responseSchema.safeParse(body).success).toBe(false);
  });

  it.each([
    null,
    [],
    'error',
    {},
    { detail: [] },
    { detail: '' },
    { detail: 'error', debug: 'private' },
    { error: { code: 'invalid_request' } },
    { error: { code: 'invalid_request', message: '' } },
    { error: { code: 'invalid_request', message: 'Invalid.', input: 'private' } },
    { error: { code: 'language_disabled', message: 'Disabled.' } },
    errorExample,
  ])('rejects malformed or full analysis envelopes %#', (body) => {
    expect(transportErrorSchema.safeParse(body).success).toBe(false);
  });

  it('keeps disabled-language errors in the full analysis contract', () => {
    const body = {
      status: 'error',
      language: 'kn',
      error: {
        code: 'language_disabled',
        message: 'The selected language is disabled.',
      },
    };
    expect(responseSchema.safeParse(body).success).toBe(true);
    expect(transportErrorSchema.safeParse(body).success).toBe(false);
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

  it.each(languageSchema.options)('accepts text in %s without echoing it in errors', (language) => {
    expect(validateInput('  SYNTHETIC DEMO only.  ', language)).toBeNull();
    expect(validateInput('काल्पनिक परीक्षण', language)).toBeNull();
    const text = 'SYNTHETIC_SECRET'.repeat(8000);
    expect(validateInput(text, language)).not.toContain('SYNTHETIC_SECRET');
  });

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

  it.each(languageSchema.options)(
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
    expect(validateInput('Synthetic text.', 'fr' as Language)).toMatch(/supported language/);
  });
});
