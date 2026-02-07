import { isEnglish } from "./languages";

export interface TranslationResponse {
  translated_text: string;
  source_language_code: string;
  target_language_code: string;
  remaining?: number;
}

export interface TranslationError {
  error: string;
  limit?: number;
  remaining?: number;
  resetAt?: string;
}

/**
 * Translate text using the translation API
 * @param input - Text to translate
 * @param sourceLanguage - Source language code (use "auto" for auto-detection)
 * @param targetLanguage - Target language code
 * @returns Translated text or null if translation fails
 */
export async function translateText(
  input: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Translation API error:", errorData);
      return null;
    }

    const data: TranslationResponse = await response.json();
    return data.translated_text;
  } catch (error) {
    console.error("Translation failed:", error);
    return null;
  }
}

/**
 * Check if translation is needed based on language code
 * @param languageCode - Language code to check
 * @returns true if translation is needed (non-English language)
 */
export function needsTranslation(languageCode: string): boolean {
  return !isEnglish(languageCode);
}

/**
 * Get the number of remaining translation calls from response headers
 * @param headers - Response headers
 * @returns Remaining translation count or null
 */
export function getRemainingTranslations(headers: Headers): number | null {
  const remaining = headers.get("X-RateLimit-Remaining");
  return remaining ? parseInt(remaining, 10) : null;
}
