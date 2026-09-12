import { z } from 'zod';

export type Language = 'en' | 'hi';

export const outputLanguageSchema = z.enum(['en', 'hi', 'kn', 'ta', 'te', 'ml']);
export type OutputLanguage = z.infer<typeof outputLanguageSchema>;
const languageSchema = outputLanguageSchema;
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
    if (
      (citation.start_column == null) !== (citation.end_column == null) ||
      (citation.start_line === citation.end_line &&
        citation.start_column != null &&
        citation.end_column != null &&
        citation.end_column < citation.start_column)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_column'],
        message: 'Citation columns must be paired and ordered on a single line.',
      });
    }
    if (citation.end_line < citation.start_line) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_line'],
        message: 'Citation line range is reversed.',
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

const checksSchema = z
  .object({
    model_configured: z.boolean(),
    model_connectivity_verified: z.literal(false),
    knowledge_index_present: z.boolean(),
    knowledge_structure_ready: z.boolean(),
    knowledge_content_verified: z.literal(false),
    agent_implemented: z.literal(true),
  })
  .strict();

export const capabilitiesSchema = z
  .object({
    schema_version: z.literal('1.0'),
    default_language: z.literal('en'),
    languages: z
      .array(
        z
          .object({
            code: outputLanguageSchema,
            name: boundedText(100),
            native_name: boundedText(100),
            quality_verified: z.literal(false),
          })
          .strict(),
      )
      .min(1)
      .max(6),
    analysis_available: z.boolean(),
    checks: checksSchema,
    inputs: z
      .array(z.enum(['text', 'image']))
      .min(1)
      .max(2)
      .refine((inputs) => inputs.includes('text') && new Set(inputs).size === inputs.length),
    downloads_available: z.literal(false),
  })
  .strict()
  .superRefine((value, context) => {
    const codes = value.languages.map((entry) => entry.code);
    if (
      !codes.includes(value.default_language) ||
      new Set(codes).size !== codes.length ||
      value.analysis_available !==
        (value.checks.model_configured && value.checks.knowledge_structure_ready)
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Inconsistent capabilities.' });
    }
  });
export type Capabilities = z.infer<typeof capabilitiesSchema>;

// Fixtures retain historical defaults; the network boundary requires explicit wire fields.
export const liveResponseSchema = z
  .unknown()
  .superRefine((value, context) => {
    const required = [
      'schema_version',
      'status',
      'language',
      'classification',
      'explanation',
      'actions',
      'required_documents',
      'draft',
      'citations',
      'warnings',
      'questions',
      'error',
    ];
    if (!value || typeof value !== 'object' || required.some((key) => !Object.hasOwn(value, key))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Incomplete analysis response.',
        fatal: true,
      });
      return z.NEVER;
    }
    const citations = (value as Record<string, unknown>).citations;
    if (
      Array.isArray(citations) &&
      citations.some(
        (citation) =>
          !citation ||
          typeof citation !== 'object' ||
          !Object.hasOwn(citation, 'record_id') ||
          !Object.hasOwn(citation, 'source_urls'),
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Incomplete citation metadata.',
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .pipe(responseSchema)
  .superRefine((value, context) => {
    const strings = [
      ...value.explanation.map((block) => block.text),
      ...value.actions.map((block) => block.text),
      ...value.required_documents.map((block) => block.text),
      ...value.questions,
      ...value.warnings,
      ...value.citations.map((citation) => citation.heading),
      ...(value.classification
        ? [value.classification.category, value.classification.rationale]
        : []),
      ...(value.draft
        ? [
            value.draft.title,
            ...value.draft.blocks.map((block) => block.text),
            ...value.draft.missing_fields,
          ]
        : []),
    ];
    if (strings.some((text) => !/[^\p{White_Space}\p{C}]/u.test(text))) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Response contains blank prose.' });
    }
  });

export const transportErrorSchema = z.object({ error: errorDetailSchema }).strict();

/** The browser PUTs image bytes here, so it must be a bare HTTPS origin without credentials. */
export const uploadTicketSchema = z
  .object({
    object_key: z.string().regex(/^inbox\/[0-9a-f]{32}\.(?:png|jpg|jpeg|webp)$/),
    upload_url: z
      .string()
      .max(2048)
      .refine(
        (url) =>
          safeSourceUrl(url) !== null &&
          url.startsWith('https://') &&
          !/[\u0000-\u0020\u007f\\]/u.test(url),
        'Upload URLs must be HTTPS without credentials.',
      ),
    content_type: z.enum(['image/png', 'image/jpeg', 'image/webp']),
    expires_in: z.number().int().positive().max(900),
  })
  .strict();
export type UploadTicket = z.infer<typeof uploadTicketSchema>;

/** Image mode is an alternative to text, never an addition: exactly one input is sent. */
export function imageInputAvailable(capabilities: { inputs?: string[] } | null): boolean {
  return capabilities?.inputs?.includes('image') === true;
}

const activityText = boundedText(1024)
  .refine((text) => new TextEncoder().encode(text).byteLength <= 1024)
  .refine((text) => !/[\p{C}]/u.test(text) && text.trim().length > 0);
export const activitySchema = z
  .object({
    phase: z.enum(['thinking', 'reading', 'searching', 'validating']),
    turn: z.number().int().positive().max(128).optional(),
    path: z
      .string()
      .max(1000)
      .refine(
        (path) =>
          path.startsWith('references/knowledge/epfo/') &&
          path.endsWith('.md') &&
          !/[\\%?#:\p{C}]/u.test(path) &&
          path.split('/').every((part) => part !== '' && part !== '.' && part !== '..'),
      )
      .optional(),
    heading: activityText.optional(),
    start_line: z.number().int().positive().safe().optional(),
    end_line: z.number().int().positive().safe().optional(),
  })
  .strict()
  .superRefine((event, context) => {
    if (
      (event.phase === 'reading' &&
        (!event.path || event.start_line === undefined || event.end_line === undefined)) ||
      (event.phase !== 'reading' &&
        (event.path !== undefined ||
          event.heading !== undefined ||
          event.start_line !== undefined ||
          event.end_line !== undefined)) ||
      (event.start_line !== undefined &&
        event.end_line !== undefined &&
        event.end_line < event.start_line)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid reading activity metadata.',
      });
    }
  });
export type AnalysisActivity = z.infer<typeof activitySchema>;

export function validateInput(text: string, language: OutputLanguage): string | null {
  if (codePointLength(text) > 8000)
    return 'Keep the original text within 8,000 Unicode characters, including surrounding spaces.';
  const trimmed = text.trim();
  // Python also treats these control separators as whitespace; JavaScript trim does not.
  if (!trimmed || /^[\p{White_Space}\u001c-\u001f]*$/u.test(text)) {
    return 'Enter some text; whitespace alone is not enough.';
  }
  if (!languageSchema.safeParse(language).success) return 'Choose an enabled output language.';
  const body = JSON.stringify({ text: trimmed, language });
  if (new TextEncoder().encode(body).byteLength > 32768) {
    return 'The serialized request exceeds 32,768 UTF-8 bytes. Shorten the text.';
  }
  return null;
}
