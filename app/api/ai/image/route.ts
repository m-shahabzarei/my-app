import { NextResponse } from "next/server";
import { defaultAiImageSize, isAiImageSize } from "@/config/ai-image";
import { getAiModelById } from "@/config/ai-models";
import { GapGptProviderError } from "@/lib/ai/providers";
import { generateAiImage } from "@/lib/ai/image";
import type { AiImageSize } from "@/types/ai/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PROMPT_LENGTH = 4000;

type ImageRequestBody = {
  model?: unknown;
  modelId?: unknown;
  prompt?: unknown;
  size?: unknown;
};

function getRequestedModelId(body: ImageRequestBody): string | null {
  if (typeof body.model === "string") return body.model;
  if (typeof body.modelId === "string") return body.modelId;
  return null;
}

function getRequestedSize(body: ImageRequestBody): AiImageSize | { error: string } {
  if (body.size === undefined || body.size === null || body.size === "") return defaultAiImageSize;
  if (isAiImageSize(body.size)) return body.size;
  return { error: "Please select a supported image size." };
}

function parseRequestBody(body: ImageRequestBody) {
  if (typeof body.prompt !== "string") {
    return { error: "Please describe the image you want to create." } as const;
  }

  const prompt = body.prompt.trim();

  if (!prompt) {
    return { error: "Please describe the image you want to create." } as const;
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { error: `Prompt must be ${MAX_PROMPT_LENGTH.toLocaleString()} characters or fewer.` } as const;
  }

  const requestedModelId = getRequestedModelId(body);

  if (!requestedModelId) {
    return { error: "Please select a valid image model." } as const;
  }

  const model = getAiModelById(requestedModelId);

  if (!model || !model.enabled || !model.capabilities.includes("image-generation")) {
    return { error: "Selected model is not available for image generation." } as const;
  }

  const size = getRequestedSize(body);

  if (typeof size !== "string") {
    return { error: size.error } as const;
  }

  return { model, prompt, size } as const;
}

function getProviderErrorResponse(error: GapGptProviderError) {
  if (error.status === 401 || error.status === 403) {
    return {
      status: 502,
      message: "AI provider authentication failed. Check the GapGPT API key.",
    };
  }

  if (error.status === 429) {
    return {
      status: 429,
      message: "Image generation is rate limited right now. Please wait a moment and try again.",
    };
  }

  if (error.status === 400) {
    return {
      status: 400,
      message: "The image provider rejected this prompt, model, or size.",
    };
  }

  if (error.status >= 500) {
    return {
      status: 503,
      message: "GapGPT image generation is temporarily unavailable. Please try again shortly.",
    };
  }

  return {
    status: 502,
    message: "The image provider failed to respond.",
  };
}

export async function POST(request: Request) {
  let body: ImageRequestBody;

  try {
    body = (await request.json()) as ImageRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = parseRequestBody(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await generateAiImage(parsed);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GapGptProviderError) {
      const response = getProviderErrorResponse(error);
      return NextResponse.json({ error: response.message }, { status: response.status });
    }

    const message = error instanceof Error ? error.message : "Image generation failed.";

    return NextResponse.json(
      {
        error: message.includes("GAPGPT_API_KEY")
          ? "AI provider is not configured. Add GAPGPT_API_KEY to .env.local."
          : message,
      },
      { status: message.includes("GAPGPT_API_KEY") ? 500 : 502 }
    );
  }
}
