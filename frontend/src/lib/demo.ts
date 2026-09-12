import successExample from '../../../docs/examples/success.json';
import clarificationExample from '../../../docs/examples/needs_clarification.json';
import unsupportedExample from '../../../docs/examples/unsupported.json';
import errorExample from '../../../docs/examples/error.json';
import {
  demoLanguageSchema,
  responseSchema,
  type AnalyzeResponse,
  type DemoLanguage,
} from './contracts';

export type DemoScenario = 'success' | 'needs_clarification' | 'unsupported' | 'error';

export const demoScenarios: { value: DemoScenario; label: string; description: string }[] = [
  {
    value: 'success',
    label: 'Success preview',
    description: 'Synthetic explanation, citations and a non-submittable draft.',
  },
  {
    value: 'needs_clarification',
    label: 'Needs clarification',
    description: 'An imaginary question, without guidance or a draft.',
  },
  {
    value: 'unsupported',
    label: 'Unsupported',
    description: 'A limitation notice, without unsupported advice.',
  },
  {
    value: 'error',
    label: 'Error',
    description: 'A preset unavailable-agent notice, not a live backend check.',
  },
];

export const sampleText =
  'SYNTHETIC DEMO: A sample detail in this imaginary claim needs review. This is a fictional UI example only, not a real claim or policy statement.';

const examples = {
  success: successExample,
  needs_clarification: clarificationExample,
  unsupported: unsupportedExample,
  error: errorExample,
} satisfies Record<DemoScenario, unknown>;

const hindiWarnings: Record<DemoScenario, string[]> = {
  success: [
    'केवल काल्पनिक उदाहरण: यह वास्तविक विश्लेषण का परिणाम, नीति संबंधी सलाह या उपयोग योग्य दावा प्रारूप नहीं है।',
    'उद्धरण का पथ, शीर्षक, पंक्ति सीमा और URL काल्पनिक उदाहरण हैं; कोई साक्ष्य फ़ाइल पढ़ी या सत्यापित नहीं की गई है।',
    'विश्लेषण एजेंट अभी लागू नहीं है; मॉडल प्रदाता से कनेक्शन और वास्तविक ज्ञान सामग्री सत्यापित नहीं हैं।',
  ],
  needs_clarification: [
    'केवल काल्पनिक उदाहरण: यह UI का परीक्षण नमूना है, वास्तविक विश्लेषण का परिणाम या नीति संबंधी सलाह नहीं।',
    'विश्लेषण एजेंट अभी लागू नहीं है; यह उदाहरण सेवा के तैयार होने का प्रमाण नहीं है।',
  ],
  unsupported: [
    'केवल काल्पनिक उदाहरण: इस काल्पनिक नमूने में दिए गए पाठ के लिए कोई साक्ष्य नहीं है; कोई मार्गदर्शन नहीं दिया गया है।',
    'यह वास्तविक विश्लेषण का परिणाम या नीति संबंधी सलाह नहीं है। विश्लेषण एजेंट अभी लागू नहीं है और सेवा तैयार नहीं है।',
  ],
  error: [
    'केवल काल्पनिक उदाहरण: यह दस्तावेज़ का परीक्षण नमूना है, वास्तविक सेवा से मिला उत्तर या नीति संबंधी सलाह नहीं।',
    'विश्लेषण एजेंट अभी लागू नहीं है; मॉडल का कॉन्फ़िगरेशन कर देना सेवा के तैयार होने का प्रमाण नहीं है।',
  ],
};

export function getDemoResponse(scenario: DemoScenario, language: DemoLanguage): AnalyzeResponse {
  const response = responseSchema.parse(examples[scenario]);
  response.language = demoLanguageSchema.parse(language);

  if (scenario === 'needs_clarification' && language === 'en') {
    response.questions = [
      'This is an imaginary example only. Which test label should be displayed?',
    ];
  }
  if (scenario === 'success') {
    response.warnings.push(
      'Classification confidence is a synthetic label, not policy confidence or a guarantee of correctness.',
    );
  }

  if (language === 'hi') {
    response.warnings.push(
      ...hindiWarnings[scenario],
      'Hindi translation demonstration only: preset synthetic content, not live Hindi analysis.',
      'केवल हिंदी अनुवाद का प्रदर्शन: पहले से लिखा काल्पनिक पाठ, वास्तविक हिंदी विश्लेषण नहीं।',
    );
    if (response.classification) {
      response.classification.category = 'केवल काल्पनिक उदाहरण';
      response.classification.rationale =
        'केवल काल्पनिक स्कीमा उदाहरण; epfo-rr-001 ID वास्तविक वर्गीकरण का दावा नहीं करती।';
      response.warnings.push(
        'वर्गीकरण का विश्वास स्तर केवल काल्पनिक लेबल है, नीति की विश्वसनीयता या सही होने की गारंटी नहीं।',
      );
    }
    if (scenario === 'success') {
      response.explanation[0].text =
        'काल्पनिक उदाहरण: इस काल्पनिक नमूने में एक परीक्षण लेबल है, नीति संबंधी कथन नहीं।';
      response.actions[0].text =
        'काल्पनिक उदाहरण: यह नमूना केवल परीक्षण इंटरफ़ेस में दिखाने के लिए है; इसके आधार पर कोई कार्रवाई न करें।';
      response.required_documents[0].text =
        'काल्पनिक उदाहरण: यह एक काल्पनिक परीक्षण दस्तावेज़ है, वास्तविक दावे की आवश्यकता नहीं।';
      if (response.draft) {
        response.draft.title = 'काल्पनिक अनुवाद उदाहरण — जमा करने के लिए नहीं';
        response.draft.blocks[0].text =
          'काल्पनिक उदाहरण: यह नमूना उद्धरण वाले तथ्यात्मक खंड का प्रदर्शन करता है; यह नीति संबंधी सलाह नहीं है।';
        response.draft.blocks[1].text =
          '[CLAIMANT_NAME — दावेदार का नाम जानबूझकर नहीं दिया गया है]';
      }
    }
    if (response.error) {
      response.error.message = 'बैकएंड का आधार उपलब्ध है; विश्लेषण अभी लागू नहीं है।';
    }
  }

  return responseSchema.parse(response);
}

export async function loadDemoResponse(
  scenario: DemoScenario,
  language: DemoLanguage,
  signal: AbortSignal,
): Promise<AnalyzeResponse> {
  const abortError = () => new DOMException('Demo preview was cancelled.', 'AbortError');
  if (signal.aborted) throw abortError();

  await new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, 700);
    signal.addEventListener('abort', onAbort, { once: true });
  });

  if (signal.aborted) throw abortError();
  return getDemoResponse(scenario, language);
}
