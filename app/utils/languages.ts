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

export const getLanguageByNumber = (num: number): Language | undefined => {
  if (num >= 1 && num <= SUPPORTED_LANGUAGES.length) {
    return SUPPORTED_LANGUAGES[num - 1];
  }
  return undefined;
};

export const isEnglish = (languageCode: string): boolean => {
  return languageCode === "en-IN";
};

export const LANGUAGE_STORAGE_KEY = "preferredLanguage";
export const PERMISSIONS_STORAGE_KEY = "permissionsGranted";
export const ONBOARDING_COMPLETE_KEY = "onboardingComplete";

// Onboarding messages
export const ONBOARDING_MESSAGES = {
  welcome: `Hello! 👋 Welcome! I'm your AI assistant. Before we start chatting, I'd like to get to know you better.

First, I'll need your permission to use a few features. May I have access to your microphone for voice messages? 🎤

Just type *yes* or *no*.`,

  microphoneGranted: `Great! Thank you for allowing microphone access! 🎉

Now, let me know which language you'd like to chat in. Please type the number of your preferred language:

1. English
2. हिंदी (Hindi)
3. বাংলা (Bengali)
4. தமிழ் (Tamil)
5. తెలుగు (Telugu)
6. ગુજરાતી (Gujarati)
7. ಕನ್ನಡ (Kannada)
8. മലയാളം (Malayalam)
9. मराठी (Marathi)
10. ਪੰਜਾਬੀ (Punjabi)
11. ଓଡ଼ିଆ (Odia)

Just type a number between 1 and 11.`,

  microphoneDenied: `No problem! You can still type messages to chat with me. 📝

Let me know which language you'd like to chat in. Please type the number of your preferred language:

1. English
2. हिंदी (Hindi)
3. বাংলা (Bengali)
4. தமிழ் (Tamil)
5. తెలుగు (Telugu)
6. ગુજરાતી (Gujarati)
7. ಕನ್ನಡ (Kannada)
8. മലയാളം (Malayalam)
9. मराठी (Marathi)
10. ਪੰਜਾਬੀ (Punjabi)
11. ଓଡ଼ିଆ (Odia)

Just type a number between 1 and 11.`,

  invalidPermissionResponse: `I didn't quite catch that. Could you please type *yes* or *no*?`,

  invalidLanguageResponse: `I didn't understand that. Please type a number between 1 and 11 to select your language.`,

  getLanguageConfirmation: (language: Language): string => 
    `Excellent choice! I'll chat with you in ${language.name} (${language.nativeName}). 🎊

You're all set! How can I help you today?`,
};

// Greeting messages in different languages
export const GREETING_MESSAGES: Record<string, string> = {
  "en-IN": "Hello! I'm your AI assistant. How can I help you today?",
  "hi-IN": "नमस्ते! मैं आपका एआई सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
  "bn-IN": "হ্যালো! আমি আপনার AI সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  "ta-IN": "வணக்கம்! நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  "te-IN": "హలో! నేను మీ AI అసిస్టెంట్. నేను మీకు ఎలా సహాయం చేయగలను?",
  "gu-IN": "હેલો! હું તમારો AI સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
  "kn-IN": "ಹಲೋ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?",
  "ml-IN": "ഹലോ! ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റ് ആണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
  "mr-IN": "नमस्कार! मी तुमचा AI सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
  "pa-IN": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  "od-IN": "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ AI ସହାୟକ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
};

export const getGreetingMessage = (languageCode: string): string => {
  return GREETING_MESSAGES[languageCode] || GREETING_MESSAGES["en-IN"];
};

// Parse user response for yes/no
export const parseYesNo = (input: string): boolean | null => {
  const normalized = input.toLowerCase().trim();
  const yesPatterns = ['yes', 'y', 'yeah', 'yep', 'sure', 'ok', 'okay', 'yea', 'yup', 'हां', 'हाँ', 'ஆம்', 'అవును', 'ହଁ', 'ਹਾਂ', 'હા', 'ಹೌದು', 'ഉം', 'होय'];
  const noPatterns = ['no', 'n', 'nope', 'nah', 'नहीं', 'இல்லை', 'కాదు', 'ନା', 'ਨਹੀਂ', 'ના', 'ಇಲ್ಲ', 'ഇല്ല', 'नाही'];
  
  if (yesPatterns.includes(normalized)) return true;
  if (noPatterns.includes(normalized)) return false;
  return null;
};

// Parse language selection (1-11)
export const parseLanguageSelection = (input: string): number | null => {
  const normalized = input.trim();
  const num = parseInt(normalized, 10);
  if (!isNaN(num) && num >= 1 && num <= SUPPORTED_LANGUAGES.length) {
    return num;
  }
  return null;
};
