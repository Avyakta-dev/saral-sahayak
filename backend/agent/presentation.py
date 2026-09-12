"""Fixed host draft framing; translations are not a claim of linguistic verification."""

from backend.api.schemas import AnalyzeRequest, Draft, DraftBlock, SupportedText
from backend.languages import LanguageCode

# title, request framing, provenance limitation. Identifiers remain literal and untranslated.
_TEXT = {
    "en": (
        "Request for review",
        "Please review my claim and advise on the following steps. Verify this draft before use.",
        "Citation locations and URLs match excerpts read; this does not verify that the claims "
        "are correct or current. Sources were not fetched. This is not official or legal advice "
        "and does not guarantee an outcome.",
    ),
    "hi": (
        "समीक्षा के लिए अनुरोध",
        "कृपया मेरे दावे की समीक्षा करें और निम्न चरणों पर मार्गदर्शन दें। उपयोग से पहले यह मसौदा जाँचें।",
        "उद्धरणों के स्थान और URL पढ़े गए अंशों से मेल खाते हैं; इससे दावों की सत्यता या वर्तमान "
        "स्थिति प्रमाणित नहीं होती। स्रोत वेबसाइटें नहीं खोली गईं। यह आधिकारिक या कानूनी सलाह "
        "नहीं है और परिणाम की गारंटी नहीं देता।",
    ),
    "kn": (
        "ಪರಿಶೀಲನೆಗಾಗಿ ವಿನಂತಿ",
        "ದಯವಿಟ್ಟು ನನ್ನ ಕ್ಲೈಮ್ ಪರಿಶೀಲಿಸಿ ಕೆಳಗಿನ ಕ್ರಮಗಳ ಬಗ್ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ. ಬಳಸುವ ಮೊದಲು ಈ ಕರಡನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "ಉಲ್ಲೇಖಗಳ ಸ್ಥಳಗಳು ಮತ್ತು URL ಓದಿದ ಭಾಗಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ; ಇದು ಹೇಳಿಕೆಗಳ ಸತ್ಯತೆ ಅಥವಾ "
        "ಪ್ರಸ್ತುತತೆಯನ್ನು ದೃಢೀಕರಿಸುವುದಿಲ್ಲ. ಮೂಲ ವೆಬ್‌ಸೈಟ್‌ಗಳನ್ನು ತೆರೆಯಲಾಗಿಲ್ಲ. ಇದು ಅಧಿಕೃತ ಅಥವಾ "
        "ಕಾನೂನು ಸಲಹೆಯಲ್ಲ ಮತ್ತು ಫಲಿತಾಂಶದ ಖಾತರಿಯಲ್ಲ.",
    ),
    "ta": (
        "மறுஆய்வுக்கான கோரிக்கை",
        "எனது கோரிக்கையை ஆய்வு செய்து பின்வரும் படிகள் குறித்து வழிகாட்டவும். பயன்படுத்தும் முன் இந்த வரைவைச் சரிபார்க்கவும்.",
        "மேற்கோள் இடங்களும் URL-களும் படித்த பகுதிகளுடன் பொருந்துகின்றன; இது கூற்றுகளின் உண்மை "
        "அல்லது தற்போதைய நிலையை உறுதிப்படுத்தாது. மூல இணையதளங்கள் திறக்கப்படவில்லை. இது "
        "அதிகாரப்பூர்வ அல்லது சட்ட ஆலோசனை அல்ல; முடிவுக்கு உத்தரவாதம் இல்லை.",
    ),
    "te": (
        "సమీక్ష కోసం అభ్యర్థన",
        "దయచేసి నా క్లెయిమ్‌ను సమీక్షించి కింది చర్యలపై మార్గదర్శనం ఇవ్వండి. ఉపయోగించే ముందు ఈ ముసాయిదాను తనిఖీ చేయండి.",
        "ఉల్లేఖన స్థానాలు మరియు URLలు చదివిన భాగాలతో సరిపోలుతున్నాయి; ఇది వాదనల నిజాన్ని లేదా "
        "ప్రస్తుత స్థితిని నిర్ధారించదు. మూల వెబ్‌సైట్‌లను తెరవలేదు. ఇది అధికారిక లేదా న్యాయ "
        "సలహా కాదు; ఫలితానికి హామీ లేదు.",
    ),
    "ml": (
        "അവലോകനത്തിനുള്ള അപേക്ഷ",
        "എന്റെ ക്ലെയിം പരിശോധിച്ച് താഴെപ്പറയുന്ന നടപടികളെക്കുറിച്ച് മാർഗനിർദേശം നൽകുക. ഉപയോഗിക്കുന്നതിന് മുമ്പ് ഈ കരട് പരിശോധിക്കുക.",
        "ഉദ്ധരണികളുടെ സ്ഥാനങ്ങളും URL-കളും വായിച്ച ഭാഗങ്ങളുമായി പൊരുത്തപ്പെടുന്നു; ഇത് വാദങ്ങളുടെ "
        "സത്യാവസ്ഥയോ നിലവിലെ നിലയോ സ്ഥിരീകരിക്കുന്നില്ല. ഉറവിട വെബ്‌സൈറ്റുകൾ തുറന്നിട്ടില്ല. "
        "ഇത് ഔദ്യോഗികമോ നിയമപരമോ ആയ ഉപദേശമല്ല; ഫലത്തിന് ഉറപ്പില്ല.",
    ),
}


def provenance_warning(language: LanguageCode) -> str:
    return _TEXT[language][2]


def build_draft(request: AnalyzeRequest, actions: list[SupportedText]) -> Draft:
    """No second generation channel: copy cited actions, exact details, fixed framing."""
    title, framing, _ = _TEXT[request.language]
    blocks = [DraftBlock(text=framing, kind="template")]
    missing = []
    for field in ("claimant_name", "claim_id", "claim_type"):
        value = getattr(request.details, field)
        if value and value.strip():
            blocks.append(DraftBlock(text=value, kind="user_supplied"))
        else:
            missing.append(field)
            blocks.append(DraftBlock(text=f"[{field}]", kind="template"))
    blocks.extend(
        DraftBlock(text=action.text, kind="factual", citation_ids=list(action.citation_ids))
        for action in actions
    )
    return Draft(title=title, blocks=blocks, missing_fields=missing)
