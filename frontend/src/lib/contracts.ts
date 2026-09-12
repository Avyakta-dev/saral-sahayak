import { z } from 'zod';

export type Language = 'en' | 'hi';

const languageSchema = z.enum(['en', 'hi']);
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
    start_column: z.number().int().nonnegative().safe().nullable().optional(),
    end_column: z.number().int().nonnegative().safe().nullable().optional(),
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
    const hasStart = citation.start_column !== undefined && citation.start_column !== null;
    const hasEnd = citation.end_column !== undefined && citation.end_column !== null;
    if (hasStart !== hasEnd) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_column'],
        message: 'Citation columns must be supplied together.',
      });
    }
    if (
      hasStart &&
      hasEnd &&
      citation.start_line === citation.end_line &&
      citation.end_column! < citation.start_column!
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
    text: boundedText(6000),
    citation_ids: z.array(citationIdSchema).min(1).max(30),
  })
  .strict();

const draftBlockSchema = z
  .object({
    text: boundedText(6000),
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
    title: boundedText(200),
    blocks: z.array(draftBlockSchema).min(1).max(50),
    missing_fields: z.array(z.string()).max(20).default([]),
  })
  .strict();

const classificationSchema = z
  .object({
    reason_id: recordIdSchema,
    category: boundedText(100),
    confidence: z.enum(['low', 'medium', 'high']),
    rationale: boundedText(1000),
  })
  .strict();

const errorDetailSchema = z
  .object({
    code: boundedText(100),
    message: boundedText(500),
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
    warnings: z.array(z.string()).max(30).default([]),
    questions: z.array(z.string()).max(10).default([]),
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

export function validateInput(text: string, language: Language): string | null {
  if (codePointLength(text) > 8000)
    return 'Keep the original text within 8,000 Unicode characters, including surrounding spaces.';
  const trimmed = text.trim();
  // Python also treats these control separators as whitespace; JavaScript trim does not.
  if (!trimmed || /^[\p{White_Space}\u001c-\u001f]*$/u.test(text)) {
    return 'Enter some text; whitespace alone is not enough.';
  }
  if (!languageSchema.safeParse(language).success) return 'Choose English or Hindi.';
  const body = JSON.stringify({ text: trimmed, language });
  if (new TextEncoder().encode(body).byteLength > 32768) {
    return 'The serialized request exceeds 32,768 UTF-8 bytes. Shorten the text.';
  }
  return null;
}
