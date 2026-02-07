"use client";

import { useState, useEffect, useCallback } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList, { Message } from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import {
  LANGUAGE_STORAGE_KEY,
  PERMISSIONS_STORAGE_KEY,
  ONBOARDING_COMPLETE_KEY,
  getGreetingMessage,
  ONBOARDING_MESSAGES,
  parseYesNo,
  parseLanguageSelection,
  getLanguageByNumber,
} from "./utils/languages";

// Onboarding stages
type OnboardingStage = 
  | "welcome" 
  | "awaiting_permission" 
  | "awaiting_language" 
  | "complete";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStage, setOnboardingStage] = useState<OnboardingStage>("welcome");
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  // Helper to create a timestamp
  const getTimestamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Helper to add an AI message
  const addAIMessage = useCallback((text: string) => {
    const aiMessage: Message = {
      id: Date.now(),
      message: text,
      timestamp: getTimestamp(),
      sent: false,
      type: 'text',
    };
    setMessages((prev) => [...prev, aiMessage]);
  }, []);

  // Initialize onboarding or restore session
  useEffect(() => {
    const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const savedPermissions = localStorage.getItem(PERMISSIONS_STORAGE_KEY);

    if (onboardingComplete === "true" && savedLanguage) {
      // User has completed onboarding before
      setSelectedLanguage(savedLanguage);
      setMicPermissionGranted(savedPermissions === "true");
      setOnboardingStage("complete");
      setMessages([
        {
          id: 1,
          message: getGreetingMessage(savedLanguage),
          timestamp: getTimestamp(),
          sent: false,
        },
      ]);
    } else {
      // Start fresh onboarding
      setOnboardingStage("awaiting_permission");
      setMessages([
        {
          id: 1,
          message: ONBOARDING_MESSAGES.welcome,
          timestamp: getTimestamp(),
          sent: false,
        },
      ]);
    }
  }, []);

  // Handle language selection from header (for changing language later)
  const handleLanguageChange = () => {
    // Show language selection prompt in chat
    addAIMessage(`Would you like to change your language? Please type the number of your preferred language:

1. English
2. हिंदी (Hindi)
3. বাংলা (Bengali)
4. தமிழ் (Tamil)
5. తెలుగు (Telugu)
6. ગુજરાતી (Gujarati)
7. ಕನ್ನಡ (Kannada)
8. മലയാളം (Malayalam)
9. मराठी (Marathi)
10. ਪੰਜਾਬੀ (Punjabi)
11. ଓଡ଼ିଆ (Odia)

Just type a number between 1 and 11.`);
    setOnboardingStage("awaiting_language");
  };

  // Process onboarding responses
  const handleOnboardingResponse = (messageText: string): boolean => {
    if (onboardingStage === "awaiting_permission") {
      const response = parseYesNo(messageText);
      
      if (response === null) {
        // Invalid response
        setTimeout(() => {
          addAIMessage(ONBOARDING_MESSAGES.invalidPermissionResponse);
        }, 500);
        return true;
      }

      if (response) {
        // User said yes to microphone
        setMicPermissionGranted(true);
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, "true");
        setOnboardingStage("awaiting_language");
        setTimeout(() => {
          addAIMessage(ONBOARDING_MESSAGES.microphoneGranted);
        }, 500);
      } else {
        // User said no
        setMicPermissionGranted(false);
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, "false");
        setOnboardingStage("awaiting_language");
        setTimeout(() => {
          addAIMessage(ONBOARDING_MESSAGES.microphoneDenied);
        }, 500);
      }
      return true;
    }

    if (onboardingStage === "awaiting_language") {
      const langNum = parseLanguageSelection(messageText);
      
      if (langNum === null) {
        // Invalid response
        setTimeout(() => {
          addAIMessage(ONBOARDING_MESSAGES.invalidLanguageResponse);
        }, 500);
        return true;
      }

      const language = getLanguageByNumber(langNum);
      if (language) {
        setSelectedLanguage(language.code);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language.code);
        localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
        setOnboardingStage("complete");
        setTimeout(() => {
          addAIMessage(ONBOARDING_MESSAGES.getLanguageConfirmation(language));
        }, 500);
      }
      return true;
    }

    return false; // Not an onboarding message
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now(),
      message: messageText,
      timestamp: getTimestamp(),
      sent: true,
      read: false,
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);

    // Check if this is an onboarding response
    if (onboardingStage !== "complete") {
      handleOnboardingResponse(messageText);
      return;
    }

    // Don't allow sending if language is not selected (safety check)
    if (!selectedLanguage) {
      return;
    }

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
        timestamp: getTimestamp(),
        sent: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    // During onboarding, voice is not fully set up yet
    if (onboardingStage !== "complete" || !selectedLanguage) {
      // Show a message that voice is not available during onboarding
      if (onboardingStage !== "complete") {
        addAIMessage("Please complete the setup first by typing your response. Voice messages will be available after setup is complete.");
      }
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
        timestamp: getTimestamp(),
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
        timestamp: getTimestamp(),
        sent: false,
        type: 'text',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSend = async (imageFile: File, caption?: string) => {
    // During onboarding, image sending is not available
    if (onboardingStage !== "complete" || !selectedLanguage) {
      if (onboardingStage !== "complete") {
        addAIMessage("Please complete the setup first by typing your response. Image sharing will be available after setup is complete.");
      }
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
        timestamp: getTimestamp(),
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
        timestamp: getTimestamp(),
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
      {/* Mobile Container */}
      <main className="relative flex h-screen w-full max-w-md flex-col overflow-hidden bg-[var(--wa-bg)] shadow-2xl">
        {/* Chat Header */}
        <ChatHeader
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
        />

        {/* Messages Area */}
        <MessageList messages={messages} isTyping={isLoading} />

        {/* Chat Input - always enabled during onboarding for text input */}
        <ChatInput
          onSend={handleSendMessage}
          onVoiceSend={handleVoiceSend}
          onImageSend={handleImageSend}
          disabled={isLoading}
        />
      </main>
    </div>
  );
}
