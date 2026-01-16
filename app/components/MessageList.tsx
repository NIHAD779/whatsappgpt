import MessageBubble from "./MessageBubble";

interface Message {
  id: number;
  message: string;
  timestamp: string;
  sent: boolean;
  read?: boolean;
}

const sampleMessages: Message[] = [
  {
    id: 1,
    message: "Hey! How are you doing?",
    timestamp: "10:30 AM",
    sent: false,
  },
  {
    id: 2,
    message: "I'm doing great, thanks for asking! How about you?",
    timestamp: "10:32 AM",
    sent: true,
    read: true,
  },
  {
    id: 3,
    message: "Pretty good! Are we still on for tonight?",
    timestamp: "10:33 AM",
    sent: false,
  },
  {
    id: 4,
    message: "Yes, absolutely! What time works best for you?",
    timestamp: "10:35 AM",
    sent: true,
    read: true,
  },
  {
    id: 5,
    message: "How about 7 PM? We could meet at the usual place.",
    timestamp: "10:36 AM",
    sent: false,
  },
  {
    id: 6,
    message: "Perfect! See you then 👍",
    timestamp: "10:37 AM",
    sent: true,
    read: false,
  },
  {
    id: 7,
    message: "Great! Looking forward to it 😊",
    timestamp: "10:38 AM",
    sent: false,
  },
  {
    id: 8,
    message: "By the way, should I bring anything?",
    timestamp: "10:39 AM",
    sent: false,
  },
  {
    id: 9,
    message: "Just yourself! Everything else is covered.",
    timestamp: "10:41 AM",
    sent: true,
    read: false,
  },
];

export default function MessageList() {
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
        {sampleMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.message}
            timestamp={msg.timestamp}
            sent={msg.sent}
            read={msg.read}
          />
        ))}
      </div>
    </div>
  );
}
