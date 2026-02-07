import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize rate limiter: 15 requests per day per IP for STT
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(15, "1 d"),
  analytics: true,
  prefix: "whatsappgpt:stt:ratelimit",
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
          error: "Daily limit reached. You can use STT 15 times per day.",
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const languageCode = formData.get("language_code") as string;
    const model = (formData.get("model") as string) || "saarika:v2.5";

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    if (!languageCode) {
      return NextResponse.json(
        { error: "Language code is required" },
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

    // Convert File to Buffer for the SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a File-like object that the SDK expects
    const audioFile = new Blob([buffer], { type: file.type });

    // Call STT API
    const response = await client.speechToText.transcribe({
      file: audioFile as any,
      model: model,
      language_code: languageCode,
    });

    return NextResponse.json(
      {
        transcript: response.transcript,
        language_code: languageCode,
        duration: response.duration,
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
    console.error("Error calling Sarvam STT API:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
