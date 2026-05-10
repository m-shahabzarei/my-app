import type { AiModelConfig } from "@/types/ai/index";
import { createGapGptChatCompletion, GapGptProviderError } from "./gapgpt";
import { createOpenRouterChatCompletion, OpenRouterProviderError } from "./openrouter";
import { AiProviderError, type AiProviderChatCompletionResult, type AiProviderChatMessage } from "./types";

export { createGapGptChatCompletion, createGapGptImageGeneration, GapGptProviderError } from "./gapgpt";
export { createOpenRouterChatCompletion, OpenRouterProviderError } from "./openrouter";
export { AiProviderError, getProviderErrorResponse } from "./types";
export type { AiProviderChatCompletionResult, AiProviderChatMessage, AiProviderChatRole } from "./types";

export async function createAiChatCompletion(
  model: AiModelConfig,
  messages: AiProviderChatMessage[]
): Promise<AiProviderChatCompletionResult> {
  if (model.provider === "gapgpt") {
    return createGapGptChatCompletion(model.modelId, messages);
  }

  if (model.provider === "openrouter") {
    return createOpenRouterChatCompletion(model.modelId, messages);
  }

  throw new AiProviderError({
    provider: model.provider,
    providerName: model.providerName,
    status: 400,
    message: `${model.providerName} is not implemented for chat completions.`,
  });
}

export function isKnownAiProviderError(error: unknown): error is AiProviderError {
  return error instanceof AiProviderError || error instanceof GapGptProviderError || error instanceof OpenRouterProviderError;
}
