"use client";

import { useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList, { Message } from "./components/MessageList";
import ChatInput from "./components/ChatInput";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      message: "Hello! I'm Gemini AI. How can I help you today?",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      sent: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      message: messageText,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      sent: true,
      read: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        message: data.message,
        timestamp: data.timestamp,
        sent: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: "Sorry, I couldn't process your message. Please try again.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        sent: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      {/* Mobile Container */}
      <main className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-[var(--wa-bg)] shadow-2xl">
        {/* Chat Header */}
        <ChatHeader />

        {/* Messages Area */}
        <MessageList messages={messages} isTyping={isLoading} />

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}
