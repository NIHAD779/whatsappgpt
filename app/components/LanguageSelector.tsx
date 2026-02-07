"use client";

import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from "../utils/languages";

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (languageCode: string) => void;
}

export default function LanguageSelector({
  isOpen,
  onClose,
  onSelect,
}: LanguageSelectorProps) {
  if (!isOpen) return null;

  const handleLanguageSelect = (languageCode: string) => {
    // Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    onSelect(languageCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      {/* Modal Container */}
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-[var(--wa-text-primary)]">
            Select Language
          </h2>
          <p className="mt-1 text-sm text-[var(--wa-text-secondary)]">
            Choose your preferred language for conversation
          </p>
        </div>

        {/* Language Grid */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-[var(--wa-teal)] hover:bg-[var(--wa-teal)]/5 active:scale-95"
              >
                {/* Language Native Name */}
                <div className="text-2xl font-semibold text-[var(--wa-text-primary)] group-hover:text-[var(--wa-teal)]">
                  {language.nativeName}
                </div>
                {/* Language English Name */}
                <div className="mt-1 text-sm text-[var(--wa-text-secondary)]">
                  {language.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer with Info */}
        <div className="border-t border-gray-200 px-6 py-3">
          <p className="text-xs text-[var(--wa-text-secondary)]">
            You can change the language anytime from the menu.
          </p>
        </div>
      </div>
    </div>
  );
}
