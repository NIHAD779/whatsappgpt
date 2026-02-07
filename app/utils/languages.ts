export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en-IN", name: "English", nativeName: "English" },
  { code: "hi-IN", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "od-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

export const isEnglish = (languageCode: string): boolean => {
  return languageCode === "en-IN";
};

export const LANGUAGE_STORAGE_KEY = "preferredLanguage";

// Greeting messages in different languages
export const GREETING_MESSAGES: Record<string, string> = {
  "en-IN": "Hello! I'm Gemini AI. How can I help you today?",
  "hi-IN": "नमस्ते! मैं जेमिनी एआई हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
  "bn-IN": "হ্যালো! আমি জেমিনি এআই। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  "ta-IN": "வணக்கம்! நான் ஜெமினி AI. இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  "te-IN": "హలో! నేను జెమిని AI. నేను మీకు ఎలా సహాయం చేయగలను?",
  "gu-IN": "હેલો! હું જેમિની AI છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
  "kn-IN": "ಹಲೋ! ನಾನು ಜೆಮಿನಿ AI. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?",
  "ml-IN": "ഹലോ! ഞാൻ ജെമിനി AI ആണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
  "mr-IN": "नमस्कार! मी जेमिनी AI आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
  "pa-IN": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਜੈਮਿਨੀ AI ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  "od-IN": "ନମସ୍କାର! ମୁଁ ଜେମିନି AI। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
};

export const getGreetingMessage = (languageCode: string): string => {
  return GREETING_MESSAGES[languageCode] || GREETING_MESSAGES["en-IN"];
};
