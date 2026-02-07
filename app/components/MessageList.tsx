import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export interface Message {
  id: number;
  message: string;
  timestamp: string;
  sent: boolean;
  read?: boolean;
  type?: 'text' | 'voice' | 'image';
  audioUrl?: string;        // Base64 audio for voice messages
  audioDuration?: number;   // Duration in seconds
  imageUrl?: string;        // Base64 or blob URL for images
  imageCaption?: string;    // Optional caption for images
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
            type={msg.type}
            audioUrl={msg.audioUrl}
            audioDuration={msg.audioDuration}
            imageUrl={msg.imageUrl}
            imageCaption={msg.imageCaption}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
}
