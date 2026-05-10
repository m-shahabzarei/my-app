import { NextResponse } from "next/server";
import { getAiModelById } from "@/config/ai-models";
import { createAiChatCompletion, getProviderErrorResponse, isKnownAiProviderError } from "@/lib/ai/providers";
import type { AiProviderChatMessage } from "@/lib/ai/providers";
import type { AiChatMessage } from "@/types/ai/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 20000;

const CODE_ASSISTANT_SYSTEM_PROMPT = [
  "You are an expert AI code assistant for professional software engineering work.",
  "Help with coding questions, generation, debugging, refactoring, architecture, and explanations.",
  "Be concise, practical, and precise. Prefer production-ready TypeScript and React/Next.js patterns when relevant.",
  "Use Markdown with fenced code blocks for code, include language identifiers, and explain tradeoffs briefly.",
].join(" ");

type CodeRequestBody = {
  model?: unknown;
  modelId?: unknown;
  messages?: unknown;
};

function isChatMessage(message: unknown): message is AiChatMessage {
  if (!message || typeof message !== "object") return false;
  const candidate = message as Partial<AiChatMessage>;
  return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string";
}

function getRequestedModelId(body: CodeRequestBody): string | null {
  if (typeof body.model === "string") return body.model;
  if (typeof body.modelId === "string") return body.modelId;
  return null;
}

function parseMessages(messages: unknown): AiProviderChatMessage[] | { error: string } {
  if (!Array.isArray(messages)) {
    return { error: "Messages must be provided." };
  }

  const parsedMessages = messages
    .filter(isChatMessage)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_MESSAGES);

  if (parsedMessages.length === 0) {
    return { error: "Ask a coding question before sending." };
  }

  if (parsedMessages.some((message) => message.content.length > MAX_MESSAGE_LENGTH)) {
    return { error: `Each message must be ${MAX_MESSAGE_LENGTH.toLocaleString()} characters or fewer.` };
  }

  if (parsedMessages[parsedMessages.length - 1]?.role !== "user") {
    return { error: "The latest message must be from the user." };
  }

  return [{ role: "system", content: CODE_ASSISTANT_SYSTEM_PROMPT }, ...parsedMessages];
}

function parseRequestBody(body: CodeRequestBody) {
  const requestedModelId = getRequestedModelId(body);

  if (!requestedModelId) {
    return { error: "Please select a valid code model." } as const;
  }

  const model = getAiModelById(requestedModelId);

  if (!model || !model.enabled || !model.capabilities.includes("code")) {
    return { error: "Selected model is not available for code assistance." } as const;
  }

  const messages = parseMessages(body.messages);

  if ("error" in messages) {
    return { error: messages.error } as const;
  }

  return { model, messages } as const;
}

export async function POST(request: Request) {
  let body: CodeRequestBody;

  try {
    body = (await request.json()) as CodeRequestBody;
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
      },
    });
  } catch (error) {
    if (isKnownAiProviderError(error)) {
      const response = getProviderErrorResponse(error, "OpenRouter rejected this coding request or model.");
      return NextResponse.json({ error: response.message }, { status: response.status });
    }

    const message = error instanceof Error ? error.message : "AI code request failed.";
    const missingOpenRouterKey = message.includes("OPENROUTER_API_KEY");

    return NextResponse.json(
      {
        error: missingOpenRouterKey
          ? "AI code provider is not configured. Add OPENROUTER_API_KEY to .env.local."
          : "The AI code provider failed to respond.",
      },
      { status: missingOpenRouterKey ? 500 : 502 }
    );
  }
}
