import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      {/* Mobile Container */}
      <main className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-[var(--wa-bg)] shadow-2xl">
        {/* Chat Header */}
        <ChatHeader />

        {/* Messages Area */}
        <MessageList />

        {/* Chat Input */}
        <ChatInput />
      </main>
    </div>
  );
}
