import "server-only";

import OpenAI from "openai";
import { AiProviderError, type AiProviderChatCompletionResult, type AiProviderChatMessage } from "./types";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface ProviderErrorShape {
  status?: number;
  code?: string | number;
  type?: string;
  message?: string;
  error?: {
    status?: number;
    code?: string | number;
    type?: string;
    message?: string;
  };
}

export class OpenRouterProviderError extends AiProviderError {
  constructor(error: ProviderErrorShape) {
    super({
      provider: "openrouter",
      providerName: "OpenRouter",
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message || "OpenRouter request failed.",
    });
    this.name = "OpenRouterProviderError";
  }
}

function getOpenRouterHeaders() {
  const siteUrl = process.env.OPENROUTER_SITE_URL?.trim();
  const appName = process.env.OPENROUTER_APP_NAME?.trim() || process.env.NEXT_PUBLIC_APP_NAME?.trim() || "AI Tools";

  return {
    ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
    "X-OpenRouter-Title": appName,
  };
}

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "your_key_here" || apiKey === "your_openrouter_api_key_here") {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  return new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    defaultHeaders: getOpenRouterHeaders(),
  });
}

function toProviderError(error: unknown): OpenRouterProviderError {
  if (error && typeof error === "object") {
    const candidate = error as ProviderErrorShape;
    const providerError = candidate.error;

    return new OpenRouterProviderError({
      status: candidate.status ?? providerError?.status,
      code: candidate.code ?? providerError?.code,
      type: candidate.type ?? providerError?.type,
      message: providerError?.message ?? candidate.message,
    });
  }

  return new OpenRouterProviderError({ message: "OpenRouter request failed." });
}

export async function createOpenRouterChatCompletion(
  model: string,
  messages: AiProviderChatMessage[]
): Promise<AiProviderChatCompletionResult> {
  const client = getOpenRouterClient();

  let response;

  try {
    response = await client.chat.completions.create({
      model,
      messages,
    });
  } catch (error) {
    throw toProviderError(error);
  }

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new OpenRouterProviderError({ message: "The AI provider returned an empty response.", status: 502 });
  }

  return { content };
}
