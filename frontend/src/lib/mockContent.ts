import type { Language } from './contracts';
import type { DemoScenario } from './demo';

export const qualityWarning =
  'Language quality is unverified in all six languages. Human translation review has not been completed; this is preset fictional text, not live analysis.';
export const historicalWarning =
  'Original fixture notes below are historical documentation, not a current readiness check. No live backend, provider, OCR or knowledge check was performed.';
export const evidenceWarning =
  'SAMPLE evidence only: both citations are imaginary display metadata, not evidence read from the corpus. No evidence file was read or verified; the synthetic headings, line and column positions are not actual file locations.';

type MockContent = {
  remarks: Record<DemoScenario, string>;
  category: string;
  rationale: string;
  explanation: string;
  actions: string[];
  document: string;
  title: string;
  templates: string[];
  missing: string[];
  factual: string;
  question: string;
  unsupported: string;
  error: string;
  quality: string;
  evidence: string;
};

// Authored fictional UI copy, not reviewed translations or policy guidance.
// Technical citation metadata is deliberately not translated or represented as a file read.
export const mockContent = {
  en: {
    remarks: {
      success: 'SAMPLE NOTICE: A detail in this imaginary claim needs review.',
      needs_clarification: 'SAMPLE NOTICE: The imaginary test label is missing.',
      unsupported: 'SAMPLE NOTICE: This imaginary input has no sample evidence.',
      error: 'SAMPLE NOTICE: Show an imaginary unavailable service, not a live request.',
    },
    category: 'Fictional sample only',
    rationale:
      'Low confidence is a fictional label; no real classification or policy certainty is asserted.',
    explanation:
      'This fictional notice asks for a detail to be checked. A real answer would identify the issue from evidence.',
    actions: [
      'Sample only: Review the fictional remark.',
      'Sample only: Check the highlighted detail in the example.',
    ],
    document: 'Sample rejection notice (illustrative, not a requirement)',
    title: 'Sample request — not for submission',
    templates: [
      'To: [recipient]',
      'Please help me understand [detail from the sample notice].',
      'This is a fictional request layout, not a claim submission.',
    ],
    missing: ['recipient', 'detail from the sample notice'],
    factual:
      'SAMPLE assertion: The imaginary notice contains a detail for review. This is not a real policy fact.',
    question: 'This is an imaginary example only. Which test label should be displayed?',
    unsupported:
      'No sample evidence supports this imaginary input, so no guidance or draft is supplied.',
    error:
      'Fictional service unavailable example: no answer was prepared. This is not a live service check.',
    quality:
      'Fictional language sample only; human review of wording and translation is still needed.',
    evidence:
      'Illustrative walkthrough only: the notice, display actions and request are fictional. Both citations are fake evidence, not support for a real claim. No evidence was read or verified.',
  },
  hi: {
    remarks: {
      success: 'नमूना सूचना: इस काल्पनिक दावे के एक विवरण की जाँच चाहिए।',
      needs_clarification: 'नमूना सूचना: काल्पनिक परीक्षण लेबल नहीं दिया गया है।',
      unsupported: 'नमूना सूचना: इस काल्पनिक पाठ के लिए नमूना साक्ष्य नहीं है।',
      error: 'नमूना सूचना: काल्पनिक अनुपलब्ध सेवा दिखाएँ, वास्तविक अनुरोध नहीं।',
    },
    category: 'केवल काल्पनिक उदाहरण',
    rationale: 'कम विश्वास केवल काल्पनिक लेबल है; यह वास्तविक वर्गीकरण का दावा नहीं करता।',
    explanation:
      'यह काल्पनिक सूचना एक विवरण की जाँच करने को कहती है। वास्तविक उत्तर साक्ष्य के आधार पर समस्या पहचानेगा।',
    actions: [
      'केवल नमूना: काल्पनिक टिप्पणी पढ़ें।',
      'केवल नमूना: उदाहरण में उभारे गए विवरण को देखें।',
    ],
    document: 'अस्वीकृति सूचना का नमूना (केवल उदाहरण, कोई आवश्यकता नहीं)',
    title: 'अनुरोध का नमूना — जमा करने के लिए नहीं',
    templates: [
      'प्रति: [प्राप्तकर्ता]',
      'कृपया [नमूना सूचना का विवरण] समझने में मेरी मदद करें।',
      'यह अनुरोध का काल्पनिक प्रारूप है, दावा जमा करने के लिए नहीं।',
    ],
    missing: ['प्राप्तकर्ता', 'नमूना सूचना का विवरण'],
    factual:
      'नमूना कथन: काल्पनिक सूचना में जाँच के लिए एक विवरण है। यह वास्तविक नीति का तथ्य नहीं है।',
    question: 'यह केवल काल्पनिक उदाहरण है। कौन-सा परीक्षण लेबल दिखाना है?',
    unsupported:
      'इस काल्पनिक पाठ के लिए नमूना साक्ष्य नहीं है, इसलिए कोई मार्गदर्शन या प्रारूप नहीं दिया गया है।',
    error:
      'काल्पनिक सेवा अनुपलब्ध उदाहरण: कोई उत्तर तैयार नहीं हुआ। यह वास्तविक सेवा की जाँच नहीं है।',
    quality:
      'केवल काल्पनिक भाषा नमूना: भाषा और अनुवाद की गुणवत्ता की मानव समीक्षा अभी नहीं हुई है।',
    evidence:
      'केवल काल्पनिक प्रदर्शन: सूचना, कार्रवाइयाँ और अनुरोध काल्पनिक हैं। दोनों उद्धरण नकली साक्ष्य हैं, वास्तविक दावे का आधार नहीं। कोई साक्ष्य फ़ाइल पढ़ी या सत्यापित नहीं की गई है।',
  },
  kn: {
    remarks: {
      success: 'ಮಾದರಿ ಸೂಚನೆ: ಈ ಕಾಲ್ಪನಿಕ ಅರ್ಜಿಯ ಒಂದು ವಿವರವನ್ನು ಪರಿಶೀಲಿಸಬೇಕು.',
      needs_clarification: 'ಮಾದರಿ ಸೂಚನೆ: ಕಾಲ್ಪನಿಕ ಪರೀಕ್ಷೆಯ ಗುರುತು ನೀಡಿಲ್ಲ.',
      unsupported: 'ಮಾದರಿ ಸೂಚನೆ: ಈ ಕಾಲ್ಪನಿಕ ಪಠ್ಯಕ್ಕೆ ಮಾದರಿ ಸಾಕ್ಷ್ಯವಿಲ್ಲ.',
      error: 'ಮಾದರಿ ಸೂಚನೆ: ಕಾಲ್ಪನಿಕ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲದ ಉದಾಹರಣೆ; ನಿಜವಾದ ವಿನಂತಿಯಲ್ಲ.',
    },
    category: 'ಕಾಲ್ಪನಿಕ ಉದಾಹರಣೆ ಮಾತ್ರ',
    rationale: 'ಕಡಿಮೆ ವಿಶ್ವಾಸವು ಕಾಲ್ಪನಿಕ ಗುರುತು ಮಾತ್ರ; ಇದು ನಿಜವಾದ ವರ್ಗೀಕರಣವಲ್ಲ.',
    explanation: 'ಈ ಕಾಲ್ಪನಿಕ ಸೂಚನೆಯಲ್ಲಿ ಒಂದು ವಿವರದ ಪರಿಶೀಲನೆ ಬೇಕಾಗಿದೆ. ಇದು ನಿಜವಾದ ಅರ್ಜಿಯ ಸಲಹೆಯಲ್ಲ.',
    actions: [
      'ಮಾದರಿ ಮಾತ್ರ: ಕಾಲ್ಪನಿಕ ಸೂಚನೆಯನ್ನು ಓದಿ.',
      'ಮಾದರಿ ಮಾತ್ರ: ಉದಾಹರಣೆಯಲ್ಲಿರುವ ವಿವರವನ್ನು ನೋಡಿ.',
    ],
    document: 'ಮಾದರಿ ಸೂಚನೆ ಮಾತ್ರ; ನಿಜವಾದ ಅರ್ಜಿಗೆ ಅಗತ್ಯವಿರುವ ದಾಖಲೆಯಲ್ಲ.',
    title: 'ಮಾದರಿ ವಿನಂತಿ — ಸಲ್ಲಿಸಲು ಅಲ್ಲ',
    templates: [
      'ಇವರಿಗೆ: [ಸ್ವೀಕರಿಸುವವರು]',
      'ದಯವಿಟ್ಟು [ಮಾದರಿ ಸೂಚನೆಯ ವಿವರ] ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡಿ.',
      'ಇದು ಕಾಲ್ಪನಿಕ ವಿನಂತಿ; ನಿಜವಾದ ಅರ್ಜಿಯಲ್ಲ.',
    ],
    missing: ['ಸ್ವೀಕರಿಸುವವರು', 'ಮಾದರಿ ಸೂಚನೆಯ ವಿವರ'],
    factual:
      'ಮಾದರಿ ಹೇಳಿಕೆ: ಕಾಲ್ಪನಿಕ ಸೂಚನೆಯಲ್ಲಿ ಪರಿಶೀಲಿಸಲು ಒಂದು ವಿವರವಿದೆ. ಇದು ನಿಜವಾದ ನೀತಿಯ ಸಂಗತಿಯಲ್ಲ.',
    question: 'ಈ ಕಾಲ್ಪನಿಕ ಉದಾಹರಣೆಯಲ್ಲಿ ಯಾವ ಪರೀಕ್ಷೆಯ ಗುರುತನ್ನು ತೋರಿಸಬೇಕು?',
    unsupported: 'ಈ ಕಾಲ್ಪನಿಕ ಪಠ್ಯಕ್ಕೆ ಮಾದರಿ ಸಾಕ್ಷ್ಯವಿಲ್ಲ; ಆದ್ದರಿಂದ ಸಲಹೆ ಅಥವಾ ಕರಡು ನೀಡಿಲ್ಲ.',
    error: 'ಕಾಲ್ಪನಿಕ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲದ ಉದಾಹರಣೆ: ಉತ್ತರ ಸಿದ್ಧವಾಗಿಲ್ಲ. ಇದು ನಿಜವಾದ ಸೇವೆಯ ಪರೀಕ್ಷೆಯಲ್ಲ.',
    quality:
      'ಕಾಲ್ಪನಿಕ ಭಾಷಾ ಮಾದರಿ ಮಾತ್ರ: ಭಾಷೆ ಮತ್ತು ಅನುವಾದದ ಗುಣಮಟ್ಟವನ್ನು ಮಾನವರು ಇನ್ನೂ ಪರಿಶೀಲಿಸಿಲ್ಲ.',
    evidence:
      'ಎರಡೂ ಉಲ್ಲೇಖಗಳು ಕಾಲ್ಪನಿಕ ಮಾದರಿಗಳು. ಯಾವುದೇ ಸಾಕ್ಷ್ಯದ ಕಡತವನ್ನು ಓದಿಲ್ಲ ಅಥವಾ ಪರಿಶೀಲಿಸಿಲ್ಲ; ಇದು ನಿಜವಾದ ಅರ್ಜಿಯ ಸಲಹೆಯಲ್ಲ.',
  },
  ta: {
    remarks: {
      success: 'மாதிரி அறிவிப்பு: இந்தக் கற்பனை விண்ணப்பத்தில் ஒரு விவரத்தைச் சரிபார்க்க வேண்டும்.',
      needs_clarification: 'மாதிரி அறிவிப்பு: கற்பனைச் சோதனைக்கான குறியீடு கொடுக்கப்படவில்லை.',
      unsupported: 'மாதிரி அறிவிப்பு: இந்தக் கற்பனை உரைக்கு மாதிரி ஆதாரம் இல்லை.',
      error: 'மாதிரி அறிவிப்பு: கற்பனையான சேவை கிடைக்காத எடுத்துக்காட்டு; உண்மையான கோரிக்கை அல்ல.',
    },
    category: 'கற்பனை எடுத்துக்காட்டு மட்டும்',
    rationale: 'குறைந்த நம்பிக்கை என்பது கற்பனைக் குறியீடு மட்டுமே; இது உண்மையான வகைப்பாடு அல்ல.',
    explanation:
      'இந்தக் கற்பனை அறிவிப்பு ஒரு விவரத்தைச் சரிபார்க்கச் சொல்கிறது. இது உண்மையான விண்ணப்பத்திற்கான ஆலோசனை அல்ல.',
    actions: [
      'மாதிரி மட்டும்: கற்பனை அறிவிப்பைப் படிக்கவும்.',
      'மாதிரி மட்டும்: எடுத்துக்காட்டில் உள்ள விவரத்தைப் பார்க்கவும்.',
    ],
    document: 'மாதிரி அறிவிப்பு மட்டும்; உண்மையான விண்ணப்பத்திற்குத் தேவையான ஆவணம் அல்ல.',
    title: 'மாதிரிக் கோரிக்கை — சமர்ப்பிப்பதற்காக அல்ல',
    templates: [
      'பெறுநர்: [பெறுநர்]',
      'தயவுசெய்து [மாதிரி அறிவிப்பின் விவரம்] புரிந்துகொள்ள உதவவும்.',
      'இது கற்பனைக் கோரிக்கை; உண்மையான விண்ணப்பம் அல்ல.',
    ],
    missing: ['பெறுநர்', 'மாதிரி அறிவிப்பின் விவரம்'],
    factual:
      'மாதிரிக் கூற்று: கற்பனை அறிவிப்பில் சரிபார்க்க ஒரு விவரம் உள்ளது. இது உண்மையான கொள்கைத் தகவல் அல்ல.',
    question: 'இந்தக் கற்பனை எடுத்துக்காட்டில் எந்தச் சோதனைக் குறியீட்டைக் காட்ட வேண்டும்?',
    unsupported: 'இந்தக் கற்பனை உரைக்கு மாதிரி ஆதாரம் இல்லை; எனவே ஆலோசனையோ வரைவோ வழங்கப்படவில்லை.',
    error:
      'கற்பனையான சேவை கிடைக்காத எடுத்துக்காட்டு: பதில் தயாரிக்கப்படவில்லை. இது உண்மையான சேவைச் சோதனை அல்ல.',
    quality:
      'கற்பனை மொழி மாதிரி மட்டும்: மொழி மற்றும் மொழிபெயர்ப்பின் தரத்தை மனிதர்கள் இன்னும் மதிப்பாய்வு செய்யவில்லை.',
    evidence:
      'இரண்டு மேற்கோள்களும் கற்பனை மாதிரிகள். எந்த ஆதாரக் கோப்பும் படிக்கப்படவோ சரிபார்க்கப்படவோ இல்லை; இது உண்மையான விண்ணப்ப ஆலோசனை அல்ல.',
  },
  te: {
    remarks: {
      success: 'నమూనా ప్రకటన: ఈ కల్పిత దరఖాస్తులో ఒక వివరాన్ని పరిశీలించాలి.',
      needs_clarification: 'నమూనా ప్రకటన: కల్పిత పరీక్ష గుర్తు ఇవ్వలేదు.',
      unsupported: 'నమూనా ప్రకటన: ఈ కల్పిత పాఠ్యానికి నమూనా ఆధారం లేదు.',
      error: 'నమూనా ప్రకటన: కల్పిత సేవ అందుబాటులో లేని ఉదాహరణ; నిజమైన అభ్యర్థన కాదు.',
    },
    category: 'కల్పిత ఉదాహరణ మాత్రమే',
    rationale: 'తక్కువ విశ్వాసం అనేది కల్పిత గుర్తు మాత్రమే; ఇది నిజమైన వర్గీకరణ కాదు.',
    explanation:
      'ఈ కల్పిత ప్రకటన ఒక వివరాన్ని పరిశీలించమని చెబుతోంది. ఇది నిజమైన దరఖాస్తుకు సలహా కాదు.',
    actions: [
      'నమూనా మాత్రమే: కల్పిత ప్రకటనను చదవండి.',
      'నమూనా మాత్రమే: ఉదాహరణలోని వివరాన్ని చూడండి.',
    ],
    document: 'నమూనా ప్రకటన మాత్రమే; నిజమైన దరఖాస్తుకు అవసరమైన పత్రం కాదు.',
    title: 'నమూనా అభ్యర్థన — సమర్పించడానికి కాదు',
    templates: [
      'వీరికి: [గ్రహీత]',
      'దయచేసి [నమూనా ప్రకటన వివరాన్ని] అర్థం చేసుకోవడానికి సహాయం చేయండి.',
      'ఇది కల్పిత అభ్యర్థన; నిజమైన దరఖాస్తు కాదు.',
    ],
    missing: ['గ్రహీత', 'నమూనా ప్రకటన వివరాన్ని'],
    factual:
      'నమూనా వాక్యం: కల్పిత ప్రకటనలో పరిశీలించడానికి ఒక వివరముంది. ఇది నిజమైన విధాన సమాచారం కాదు.',
    question: 'ఈ కల్పిత ఉదాహరణలో ఏ పరీక్ష గుర్తును చూపించాలి?',
    unsupported: 'ఈ కల్పిత పాఠ్యానికి నమూనా ఆధారం లేదు; అందువల్ల సలహా లేదా ముసాయిదా ఇవ్వలేదు.',
    error: 'కల్పిత సేవ అందుబాటులో లేని ఉదాహరణ: సమాధానం సిద్ధం కాలేదు. ఇది నిజమైన సేవ పరీక్ష కాదు.',
    quality: 'కల్పిత భాషా నమూనా మాత్రమే: భాష మరియు అనువాద నాణ్యతను మనుషులు ఇంకా సమీక్షించలేదు.',
    evidence:
      'రెండు ఉల్లేఖనాలూ కల్పిత నమూనాలు. ఏ ఆధార పత్రాన్నీ చదవలేదు లేదా ధృవీకరించలేదు; ఇది నిజమైన దరఖాస్తు సలహా కాదు.',
  },
  ml: {
    remarks: {
      success: 'മാതൃകാ അറിയിപ്പ്: ഈ സാങ്കൽപ്പിക അപേക്ഷയിലെ ഒരു വിശദാംശം പരിശോധിക്കണം.',
      needs_clarification: 'മാതൃകാ അറിയിപ്പ്: സാങ്കൽപ്പിക പരീക്ഷണത്തിന്റെ അടയാളം നൽകിയിട്ടില്ല.',
      unsupported: 'മാതൃകാ അറിയിപ്പ്: ഈ സാങ്കൽപ്പിക വാചകത്തിന് മാതൃകാ തെളിവില്ല.',
      error: 'മാതൃകാ അറിയിപ്പ്: സാങ്കൽപ്പിക സേവനം ലഭ്യമല്ലാത്ത ഉദാഹരണം; യഥാർത്ഥ അഭ്യർത്ഥനയല്ല.',
    },
    category: 'സാങ്കൽപ്പിക ഉദാഹരണം മാത്രം',
    rationale: 'കുറഞ്ഞ വിശ്വാസം ഒരു സാങ്കൽപ്പിക അടയാളം മാത്രം; ഇത് യഥാർത്ഥ വർഗ്ഗീകരണമല്ല.',
    explanation:
      'ഈ സാങ്കൽപ്പിക അറിയിപ്പ് ഒരു വിശദാംശം പരിശോധിക്കാൻ പറയുന്നു. ഇത് യഥാർത്ഥ അപേക്ഷയ്ക്കുള്ള ഉപദേശമല്ല.',
    actions: [
      'മാതൃക മാത്രം: സാങ്കൽപ്പിക അറിയിപ്പ് വായിക്കുക.',
      'മാതൃക മാത്രം: ഉദാഹരണത്തിലെ വിശദാംശം നോക്കുക.',
    ],
    document: 'മാതൃകാ അറിയിപ്പ് മാത്രം; യഥാർത്ഥ അപേക്ഷയ്ക്ക് ആവശ്യമായ രേഖയല്ല.',
    title: 'മാതൃകാ അഭ്യർത്ഥന — സമർപ്പിക്കാനുള്ളതല്ല',
    templates: [
      'സ്വീകർത്താവ്: [സ്വീകർത്താവ്]',
      'ദയവായി [മാതൃകാ അറിയിപ്പിലെ വിശദാംശം] മനസ്സിലാക്കാൻ സഹായിക്കുക.',
      'ഇത് സാങ്കൽപ്പിക അഭ്യർത്ഥനയാണ്; യഥാർത്ഥ അപേക്ഷയല്ല.',
    ],
    missing: ['സ്വീകർത്താവ്', 'മാതൃകാ അറിയിപ്പിലെ വിശദാംശം'],
    factual:
      'മാതൃകാ പ്രസ്താവന: സാങ്കൽപ്പിക അറിയിപ്പിൽ പരിശോധിക്കാൻ ഒരു വിശദാംശമുണ്ട്. ഇത് യഥാർത്ഥ നയവിവരമല്ല.',
    question: 'ഈ സാങ്കൽപ്പിക ഉദാഹരണത്തിൽ ഏത് പരീക്ഷണ അടയാളമാണ് കാണിക്കേണ്ടത്?',
    unsupported: 'ഈ സാങ്കൽപ്പിക വാചകത്തിന് മാതൃകാ തെളിവില്ല; അതിനാൽ ഉപദേശമോ കരടോ നൽകിയിട്ടില്ല.',
    error:
      'സാങ്കൽപ്പിക സേവനം ലഭ്യമല്ലാത്ത ഉദാഹരണം: ഉത്തരം തയ്യാറായിട്ടില്ല. ഇത് യഥാർത്ഥ സേവന പരിശോധനയല്ല.',
    quality:
      'സാങ്കൽപ്പിക ഭാഷാ മാതൃക മാത്രം: ഭാഷയുടെയും പരിഭാഷയുടെയും നിലവാരം മനുഷ്യർ ഇതുവരെ വിലയിരുത്തിയിട്ടില്ല.',
    evidence:
      'രണ്ട് ഉദ്ധരണികളും സാങ്കൽപ്പിക മാതൃകകളാണ്. ഒരു തെളിവ് ഫയലും വായിക്കുകയോ പരിശോധിക്കുകയോ ചെയ്തിട്ടില്ല; ഇത് യഥാർത്ഥ അപേക്ഷയ്ക്കുള്ള ഉപദേശമല്ല.',
  },
} satisfies Record<Language, MockContent>;
