import { z } from 'zod';
import { languageSchema, type Language } from './contracts';

// GET /api/v1/capabilities wire shape. Require all fields; never invent availability
// or enabled languages for an incomplete response. Booleans remain reported metadata.
export const capabilitiesSchema = z
  .object({
    schema_version: z.literal('1.0'),
    default_language: z.literal('en'),
    languages: z
      .array(
        z
          .object({
            code: languageSchema,
            name: z.string().min(1),
            native_name: z.string().min(1),
            quality_verified: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(6),
    analysis_available: z.boolean(),
    checks: z
      .object({
        model_configured: z.boolean(),
        model_connectivity_verified: z.boolean(),
        knowledge_index_present: z.boolean(),
        knowledge_structure_ready: z.boolean(),
        knowledge_content_verified: z.boolean(),
        agent_implemented: z.boolean(),
      })
      .strict(),
    inputs: z
      .array(z.enum(['text', 'image']))
      .min(1)
      .max(2)
      .refine(
        (inputs) => inputs.includes('text') && new Set(inputs).size === inputs.length,
        'Inputs require text and may include image once.',
      ),
    downloads_available: z.boolean(),
    history_available: z.boolean(),
  })
  // Passthrough (not .strict()) at the top level only: an older frontend build talking
  // to a newer backend must tolerate an additive capability flag it doesn't know about
  // yet, rather than fail closed and disable the whole app. This is exactly the failure
  // this PR already hit once (a new history_available field breaking .strict()).
  // Nested objects stay .strict() - those are not meant to gain fields independently.
  .passthrough()
  .superRefine((capabilities, context) => {
    const codes = capabilities.languages.map(({ code }) => code);
    if (new Set(codes).size !== codes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['languages'],
        message: 'Enabled language codes must be unique.',
      });
    }
    if (!codes.includes(capabilities.default_language)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['default_language'],
        message: 'The default language must be enabled.',
      });
    }
  });

export type Capabilities = z.infer<typeof capabilitiesSchema>;

// OFFLINE MOCK FIXTURE ONLY. These flags are illustrative, not service checks,
// current readiness assertions, model connectivity, or verified language quality.
export const previewCapabilities: Capabilities = capabilitiesSchema.parse({
  schema_version: '1.0',
  default_language: 'en',
  languages: [
    { code: 'en', name: 'English', native_name: 'English', quality_verified: false },
    { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', quality_verified: false },
    { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', quality_verified: false },
    { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', quality_verified: false },
    { code: 'te', name: 'Telugu', native_name: 'తెలుగు', quality_verified: false },
    { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', quality_verified: false },
  ],
  analysis_available: false,
  checks: {
    model_configured: false,
    model_connectivity_verified: false,
    knowledge_index_present: true,
    knowledge_structure_ready: true,
    knowledge_content_verified: false,
    agent_implemented: true,
  },
  inputs: ['text'],
  downloads_available: false,
  history_available: false,
});

// Call with schema-validated capabilities; never fall back to a disabled code.
export function selectEnabledLanguage(capabilities: Capabilities, preferred: Language): Language {
  return capabilities.languages.some(({ code }) => code === preferred)
    ? preferred
    : capabilities.default_language;
}
