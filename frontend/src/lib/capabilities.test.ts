import { describe, expect, it } from 'vitest';
import { languageSchema } from './contracts';
import {
  capabilitiesSchema,
  previewCapabilities,
  selectEnabledLanguage,
  type Capabilities,
} from './capabilities';

const fresh = (): Capabilities => capabilitiesSchema.parse(previewCapabilities);

describe('capabilitiesSchema', () => {
  it('accepts image only as an explicit optional input alongside text', () => {
    expect(capabilitiesSchema.parse({ ...fresh(), inputs: ['text', 'image'] }).inputs).toEqual([
      'text',
      'image',
    ]);
    expect(capabilitiesSchema.safeParse({ ...fresh(), inputs: ['image'] }).success).toBe(false);
  });
  it('validates the explicitly offline mock fixture, not actual service readiness', () => {
    expect(fresh()).toEqual({
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
    });
  });

  it.each([['en'], ['en', 'hi'], ['ml', 'en', 'te', 'ta', 'kn', 'hi']].map((codes) => ({ codes })))(
    'preserves configured subset and order $codes',
    ({ codes }) => {
      const languages = codes.map((code) => fresh().languages.find((item) => item.code === code)!);
      const value = { ...fresh(), languages };
      expect(capabilitiesSchema.parse(value)).toEqual(value);
    },
  );

  it.each(
    [[], ['hi'], ['en', 'en'], ['en', 'fr'], ['EN'], ['en', 'HI'], ['en', ' en']].map((codes) => ({
      codes,
    })),
  )('rejects empty, disabled-default, duplicate and unknown code lists $codes', ({ codes }) => {
    const languages = codes.map((code) => ({
      code,
      name: 'Synthetic',
      native_name: 'Synthetic',
      quality_verified: false,
    }));
    expect(capabilitiesSchema.safeParse({ ...fresh(), languages }).success).toBe(false);
  });

  it.each(['hi', 'kn', 'ta', 'te', 'ml', 'fr', null])(
    'requires the current backend English default, even when %j is enabled',
    (default_language) => {
      expect(capabilitiesSchema.safeParse({ ...fresh(), default_language }).success).toBe(false);
    },
  );

  it('does not fabricate defaults for missing capability fields or metadata', () => {
    const original = fresh();
    for (const key of Object.keys(original)) {
      const value: Record<string, unknown> = { ...original };
      delete value[key];
      expect(capabilitiesSchema.safeParse(value).success, key).toBe(false);
    }
    for (const key of Object.keys(original.checks)) {
      const checks: Record<string, unknown> = { ...original.checks };
      delete checks[key];
      expect(capabilitiesSchema.safeParse({ ...original, checks }).success, key).toBe(false);
    }
    for (const key of Object.keys(original.languages[0])) {
      const language: Record<string, unknown> = { ...original.languages[0] };
      delete language[key];
      expect(
        capabilitiesSchema.safeParse({ ...original, languages: [language] }).success,
        key,
      ).toBe(false);
    }
  });

  it('rejects unknown fields at every object level', () => {
    const value = fresh();
    for (const patch of [
      { unexpected: true },
      { checks: { ...value.checks, unexpected: true } },
      { languages: [{ ...value.languages[0], unexpected: true }] },
    ]) {
      expect(capabilitiesSchema.safeParse({ ...value, ...patch }).success).toBe(false);
    }
  });

  it.each([
    { schema_version: '2.0' },
    { languages: null },
    { checks: null },
    { inputs: [] },
    { inputs: ['image'] },
    { inputs: ['text', 'image', 'image'] },
    { inputs: ['text', 'text'] },
    { inputs: 'text' },
    { analysis_available: 'false' },
    { downloads_available: 0 },
  ])('rejects malformed endpoint fields %#', (patch) => {
    expect(capabilitiesSchema.safeParse({ ...fresh(), ...patch }).success).toBe(false);
  });

  it('requires boolean checks and language quality, not truthy values', () => {
    const value = fresh();
    for (const key of Object.keys(value.checks)) {
      for (const invalid of ['false', 0, null]) {
        expect(
          capabilitiesSchema.safeParse({
            ...value,
            checks: { ...value.checks, [key]: invalid },
          }).success,
        ).toBe(false);
      }
    }
    for (const patch of [
      { quality_verified: 'false' },
      { quality_verified: 0 },
      { quality_verified: null },
      { name: '' },
      { native_name: '' },
      { name: 123 },
      { native_name: null },
    ]) {
      expect(
        capabilitiesSchema.safeParse({
          ...value,
          languages: [{ ...value.languages[0], ...patch }],
        }).success,
      ).toBe(false);
    }
  });

  it('preserves reported boolean quality/check metadata without inferring verification', () => {
    const value = fresh();
    value.analysis_available = true;
    value.downloads_available = true;
    value.checks.model_configured = true;
    value.checks.model_connectivity_verified = true;
    value.checks.knowledge_content_verified = true;
    value.languages[1].quality_verified = true;
    expect(capabilitiesSchema.parse(value)).toEqual(value);
    // This is schema behavior for synthetic metadata, not a claim about any service.
    expect(previewCapabilities.languages.every(({ quality_verified }) => !quality_verified)).toBe(
      true,
    );
  });
});

describe('selectEnabledLanguage', () => {
  it.each(languageSchema.options)(
    'retains enabled preference %s regardless of quality',
    (preferred) => {
      expect(selectEnabledLanguage(fresh(), preferred)).toBe(preferred);
    },
  );

  it('falls back only to the enabled default, not a disabled preference or first entry', () => {
    const capabilities = capabilitiesSchema.parse({
      ...fresh(),
      languages: [fresh().languages[5], fresh().languages[0]],
    });
    const before = structuredClone(capabilities);
    expect(selectEnabledLanguage(capabilities, 'ml')).toBe('ml');
    for (const preferred of ['hi', 'kn', 'ta', 'te'] as const) {
      const selected = selectEnabledLanguage(capabilities, preferred);
      expect(selected).toBe('en');
      expect(capabilities.languages.some(({ code }) => code === selected)).toBe(true);
    }
    expect(capabilities).toEqual(before);
  });

  it('never treats six known languages as six enabled languages', () => {
    const capabilities = capabilitiesSchema.parse({
      ...fresh(),
      languages: [fresh().languages[0]],
    });
    for (const preferred of languageSchema.options) {
      expect(selectEnabledLanguage(capabilities, preferred)).toBe('en');
    }
  });
});
