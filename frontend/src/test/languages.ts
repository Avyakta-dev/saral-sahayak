import { previewCapabilities, type Capabilities } from '../lib/capabilities';

// Script-rendering samples only, not translations or policy evidence.
export const languageSamples = [
  { code: 'en', name: 'English', native_name: 'English', text: 'Synthetic example' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', text: 'काल्पनिक उदाहरण' },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', text: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', text: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', text: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', text: 'മലയാളം' },
] as const;

export const testCapabilities: Capabilities = {
  ...previewCapabilities,
  analysis_available: true,
  languages: languageSamples.map(({ code, name, native_name }) => ({
    code,
    name,
    native_name,
    quality_verified: false,
  })),
};
