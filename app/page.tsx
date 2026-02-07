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
      type: 'text',
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

      // Get TTS audio for the response
      let audioUrl: string | undefined;
      try {
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: data.message,
            target_language_code: selectedLanguage,
          }),
        });

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          audioUrl = `data:audio/wav;base64,${ttsData.audio_base64}`;
        }
      } catch (ttsError) {
        console.error("TTS error:", ttsError);
        // Continue without audio
      }

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        message: data.message,
        timestamp: data.timestamp,
        sent: false,
        type: 'text',
        audioUrl,
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
        type: 'text',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    if (!selectedLanguage) {
      return;
    }

    setIsLoading(true);

    try {
      // Convert blob to base64 for display
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      const audioDataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });

      // Add voice message to UI
      const voiceMessage: Message = {
        id: Date.now(),
        message: "Voice message",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        sent: true,
        read: false,
        type: 'voice',
        audioUrl: audioDataUrl,
        audioDuration: duration,
      };

      setMessages((prev) => [...prev, voiceMessage]);

      // Send to STT API
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("language_code", selectedLanguage);

      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      if (!sttResponse.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const sttData = await sttResponse.json();
      const transcript = sttData.transcript;

      // Send transcript to chat API
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: transcript,
          history: messages,
          selectedLanguage: selectedLanguage,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error("Failed to get response");
      }

      const chatData = await chatResponse.json();

      // Get TTS audio for the response
      let responseAudioUrl: string | undefined;
      try {
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: chatData.message,
            target_language_code: selectedLanguage,
          }),
        });

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          responseAudioUrl = `data:audio/wav;base64,${ttsData.audio_base64}`;
        }
      } catch (ttsError) {
        console.error("TTS error:", ttsError);
      }

      // Add AI response as voice message
      const aiMessage: Message = {
        id: Date.now() + 1,
        message: chatData.message,
        timestamp: chatData.timestamp,
        sent: false,
        type: responseAudioUrl ? 'voice' : 'text',
        audioUrl: responseAudioUrl,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing voice message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: "Sorry, I couldn't process your voice message. Please try again.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        sent: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSend = async (imageFile: File, caption?: string) => {
    if (!selectedLanguage) {
      return;
    }

    setIsLoading(true);

    try {
      // Convert image to data URL for display
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      const imageDataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });

      // Add image message to UI
      const imageMessage: Message = {
        id: Date.now(),
        message: caption || "Image",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        sent: true,
        read: false,
        type: 'image',
        imageUrl: imageDataUrl,
        imageCaption: caption,
      };

      setMessages((prev) => [...prev, imageMessage]);

      // Send to Vision API
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("prompt", caption || "What's in this image? Please describe it.");
      formData.append("selectedLanguage", selectedLanguage);

      const visionResponse = await fetch("/api/vision", {
        method: "POST",
        body: formData,
      });

      if (!visionResponse.ok) {
        throw new Error("Failed to analyze image");
      }

      const visionData = await visionResponse.json();

      // Get TTS audio for the response
      let audioUrl: string | undefined;
      try {
        const ttsResponse = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: visionData.message,
            target_language_code: selectedLanguage,
          }),
        });

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          audioUrl = `data:audio/wav;base64,${ttsData.audio_base64}`;
        }
      } catch (ttsError) {
        console.error("TTS error:", ttsError);
      }

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        message: visionData.message,
        timestamp: visionData.timestamp,
        sent: false,
        type: 'text',
        audioUrl,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error processing image:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: "Sorry, I couldn't analyze your image. Please try again.",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        sent: false,
        type: 'text',
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
          onVoiceSend={handleVoiceSend}
          onImageSend={handleImageSend}
          disabled={isLoading || !selectedLanguage}
        />
      </main>
    </div>
  );
}
