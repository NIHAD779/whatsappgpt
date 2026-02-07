import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient, SarvamAI } from "sarvamai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface TTSRequest {
  input: string;
  target_language_code: string;
  speaker?: string;
  model?: string;
  pitch?: number;
  pace?: number;
  loudness?: number;
  speech_sample_rate?: number;
  enable_preprocessing?: boolean;
}

// Initialize rate limiter: 15 requests per day per IP for TTS
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(15, "1 d"),
  analytics: true,
  prefix: "whatsappgpt:tts:ratelimit",
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
          error: "Daily limit reached. You can use TTS 15 times per day.",
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
      target_language_code,
      speaker = "meera",
      model = "bulbul:v1",
      pitch,
      pace,
      loudness,
      speech_sample_rate,
      enable_preprocessing,
    }: TTSRequest = await request.json();

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

    // Build TTS request parameters
    const ttsParams: SarvamAI.TextToSpeechRequest = {
      text: input,
      target_language_code: target_language_code as SarvamAI.TextToSpeechLanguage,
      speaker: speaker as SarvamAI.TextToSpeechSpeaker,
      model: model as SarvamAI.TextToSpeechModel,
    };

    // Add optional parameters if provided
    if (pitch !== undefined) ttsParams.pitch = pitch;
    if (pace !== undefined) ttsParams.pace = pace;
    if (loudness !== undefined) ttsParams.loudness = loudness;
    if (speech_sample_rate !== undefined) ttsParams.speech_sample_rate = speech_sample_rate as SarvamAI.SpeechSampleRate;
    if (enable_preprocessing !== undefined) ttsParams.enable_preprocessing = enable_preprocessing;

    // Call TTS API
    const response = await client.textToSpeech.convert(ttsParams);

    // Return audio data with proper headers (audios is an array, return the first one)
    return NextResponse.json(
      {
        audio_base64: response.audios[0],
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
    console.error("Error calling Sarvam TTS API:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
