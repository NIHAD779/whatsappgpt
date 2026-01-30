import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export interface Message {
  id: number;
  message: string;
  timestamp: string;
  sent: boolean;
  read?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  return (
    <div className="chat-background flex-1 overflow-y-auto pb-2 pt-20">
      {/* Date Separator */}
      <div className="mb-4 flex justify-center py-2">
        <div className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--wa-text-secondary)] shadow-sm">
          TODAY
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-1">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.message}
            timestamp={msg.timestamp}
            sent={msg.sent}
            read={msg.read}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
}
