import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient, SarvamAI } from "sarvamai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface TranslateRequest {
  input: string;
  source_language_code?: string;
  target_language_code: string;
  speaker_gender?: "Male" | "Female";
}

// Initialize rate limiter: 20 requests per day per IP for translation
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(20, "1 d"),
  analytics: true,
  prefix: "whatsappgpt:translate:ratelimit",
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      const resetDate = new Date(reset);
      return NextResponse.json(
        {
          error: "Daily limit reached. You can translate 20 times per day.",
          limit,
          remaining: 0,
          resetAt: resetDate.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const {
      input,
      source_language_code = "auto",
      target_language_code,
      speaker_gender = "Male",
    }: TranslateRequest = await request.json();

    // Validate required fields
    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    if (!target_language_code) {
      return NextResponse.json(
        { error: "Target language code is required" },
        { status: 400 }
      );
    }

    // Get Sarvam API key
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

    // Call translation API
    const response = await client.text.translate({
      input: input,
      source_language_code: source_language_code as SarvamAI.TranslateSourceLanguage,
      target_language_code: target_language_code as SarvamAI.TranslateTargetLanguage,
      speaker_gender: speaker_gender as SarvamAI.TranslateSpeakerGender,
    });

    return NextResponse.json(
      {
        translated_text: response.translated_text,
        source_language_code: response.source_language_code,
        target_language_code: target_language_code,
        remaining: remaining - 1,
      },
      {
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": (remaining - 1).toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Error calling Sarvam Translation API:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
