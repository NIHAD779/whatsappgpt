import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NextRequest, NextResponse } from "next/server";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";

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
}

export async function POST(request: NextRequest) {
  try {
    const { message, history }: ChatRequest = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    if (!apiKey) {
      console.error("API key not found in environment variables");
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

    // Invoke the chain with input and history
    const response = await chain.invoke({
      input: message,
      chat_history: chatHistory,
    });

    return NextResponse.json({
      message: response.content,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
  } catch (error) {
    console.error("Error calling LangChain API:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
