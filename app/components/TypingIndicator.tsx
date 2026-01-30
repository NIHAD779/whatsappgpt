export default function TypingIndicator() {
  return (
    <div className="flex justify-start px-4">
      <div className="max-w-[85%] rounded-lg bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--wa-text-muted)] [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--wa-text-muted)] [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--wa-text-muted)]"></div>
        </div>
      </div>
    </div>
  );
}
