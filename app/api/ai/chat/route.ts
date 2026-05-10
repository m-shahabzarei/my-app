import { NextResponse } from "next/server";
import { getAiModelById } from "@/config/ai-models";
import { createAiChatCompletion, getProviderErrorResponse, isKnownAiProviderError } from "@/lib/ai/providers";
import type { AiProviderChatMessage } from "@/lib/ai/providers";
import type { AiChatMessage } from "@/types/ai/index";

type ChatRequestBody = {
  model?: unknown;
  modelId?: unknown;
  messages?: unknown;
};

function isProviderMessage(message: unknown): message is AiProviderChatMessage {
  if (!message || typeof message !== "object") return false;
  const candidate = message as Partial<AiChatMessage>;
  return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string";
}

function getRequestedModelId(body: ChatRequestBody): string | null {
  if (typeof body.model === "string") return body.model;
  if (typeof body.modelId === "string") return body.modelId;
  return null;
}

function parseRequestBody(body: ChatRequestBody) {
  const requestedModelId = getRequestedModelId(body);

  if (!requestedModelId) {
    return { error: "Please select a valid AI model." } as const;
  }

  const model = getAiModelById(requestedModelId);
  if (!model || !model.enabled || !model.capabilities.includes("chat")) {
    return { error: "Selected model is not available for chat." } as const;
  }

  if (!Array.isArray(body.messages)) {
    return { error: "Messages must be provided." } as const;
  }

  const messages = body.messages.filter(isProviderMessage).map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  if (messages.length === 0 || messages.every((message) => !message.content)) {
    return { error: "Message content is empty." } as const;
  }

  return {
    model,
    messages: messages.filter((message) => message.content),
  } as const;
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = parseRequestBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const completion = await createAiChatCompletion(parsed.model, parsed.messages);

    return NextResponse.json({
      message: {
        role: "assistant",
        content: completion.content,
        ...(completion.reasoningContent ? { reasoning_content: completion.reasoningContent } : {}),
      },
    });
  } catch (error) {
    if (isKnownAiProviderError(error)) {
      const response = getProviderErrorResponse(error);
      return NextResponse.json({ error: response.message }, { status: response.status });
    }

    const message = error instanceof Error ? error.message : "AI request failed.";
    const missingApiKey = message.includes("_API_KEY");

    return NextResponse.json(
      {
        error: missingApiKey
          ? "AI provider is not configured. Add the required API key to .env.local."
          : "The AI provider failed to respond.",
      },
      { status: missingApiKey ? 500 : 502 }
    );
  }
}
