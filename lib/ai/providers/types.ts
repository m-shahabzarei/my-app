import type { AiProvider } from "@/types/ai/index";

export type AiProviderChatRole = "system" | "user" | "assistant";

export interface AiProviderChatMessage {
  role: AiProviderChatRole;
  content: string;
}

export interface AiProviderChatCompletionResult {
  content: string;
  reasoningContent?: string;
}

export interface AiProviderErrorShape {
  provider: AiProvider;
  providerName: string;
  status?: number;
  code?: string | number;
  type?: string;
  message?: string;
}

export class AiProviderError extends Error {
  provider: AiProvider;
  providerName: string;
  status: number;
  code?: string | number;
  type?: string;

  constructor(error: AiProviderErrorShape) {
    super(error.message || `${error.providerName} request failed.`);
    this.name = "AiProviderError";
    this.provider = error.provider;
    this.providerName = error.providerName;
    this.status = error.status ?? 502;
    this.code = error.code;
    this.type = error.type;
  }
}

export function getProviderErrorResponse(error: AiProviderError, rejectedMessage = "The AI provider rejected this request.") {
  if (error.status === 401 || error.status === 403) {
    return {
      status: 502,
      message: `AI provider authentication failed. Check the ${error.providerName} API key.`,
    };
  }

  if (error.status === 429) {
    return {
      status: 429,
      message:
        error.provider === "openrouter"
          ? "OpenRouter is rate limiting this model. Free models still have per-minute and daily request limits; wait a bit or use an account with credits."
          : `${error.providerName} is rate limiting requests. Please wait a moment and try again.`,
    };
  }

  if (error.status === 400) {
    return {
      status: 400,
      message: rejectedMessage,
    };
  }

  if (error.status >= 500) {
    return {
      status: 503,
      message: `${error.providerName} is temporarily unavailable. Please try again shortly.`,
    };
  }

  return {
    status: 502,
    message: "The AI provider failed to respond.",
  };
}
