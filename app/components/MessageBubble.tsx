interface MessageBubbleProps {
  message: string;
  timestamp: string;
  sent: boolean;
  read?: boolean;
}

export default function MessageBubble({
  message,
  timestamp,
  sent,
  read = false,
}: MessageBubbleProps) {
  return (
    <div
      className={`mb-2 flex ${sent ? "justify-end" : "justify-start"} px-2`}
    >
      <div
        className={`relative max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
          sent
            ? "rounded-br-none bg-[var(--wa-bubble-sent)]"
            : "rounded-bl-none bg-[var(--wa-bubble-received)]"
        }`}
      >
        {/* Message Text */}
        <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.4] text-[var(--wa-text-primary)]">
          {message}
        </p>

        {/* Timestamp and Status */}
        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[11px] leading-none text-[var(--wa-text-muted)]">
            {timestamp}
          </span>
          {sent && (
            <span className="flex items-center">
              {read ? (
                // Double check (read)
                <svg
                  viewBox="0 0 16 11"
                  width="16"
                  height="11"
                  fill="none"
                  className="text-[#53bdeb]"
                >
                  <path
                    d="M11.071.653a.5.5 0 0 0-.707 0L5.5 5.518 3.708 3.725a.5.5 0 0 0-.707.707l2.146 2.146a.5.5 0 0 0 .707 0l5.217-5.217a.5.5 0 0 0 0-.708z"
                    fill="currentColor"
                  />
                  <path
                    d="M15.071.653a.5.5 0 0 0-.707 0L9.5 5.518l-.854-.854a.5.5 0 0 0-.707.707l1.207 1.207a.5.5 0 0 0 .707 0l5.218-5.217a.5.5 0 0 0 0-.708z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                // Double check (delivered)
                <svg
                  viewBox="0 0 16 11"
                  width="16"
                  height="11"
                  fill="none"
                  className="text-[var(--wa-text-muted)]"
                >
                  <path
                    d="M11.071.653a.5.5 0 0 0-.707 0L5.5 5.518 3.708 3.725a.5.5 0 0 0-.707.707l2.146 2.146a.5.5 0 0 0 .707 0l5.217-5.217a.5.5 0 0 0 0-.708z"
                    fill="currentColor"
                  />
                  <path
                    d="M15.071.653a.5.5 0 0 0-.707 0L9.5 5.518l-.854-.854a.5.5 0 0 0-.707.707l1.207 1.207a.5.5 0 0 0 .707 0l5.218-5.217a.5.5 0 0 0 0-.708z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </span>
          )}
        </div>

        {/* Message Bubble Tail */}
        <div
          className={`absolute bottom-0 h-0 w-0 ${
            sent
              ? "right-[-8px] border-b-[13px] border-l-[8px] border-t-0 border-b-[var(--wa-bubble-sent)] border-l-transparent border-t-transparent"
              : "left-[-8px] border-b-[13px] border-r-[8px] border-t-0 border-b-[var(--wa-bubble-received)] border-r-transparent border-t-transparent"
          }`}
        />
      </div>
    </div>
  );
}
