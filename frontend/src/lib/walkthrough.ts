import { responseSchema, type AnalyzeResponse, type Language } from './contracts';
import { getDemoResponse, type DemoScenario } from './demo';
import { evidenceWarning, mockContent } from './mockContent';

export function walkthroughRemark(language: Language, scenario: DemoScenario = 'success'): string {
  return mockContent[language].remarks[scenario];
}

export function getWalkthrough(
  language: Language,
  scenario: DemoScenario = 'success',
): AnalyzeResponse {
  const base = getDemoResponse(scenario, language);
  const sample = mockContent[language];

  if (scenario !== 'success') {
    return responseSchema.parse({
      ...base,
      // The old fixture code remains in getDemoResponse for regression coverage.
      // This is a selected mock status, never a statement about the live backend.
      error: scenario === 'error' ? { code: 'service_unavailable', message: sample.error } : null,
    });
  }

  // A canonical-shaped reason location for display testing, NOT a corpus excerpt.
  // Do not replace these imaginary headings/URLs with apparent real provenance.
  const reasonCitation = {
    id: 'ev-synthetic-reason',
    path: 'references/knowledge/epfo/reasons/epfo-rr-001.md',
    record_id: 'epfo-rr-001',
    heading: 'SYNTHETIC SAMPLE ONLY — imaginary reason excerpt (not read)',
    start_line: 1,
    end_line: 1,
    start_column: 0,
    end_column: 0,
    source_urls: ['https://example.invalid/synthetic-reason-evidence'],
  };
  // Keep the original supporting-document citation and source URLs unchanged.
  const citationIds = [reasonCitation.id, ...base.explanation[0].citation_ids];
  const supported = (text: string) => ({ text, citation_ids: [...citationIds] });

  return responseSchema.parse({
    ...base,
    classification: {
      reason_id: 'epfo-rr-001',
      category: sample.category,
      confidence: 'low',
      rationale: sample.rationale,
    },
    explanation: [supported(sample.explanation)],
    actions: sample.actions.map(supported),
    required_documents: [supported(sample.document)],
    draft: {
      title: sample.title,
      blocks: [
        ...sample.templates.map((text) => ({ text, kind: 'template', citation_ids: [] })),
        { ...supported(sample.factual), kind: 'factual' },
      ],
      missing_fields: [...sample.missing],
    },
    citations: [...base.citations, reasonCitation],
    warnings: [...base.warnings, evidenceWarning, sample.evidence],
  });
}
