import { responseSchema, type AnalyzeResponse, type Language } from './contracts';
import { getDemoResponse } from './demo';

const content = {
  en: {
    remark: 'SAMPLE NOTICE: A detail in this imaginary claim needs review.',
    explanation:
      'This fictional notice asks for a detail to be checked. A real answer would identify the issue from evidence.',
    actions: [
      'Sample only: Review the fictional remark.',
      'Sample only: Check the highlighted detail in the example.',
    ],
    document: 'Sample rejection notice (illustrative, not a requirement)',
    title: 'Sample request — not for submission',
    blocks: [
      'To: [recipient]',
      'Please help me understand [detail from the sample notice].',
      'This is a fictional request layout, not a claim submission.',
    ],
    missing: ['recipient', 'detail from the sample notice'],
    warning:
      'Illustrative walkthrough only: the notice, display actions and request are fictional. The reused citation is fake evidence, not support for a real claim. No evidence was read or verified.',
  },
  hi: {
    remark: 'नमूना सूचना: इस काल्पनिक दावे के एक विवरण की जाँच चाहिए।',
    explanation:
      'यह काल्पनिक सूचना एक विवरण की जाँच करने को कहती है। वास्तविक उत्तर साक्ष्य के आधार पर समस्या पहचानेगा।',
    actions: [
      'केवल नमूना: काल्पनिक टिप्पणी पढ़ें।',
      'केवल नमूना: उदाहरण में उभारे गए विवरण को देखें।',
    ],
    document: 'अस्वीकृति सूचना का नमूना (केवल उदाहरण, कोई आवश्यकता नहीं)',
    title: 'अनुरोध का नमूना — जमा करने के लिए नहीं',
    blocks: [
      'प्रति: [प्राप्तकर्ता]',
      'कृपया [नमूना सूचना का विवरण] समझने में मेरी मदद करें।',
      'यह अनुरोध का काल्पनिक प्रारूप है, दावा जमा करने के लिए नहीं।',
    ],
    missing: ['प्राप्तकर्ता', 'नमूना सूचना का विवरण'],
    warning:
      'केवल काल्पनिक प्रदर्शन: सूचना, दिखाई गई कार्रवाइयाँ और अनुरोध काल्पनिक हैं। इस्तेमाल किया गया उद्धरण नकली साक्ष्य है, वास्तविक दावे का आधार नहीं। कोई साक्ष्य पढ़ा या सत्यापित नहीं किया गया है।',
  },
} satisfies Record<Language, unknown>;

export function walkthroughRemark(language: Language): string {
  return content[language].remark;
}

export function getWalkthrough(language: Language): AnalyzeResponse {
  const base = getDemoResponse('success', language);
  const sample = content[language];
  // Keep the original synthetic provenance intact; it is not evidence for policy advice.
  const citationIds = base.explanation[0].citation_ids;
  const supported = (text: string) => ({ text, citation_ids: [...citationIds] });

  return responseSchema.parse({
    ...base,
    explanation: [supported(sample.explanation)],
    actions: sample.actions.map(supported),
    required_documents: [supported(sample.document)],
    draft: {
      title: sample.title,
      blocks: sample.blocks.map((text) => ({ text, kind: 'template', citation_ids: [] })),
      missing_fields: [...sample.missing],
    },
    warnings: [...base.warnings, sample.warning],
  });
}
