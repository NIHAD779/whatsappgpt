"use client";

import { useState } from "react";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--wa-input-bg)] px-2 py-1.5 shadow-[0_-1px_2px_rgba(0,0,0,0.1)]">
      <div className="flex items-end gap-2">
        {/* Emoji Button */}
        <button className="mb-1.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[var(--wa-text-secondary)] transition-colors hover:bg-black/5 active:bg-black/10">
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="currentColor"
          >
            <path d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z" />
          </svg>
        </button>

        {/* Input Field Container */}
        <div className="flex flex-1 items-center gap-2 rounded-3xl bg-white px-3 py-2 shadow-sm">
          {/* Text Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="flex-1 bg-transparent text-[15px] text-[var(--wa-text-primary)] placeholder-[var(--wa-text-muted)] outline-none"
          />

          {/* Attachment Button */}
          <button className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-[var(--wa-text-secondary)] transition-colors hover:text-[var(--wa-text-primary)]">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="currentColor"
            >
              <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z" />
            </svg>
          </button>

          {/* Camera Button */}
          <button className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-[var(--wa-text-secondary)] transition-colors hover:text-[var(--wa-text-primary)]">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="currentColor"
            >
              <path d="M21.317 4.381H10.971L9.078 2.45c-.246-.251-.736-.457-1.089-.457H4.905c-.352 0-.837.211-1.078.468L1.201 5.272C.96 5.529.763 6.028.763 6.38v1.878l-.002.01v11.189a1.92 1.92 0 0 0 1.921 1.921h18.634a1.92 1.92 0 0 0 1.921-1.921V6.302a1.92 1.92 0 0 0-1.92-1.921zM12.076 18.51a5.577 5.577 0 1 1 0-11.154 5.577 5.577 0 0 1 0 11.154zm0-9.506a3.929 3.929 0 1 0 0 7.858 3.929 3.929 0 0 0 0-7.858z" />
            </svg>
          </button>
        </div>

        {/* Voice/Send Button */}
        {message.trim() ? (
          <button className="mb-1.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--wa-teal)] text-white shadow-md transition-transform active:scale-95">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="currentColor"
            >
              <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
            </svg>
          </button>
        ) : (
          <button className="mb-1.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[var(--wa-text-secondary)] transition-colors hover:bg-black/5 active:bg-black/10">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
