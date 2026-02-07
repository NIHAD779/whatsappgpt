import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize rate limiter: 15 requests per day per IP for Vision
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(15, "1 d"),
  analytics: true,
  prefix: "whatsappgpt:vision:ratelimit",
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
          error: "Daily limit reached. You can use Vision 15 times per day.",
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
    const prompt = (formData.get("prompt") as string) || "What's in this image?";
    const selectedLanguage = (formData.get("selectedLanguage") as string) || "en-IN";

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Get Google API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
    if (!apiKey) {
      console.error("Google API key not found in environment variables");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // Translate prompt to English if needed
    let englishPrompt = prompt;
    const needsTranslation = selectedLanguage !== "en-IN";

    if (needsTranslation && prompt) {
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
              input: prompt,
              source_language_code: selectedLanguage,
              target_language_code: "en-IN",
            }),
          }
        );

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          englishPrompt = translationData.translated_text;
        }
      } catch (error) {
        console.error("Translation error:", error);
        // Continue with original prompt
      }
    }

    // Call Gemini Vision API
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      { text: englishPrompt },
    ]);

    const response = result.response;
    let responseText = response.text();

    // Translate response back to user's language if needed
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
              input: responseText,
              source_language_code: "en-IN",
              target_language_code: selectedLanguage,
            }),
          }
        );

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          responseText = translationData.translated_text;
        }
      } catch (error) {
        console.error("Translation error:", error);
        // Return English response if translation fails
      }
    }

    return NextResponse.json(
      {
        message: responseText,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
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
    console.error("Error calling Gemini Vision API:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
