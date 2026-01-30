export default function ChatHeader() {
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
          online
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Menu */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/20">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="currentColor"
          >
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
