import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, retryWithBackoff } from "@/lib/ai";

interface GeminiRequest {
  message: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

interface GeminiErrorResponse {
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const clientIp = getClientIp(request);
  
  console.log(`[${requestId}] Incoming request from IP: ${clientIp}`);

  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    console.warn(`[${requestId}] Rate limit exceeded for IP: ${clientIp}`);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body: GeminiRequest = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(`[${requestId}] Gemini API key is not configured`);
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const aiResponse = await callGeminiWithRetry(requestId, message, apiKey);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error(`[${requestId}] Error in chat API:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function callGeminiWithRetry(
  requestId: string,
  message: string,
  apiKey: string
): Promise<string> {
  return retryWithBackoff(
    async () => {
      console.log(`[${requestId}] Calling Gemini API...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: message,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 512, // Reduced from 1024
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData: GeminiErrorResponse = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || "Unknown error";
        
        console.error(`[${requestId}] Gemini API error:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });

        if (response.status === 429) {
          throw new Error(`Gemini API rate limit exceeded: ${errorMessage}`);
        }

        throw new Error(`Gemini API error ${response.status}: ${errorMessage}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated from Gemini API");
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log(`[${requestId}] Gemini API response received successfully`);
      
      return aiResponse;
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
      shouldRetry: (error: Error) => error.message.includes("429"),
    }
  );
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIp(request: NextRequest): string {
  // Try multiple headers that might contain the client IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to a default value
  return "unknown";
}
