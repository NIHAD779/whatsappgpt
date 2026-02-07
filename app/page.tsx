"use client";

import { useState, useEffect } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList, { Message } from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import LanguageSelector from "./components/LanguageSelector";
import {
  LANGUAGE_STORAGE_KEY,
  getGreetingMessage,
} from "./utils/languages";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language preference and greeting message on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
      // Set initial greeting in the saved language
      setMessages([
        {
          id: 1,
          message: getGreetingMessage(savedLanguage),
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          sent: false,
        },
      ]);
    } else {
      // Show language selector if no preference exists
      setShowLanguageSelector(true);
    }
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Set initial greeting in the selected language
    setMessages([
      {
        id: 1,
        message: getGreetingMessage(languageCode),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        sent: false,
      },
    ]);
  };

  const handleLanguageChange = () => {
    setShowLanguageSelector(true);
  };

  const handleSendMessage = async (messageText: string) => {
    // Don't allow sending if language is not selected
    if (!selectedLanguage) {
      return;
    }

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
      // Call API with selected language
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          history: messages,
          selectedLanguage: selectedLanguage,
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
      {/* Language Selector Modal */}
      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onSelect={handleLanguageSelect}
      />

      {/* Mobile Container */}
      <main className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-[var(--wa-bg)] shadow-2xl">
        {/* Chat Header */}
        <ChatHeader
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
        />

        {/* Messages Area */}
        <MessageList messages={messages} isTyping={isLoading} />

        {/* Chat Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || !selectedLanguage}
        />
      </main>
    </div>
  );
}
