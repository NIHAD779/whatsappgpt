"use client";

import { useState } from "react";
import { getLanguageByCode } from "../utils/languages";

interface ChatHeaderProps {
  selectedLanguage: string | null;
  onLanguageChange: () => void;
}

export default function ChatHeader({
  selectedLanguage,
  onLanguageChange,
}: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const currentLanguage = selectedLanguage
    ? getLanguageByCode(selectedLanguage)
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 bg-[var(--wa-teal-dark)] px-4 py-2.5 text-white shadow-md">
      {/* Back Button */}
      <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/20">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      {/* Contact Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--wa-teal-light)]">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="opacity-90"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      {/* Contact Info */}
      <div className="flex-1 overflow-hidden">
        <h1 className="truncate text-base font-medium leading-tight">
          Gemini AI
        </h1>
        <p className="truncate text-xs leading-tight opacity-80">
          {currentLanguage ? currentLanguage.nativeName : "online"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative flex items-center gap-2">
        {/* Menu */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/20"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="currentColor"
          >
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-12 z-[60] min-w-[200px] rounded-lg bg-white shadow-xl">
            <button
              onClick={() => {
                setShowMenu(false);
                onLanguageChange();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-[var(--wa-text-primary)] transition-colors hover:bg-gray-100"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
                className="text-[var(--wa-text-secondary)]"
              >
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
              <span className="text-sm font-medium">Change Language</span>
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[55]"
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
}
