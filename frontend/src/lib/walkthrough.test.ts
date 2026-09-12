import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { responseSchema, type Language } from './contracts';
import { demoScenarios, getDemoResponse, type DemoScenario } from './demo';
import { evidenceWarning, historicalWarning, mockContent, qualityWarning } from './mockContent';
import { getWalkthrough, walkthroughRemark } from './walkthrough';

const languages: Language[] = ['en', 'hi', 'kn', 'ta', 'te', 'ml'];
const scenarios: DemoScenario[] = demoScenarios.map(({ value }) => value);
const scripts: Record<Language, RegExp> = {
  en: /[A-Za-z]/u,
  hi: /\p{Script=Devanagari}/u,
  kn: /\p{Script=Kannada}/u,
  ta: /\p{Script=Tamil}/u,
  te: /\p{Script=Telugu}/u,
  ml: /\p{Script=Malayalam}/u,
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('Mocks must never fetch.');
    }),
  );
});
afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

describe.each(languages)('%s fictional walkthrough', (language) => {
  it.each(scenarios)(
    'validates %s with preserved history and unverified-quality disclosures',
    (scenario) => {
      const base = getDemoResponse(scenario, language);
      const response = getWalkthrough(language, scenario);
      expect(responseSchema.parse(response)).toEqual(response);
      expect(response.language).toBe(language);
      expect(response.status).toBe(scenario);
      expect(response.warnings.slice(0, base.warnings.length)).toEqual(base.warnings);
      expect(response.warnings).toEqual(
        expect.arrayContaining([historicalWarning, qualityWarning, mockContent[language].quality]),
      );
      expect(walkthroughRemark(language, scenario)).toBe(mockContent[language].remarks[scenario]);
      expect(walkthroughRemark(language, scenario)).toMatch(scripts[language]);
      if (scenario === 'success') {
        const text = [
          response.classification!.category,
          response.classification!.rationale,
          ...response.explanation.map((block) => block.text),
          ...response.actions.map((block) => block.text),
          ...response.required_documents.map((block) => block.text),
          response.draft!.title,
          ...response.draft!.blocks.map((block) => block.text),
          ...response.draft!.missing_fields,
        ];
        for (const value of text) {
          expect(value).toMatch(scripts[language]);
          expect(value.length).toBeLessThan(250);
        }
        expect(response.classification?.confidence).toBe('low');
        expect(response.classification?.rationale).toBe(mockContent[language].rationale);
        expect(response.actions).toHaveLength(2);
        expect(response.required_documents).toHaveLength(1);
        expect(response.warnings).toContain(evidenceWarning);
        expect(response.warnings).toContain(mockContent[language].evidence);
      } else {
        expect(response.classification).toBeNull();
        expect(response.explanation).toEqual([]);
        expect(response.actions).toEqual([]);
        expect(response.required_documents).toEqual([]);
        expect(response.draft).toBeNull();
        expect(response.citations).toEqual([]);
        if (scenario === 'needs_clarification') {
          expect(response.questions).toEqual([mockContent[language].question]);
          expect(response.questions[0]).toMatch(scripts[language]);
        } else {
          expect(response.questions).toEqual([]);
        }
        if (scenario === 'unsupported') {
          // The UI uses the first warning for its visible abstention reason.
          expect(response.warnings[0]).toBe(mockContent[language].unsupported);
          expect(response.warnings[0]).toMatch(scripts[language]);
        }
        if (scenario === 'error') {
          expect(base.error?.code).toBe('agent_not_implemented');
          expect(response.error).toEqual({
            code: 'service_unavailable',
            message: mockContent[language].error,
          });
          expect(response.error?.message).toMatch(scripts[language]);
        } else {
          expect(response.error).toBeNull();
        }
      }
      expect(getDemoResponse(scenario, language)).toEqual(base);
    },
  );

  it('defaults to success and uses distinct fictional inputs, not user-input matching', () => {
    expect(getWalkthrough(language)).toEqual(getWalkthrough(language, 'success'));
    expect(walkthroughRemark(language)).toBe(walkthroughRemark(language, 'success'));
    expect(new Set(scenarios.map((scenario) => walkthroughRemark(language, scenario))).size).toBe(
      4,
    );
  });

  it('pairs exact synthetic reason metadata with the untouched supporting citation', () => {
    const base = getDemoResponse('success', language);
    const response = getWalkthrough(language);
    expect(response.citations).toHaveLength(2);
    expect(response.citations[0]).toEqual(base.citations[0]);
    expect(response.citations[0].record_id).toBeNull();
    expect(response.citations[0].path).toBe(
      'references/knowledge/epfo/synthetic-examples/schema-only.md',
    );
    expect(response.citations[1]).toEqual({
      id: 'ev-synthetic-reason',
      path: 'references/knowledge/epfo/reasons/epfo-rr-001.md',
      record_id: 'epfo-rr-001',
      heading: 'SYNTHETIC SAMPLE ONLY — imaginary reason excerpt (not read)',
      start_line: 1,
      end_line: 1,
      start_column: 0,
      end_column: 0,
      source_urls: ['https://example.invalid/synthetic-reason-evidence'],
    });
    const ids = response.citations.map(({ id }) => id);
    const blocks = [...response.explanation, ...response.actions, ...response.required_documents];
    const factual = response.draft!.blocks.filter(({ kind }) => kind === 'factual');
    expect(factual).toHaveLength(1);
    expect(factual[0].text).toBe(mockContent[language].factual);
    blocks.push(...factual);
    for (const block of blocks) {
      expect(block.citation_ids).toEqual(expect.arrayContaining(ids));
      expect(block.citation_ids).toHaveLength(ids.length);
    }
    for (const block of response.draft!.blocks.filter(({ kind }) => kind === 'template')) {
      expect(block.citation_ids).toEqual([]);
    }
    for (const citation of response.citations) {
      expect(citation.heading).toContain('SYNTHETIC');
      for (const url of citation.source_urls) expect(new URL(url).hostname).toBe('example.invalid');
    }
    for (const field of response.draft!.missing_fields) {
      expect(response.draft!.blocks.some(({ text }) => text.includes(`[${field}]`))).toBe(true);
    }
  });
});

it('returns independent nested data without changing other languages or original fixtures', () => {
  const originals = languages.map((language) => getWalkthrough(language));
  const changed = getWalkthrough('en');
  changed.citations[1].source_urls[0] = 'https://example.invalid/changed';
  changed.citations[1].start_column = 99;
  changed.draft!.blocks[3].citation_ids.length = 0;
  changed.draft!.missing_fields.length = 0;
  changed.actions[0].text = 'changed';
  changed.warnings.length = 0;
  expect(languages.map((language) => getWalkthrough(language))).toEqual(originals);
});

it('rejects an unpaired column, missing factual evidence and unknown references', () => {
  const unpaired = getWalkthrough('en');
  unpaired.citations[1].end_column = null;
  expect(responseSchema.safeParse(unpaired).success).toBe(false);
  const uncited = getWalkthrough('en');
  uncited.draft!.blocks.find(({ kind }) => kind === 'factual')!.citation_ids = [];
  expect(responseSchema.safeParse(uncited).success).toBe(false);
  const unknown = getWalkthrough('en');
  unknown.draft!.blocks.find(({ kind }) => kind === 'factual')!.citation_ids = ['ev-unknown'];
  expect(responseSchema.safeParse(unknown).success).toBe(false);
});
