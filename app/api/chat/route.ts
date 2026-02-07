import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextRequest, NextResponse } from "next/server";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
import { SarvamAIClient } from "sarvamai";

interface Message {
  id: number;
  message: string;
  timestamp: string;
  sent: boolean;
  read?: boolean;
}

interface ChatRequest {
  message: string;
  history: Message[];
  selectedLanguage?: string;
}

// Initialize rate limiter: 10 requests per day per IP
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.fixedWindow(10, "1 d"), // 10 requests per 1 day
//   analytics: true,
//   prefix: "whatsappgpt:ratelimit",
// });

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    // const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? 
    //            request.headers.get("x-real-ip") ?? 
    //            "anonymous";

    // Check rate limit
    // const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    // if (!success) {
    //   const resetDate = new Date(reset);
    //   return NextResponse.json(
    //     { 
    //       error: "Daily limit reached. You can send 10 messages per day.",
    //       limit,
    //       remaining: 0,
    //       resetAt: resetDate.toISOString(),
    //     },
    //     { 
    //       status: 429,
    //       headers: {
    //         "X-RateLimit-Limit": limit.toString(),
    //         "X-RateLimit-Remaining": "0",
    //         "X-RateLimit-Reset": reset.toString(),
    //       }
    //     }
    //   );
    // }

    const { message, history, selectedLanguage = "en-IN" }: ChatRequest = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Determine if translation is needed
    const needsTranslation = selectedLanguage !== "en-IN";
    let messageToProcess = message;
    let translationError = false;

    // Step 1: Translate user message to English if needed
    if (needsTranslation) {
      try {
        const translationResponse = await fetch(
          `${request.nextUrl.origin}/api/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
              "x-real-ip": request.headers.get("x-real-ip") || "",
            },
            body: JSON.stringify({
              input: message,
              source_language_code: selectedLanguage,
              target_language_code: "en-IN",
            }),
          }
        );

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          messageToProcess = translationData.translated_text;
        } else {
          console.error("Failed to translate user message to English");
          translationError = true;
          // Continue with original message
        }
      } catch (error) {
        console.error("Translation error:", error);
        translationError = true;
        // Continue with original message
      }
    }

    // Determine which AI provider to use (default: sarvam)
    const provider = process.env.AI_PROVIDER?.toLowerCase() || "sarvam";

    let responseContent: string;

    if (provider === "sarvam") {
      const apiKey = process.env.SARVAM_AI_API_KEY?.trim();
      if (!apiKey) {
        console.error("Sarvam API key not found in environment variables");
        return NextResponse.json(
          { error: "API key not configured" },
          { status: 500 }
        );
      }

      // Initialize Sarvam AI client
      const client = new SarvamAIClient({
        apiSubscriptionKey: apiKey,
      });

      // Build messages array for Sarvam API
      // Filter history to ensure first message after system is from user
      const historyMessages = history.slice(-10).map((msg) => ({
        role: msg.sent ? ("user" as const) : ("assistant" as const),
        content: msg.message,
      }));
      
      // Remove leading assistant messages (API requires first message after system to be from user)
      while (historyMessages.length > 0 && historyMessages[0].role === "assistant") {
        historyMessages.shift();
      }
      
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: "You are a helpful AI assistant in a WhatsApp-style chat. Be friendly, conversational, and concise. Keep responses natural and engaging.",
        },
        // Add filtered chat history
        ...historyMessages,
        // Add current message (already translated to English if needed)
        {
          role: "user",
          content: messageToProcess,
        },
      ];

      // Call Sarvam chat completion
      const response = await client.chat.completions({
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 1024,
      });

      responseContent = response.choices[0].message.content;
    } else {
      // Gemini provider (using LangChain)
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
      if (!apiKey) {
        console.error("Gemini API key not found in environment variables");
        return NextResponse.json(
          { error: "API key not configured" },
          { status: 500 }
        );
      }

      // Initialize LangChain Gemini model
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: apiKey,
        temperature: 0.7,
        maxOutputTokens: 1024,
      });

      // Create chat prompt template with system message
      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a helpful AI assistant in a WhatsApp-style chat. Be friendly, conversational, and concise. Keep responses natural and engaging.",
        ],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
      ]);

      // Build chat history from previous messages
      const chatHistory: BaseMessage[] = history
        .slice(-10) // Keep last 10 messages for context
        .map((msg) =>
          msg.sent
            ? new HumanMessage(msg.message)
            : new AIMessage(msg.message)
        );

      // Create conversation chain
      const chain = RunnableSequence.from([
        prompt,
        model,
      ]);

      // Invoke the chain with input and history (using translated message if applicable)
      const response = await chain.invoke({
        input: messageToProcess,
        chat_history: chatHistory,
      });

      responseContent = response.content as string;
    }

    // Step 2: Translate AI response back to user's language if needed
    let finalResponse = responseContent;
    if (needsTranslation && !translationError) {
      try {
        const translationResponse = await fetch(
          `${request.nextUrl.origin}/api/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
              "x-real-ip": request.headers.get("x-real-ip") || "",
            },
            body: JSON.stringify({
              input: responseContent,
              source_language_code: "en-IN",
              target_language_code: selectedLanguage,
            }),
          }
        );

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          finalResponse = translationData.translated_text;
        } else {
          console.error("Failed to translate AI response back to user language");
          // Return English response if translation fails
        }
      } catch (error) {
        console.error("Translation error:", error);
        // Return English response if translation fails
      }
    }

    return NextResponse.json({
      message: finalResponse,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      translationError: translationError,
      // remaining: remaining - 1,
    });
  } catch (error) {
    console.error("Error calling AI API:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
