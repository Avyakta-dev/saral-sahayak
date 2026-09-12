import { z } from 'zod';

export const languageSchema = z.enum(['en', 'hi', 'kn', 'ta', 'te', 'ml']);
export type Language = z.infer<typeof languageSchema>;
const recordIdSchema = z
  .string()
  .length(11)
  .regex(/^epfo-rr-[0-9]{3}$/);
const citationIdSchema = z
  .string()
  .refine(
    (id) => id.startsWith('ev-') && id.length > 3 && !/[^A-Za-z0-9-]/.test(id),
    'Citation IDs must match ev-[A-Za-z0-9-]+.',
  );
const codePointLength = (text: string) => Array.from(text).length;
const boundedText = (maximum: number) =>
  z.string().refine((text) => {
    const length = codePointLength(text);
    return length >= 1 && length <= maximum;
  }, `Must contain 1–${maximum} Unicode code points.`);

// Mirror backend/output_validation.py without normalizing displayed content.
const nonBlankProse = (text: string) => /[^\p{White_Space}\p{Cf}\p{Cc}]/u.test(text);
const generatedText = (maximum: number) =>
  boundedText(maximum).refine(nonBlankProse, 'Generated prose must not be blank.');

function decodeForLinkCheck(text: string): string {
  // Decode percent bytes tolerantly, like urllib.parse.unquote (including invalid UTF-8).
  const unquoted = text.replace(/(?:%[\da-f]{2})+/gi, (escaped) =>
    new TextDecoder('utf-8', { ignoreBOM: true }).decode(
      Uint8Array.from(escaped.match(/[\da-f]{2}/gi)!, (hex) => parseInt(hex, 16)),
    ),
  );
  return unquoted.replace(/&(?:#[0-9]+;?|#x[\da-f]+;?|[a-z][a-z0-9]{0,31};?)/gi, (entity) => {
    const numeric = /^&#(x[\da-f]+|[0-9]+);?$/i.exec(entity);
    if (numeric) {
      const digits = numeric[1];
      const code = parseInt(
        digits.startsWith('x') || digits.startsWith('X') ? digits.slice(1) : digits,
        /^[xX]/.test(digits) ? 16 : 10,
      );
      // Python html.unescape drops these invalid references, rather than inserting controls.
      if (
        (code >= 1 && code <= 8) ||
        code === 11 ||
        (code >= 14 && code <= 31) ||
        code === 127 ||
        (code >= 0xfdd0 && code <= 0xfdef) ||
        (code <= 0x10ffff && (code & 0xffff) >= 0xfffe)
      )
        return '';
    }
    // Only an entity token (never '<' or markup) enters this detached browser decoder.
    const decoder = document.createElement('textarea');
    decoder.innerHTML = entity;
    // textContent preserves entity-produced CR; textarea.value would normalize it to LF.
    return decoder.textContent ?? '';
  });
}

function normalizedForLinkCheck(text: string): string {
  for (let round = 0; round < 3; round += 1) {
    const decoded = decodeForLinkCheck(text);
    if (decoded === text) break;
    text = decoded;
  }
  return (
    text
      .normalize('NFKC')
      .replace(/\p{Cf}/gu, '')
      // Python re.IGNORECASE also matches dotted/dotless I against ASCII i.
      .replace(/[\u0130\u0131]/gu, 'i')
  );
}

// Python's Unicode word boundaries/whitespace, not JavaScript's ASCII-only \b/\s.
const wordStart = String.raw`(?<![\p{L}\p{N}_])`;
const wordEnd = String.raw`(?![\p{L}\p{N}_])`;
const space = String.raw`[\p{White_Space}\u001c-\u001f]*`;
const linkSyntax = new RegExp(
  String.raw`${wordStart}(?:https?|ftp|file|data|javascript|vbscript|mailto|tel)${space}:` +
    String.raw`|${wordStart}[a-z][a-z0-9+.-]*${space}:${space}[/\\]` +
    String.raw`|[/\\]{2}|${wordStart}www${space}\.` +
    String.raw`|\[[^\]\n]*\]${space}(?:\(|\[|:)` +
    String.raw`|<${space}(?:a|img)${wordEnd}` +
    String.raw`|${wordStart}(?:[a-z0-9-]+\.)+(?:com|org|net|gov|edu|in|io|co|dev|app|info|biz|invalid|test)${wordEnd}`,
  'iu',
);
const linkFreeText = z
  .string()
  .refine(nonBlankProse, 'Generated prose must not be blank.')
  .refine(
    (text) => !linkSyntax.test(normalizedForLinkCheck(text)),
    'Uncited prose must not contain links or URL syntax.',
  );
const boundedLinkFreeText = (maximum: number) => boundedText(maximum).pipe(linkFreeText);

export function safeSourceUrl(url: string): string | null {
  if (/[\u0000-\u0020\u007f\\]/u.test(url)) return null;
  const authority = /^https?:\/\/([^/?#]+)/i.exec(url)?.[1];
  if (!authority || authority.includes('@')) return null;
  try {
    const parsed = new URL(url);
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    )
      return null;
    return url;
  } catch {
    return null;
  }
}

const citationSchema = z
  .object({
    id: citationIdSchema,
    path: z
      .string()
      .refine(
        (path) =>
          path.startsWith('references/knowledge/epfo/') &&
          path.endsWith('.md') &&
          !/[\\%?#:\u0000-\u001f\u007f]/u.test(path) &&
          path.split('/').every((part) => part !== '' && part !== '.' && part !== '..'),
        'Citation must use a canonical public EPFO Markdown path.',
      ),
    record_id: recordIdSchema.nullable().default(null),
    heading: boundedText(300),
    start_line: z.number().int().positive().safe(),
    end_line: z.number().int().positive().safe(),
    start_column: z.number().int().nonnegative().safe().nullable().default(null),
    end_column: z.number().int().nonnegative().safe().nullable().default(null),
    source_urls: z
      .array(
        z
          .string()
          .refine(
            (url) => safeSourceUrl(url) !== null,
            'Source URLs must be HTTP(S) without credentials.',
          ),
      )
      .max(30)
      .default([]),
  })
  .strict()
  .superRefine((citation, context) => {
    if (citation.end_line < citation.start_line) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_line'],
        message: 'Citation line range is reversed.',
      });
    }
    if ((citation.start_column === null) !== (citation.end_column === null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_column'],
        message: 'Citation columns must be supplied together.',
      });
    }
    if (
      citation.start_line === citation.end_line &&
      citation.start_column !== null &&
      citation.end_column !== null &&
      citation.end_column < citation.start_column
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_column'],
        message: 'Citation column range is reversed.',
      });
    }
  });

const supportedTextSchema = z
  .object({
    text: generatedText(6000),
    citation_ids: z.array(citationIdSchema).min(1).max(30),
  })
  .strict();

const draftBlockSchema = z
  .object({
    text: generatedText(6000),
    kind: z.enum(['factual', 'template', 'user_supplied']),
    citation_ids: z.array(citationIdSchema).max(30).default([]),
  })
  .strict()
  .superRefine((block, context) => {
    if (block.kind === 'factual' && block.citation_ids.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['citation_ids'],
        message: 'Factual draft blocks require citations.',
      });
    }
  });

const draftSchema = z
  .object({
    title: generatedText(200),
    blocks: z.array(draftBlockSchema).min(1).max(50),
    missing_fields: z.array(z.string()).max(20).default([]),
  })
  .strict();

const classificationSchema = z
  .object({
    reason_id: recordIdSchema,
    category: boundedLinkFreeText(100),
    confidence: z.enum(['low', 'medium', 'high']),
    rationale: boundedLinkFreeText(1000),
  })
  .strict();

const errorDetailSchema = z
  .object({
    code: boundedText(100),
    message: generatedText(500),
  })
  .strict();

export const responseSchema = z
  .object({
    schema_version: z.literal('1.0').default('1.0'),
    status: z.enum(['success', 'needs_clarification', 'unsupported', 'error']),
    language: languageSchema.default('en'),
    classification: classificationSchema.nullable().default(null),
    explanation: z.array(supportedTextSchema).max(30).default([]),
    actions: z.array(supportedTextSchema).max(30).default([]),
    required_documents: z.array(supportedTextSchema).max(30).default([]),
    draft: draftSchema.nullable().default(null),
    citations: z.array(citationSchema).max(100).default([]),
    warnings: z.array(linkFreeText).max(30).default([]),
    questions: z.array(linkFreeText).max(10).default([]),
    error: errorDetailSchema.nullable().default(null),
  })
  .strict()
  .superRefine((response, context) => {
    const issue = (path: (string | number)[], message: string) =>
      context.addIssue({ code: z.ZodIssueCode.custom, path, message });
    const ids = new Set(response.citations.map((citation) => citation.id));
    if (ids.size !== response.citations.length)
      issue(['citations'], 'Citation IDs must be unique.');

    for (const field of ['explanation', 'actions', 'required_documents'] as const) {
      response[field].forEach((block, index) => {
        if (block.citation_ids.some((id) => !ids.has(id))) {
          issue([field, index, 'citation_ids'], 'Unknown citation reference.');
        }
      });
    }
    response.draft?.blocks.forEach((block, index) => {
      if (block.citation_ids.some((id) => !ids.has(id))) {
        issue(['draft', 'blocks', index, 'citation_ids'], 'Unknown citation reference.');
      }
    });

    if (response.status === 'success') {
      if (!response.classification || !response.explanation.length || !response.citations.length) {
        issue(['status'], 'Success requires classification, explanation and evidence.');
      }
    } else if (
      response.classification ||
      response.explanation.length ||
      response.actions.length ||
      response.required_documents.length ||
      response.draft ||
      response.citations.length
    ) {
      issue(['status'], 'Non-success cannot provide ready-to-use guidance.');
    }
    if (response.status === 'needs_clarification' && !response.questions.length) {
      issue(['questions'], 'Clarification requires questions.');
    }
    if (response.status !== 'needs_clarification' && response.questions.length) {
      issue(['questions'], 'Questions require clarification status.');
    }
    if ((response.status === 'error') !== (response.error !== null)) {
      issue(['error'], 'Error detail must match error status.');
    }
    if (response.status === 'unsupported' && !response.warnings.length) {
      issue(['warnings'], 'Unsupported results require an explanation in warnings.');
    }
  });

export type AnalyzeResponse = z.infer<typeof responseSchema>;
export type Citation = z.infer<typeof citationSchema>;
export type SupportedText = z.infer<typeof supportedTextSchema>;
export type Draft = z.infer<typeof draftSchema>;

const requestBodyBytes = (body: unknown) =>
  new TextEncoder().encode(JSON.stringify(body)).byteLength;
const claimDetail = (maximum: number) =>
  z
    .string()
    .refine(
      (text) => codePointLength(text) <= maximum,
      `Must contain at most ${maximum} Unicode code points.`,
    )
    .nullable()
    .default(null);
const claimDetailsSchema = z
  .object({
    claimant_name: claimDetail(200),
    claim_id: claimDetail(100),
    claim_type: claimDetail(100),
  })
  .strict();

// Validation only: retain original text/details. The backend trims rejection text itself.
// The byte bound includes every field/default in the parsed JSON payload, not just text.
export const requestSchema = z
  .object({
    text: boundedText(8000).refine(
      (text) => !/^[\p{White_Space}\u001c-\u001f]*$/u.test(text),
      'Rejection text must not be blank.',
    ),
    language: languageSchema.default('en'),
    details: claimDetailsSchema.default({}),
  })
  .strict()
  .superRefine((request, context) => {
    if (requestBodyBytes(request) > 32768) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The serialized request exceeds 32,768 UTF-8 bytes. Shorten the text.',
      });
    }
  });
export type AnalyzeRequest = z.infer<typeof requestSchema>;

// Pre-analysis parsing/admission errors are not AnalyzeResponse envelopes.
// The API client separately enforces each code's exact HTTP status.
// A disabled known language instead uses the full responseSchema error envelope.
export const transportErrorSchema = z.union([
  z.object({ detail: z.string().min(1) }).strict(),
  z
    .object({
      error: z
        .object({
          code: z.enum([
            'request_too_large',
            'invalid_request',
            'access_denied',
            'analysis_capacity',
            'request_timeout',
          ]),
          message: z.string().min(1),
        })
        .strict(),
    })
    .strict(),
]);
export type TransportError = z.infer<typeof transportErrorSchema>;

export function validateInput(text: string, language: Language): string | null {
  if (codePointLength(text) > 8000)
    return 'Keep the original text within 8,000 Unicode characters, including surrounding spaces.';
  const trimmed = text.trim();
  // Python also treats these control separators as whitespace; JavaScript trim does not.
  if (!trimmed || /^[\p{White_Space}\u001c-\u001f]*$/u.test(text)) {
    return 'Enter some text; whitespace alone is not enough.';
  }
  if (!languageSchema.safeParse(language).success) return 'Choose a supported language.';
  if (requestBodyBytes({ text: trimmed, language }) > 32768) {
    return 'The serialized request exceeds 32,768 UTF-8 bytes. Shorten the text.';
  }
  return null;
}
