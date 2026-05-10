import "server-only";

import OpenAI from "openai";
import type { AiImageSize } from "@/types/ai/index";
import { AiProviderError, type AiProviderChatCompletionResult, type AiProviderChatMessage } from "./types";

export const GAPGPT_BASE_URL = "https://api.gapgpt.app/v1";

interface ProviderErrorShape {
  status?: number;
  code?: string | number;
  type?: string;
  message?: string;
}

interface GapGptResponseMessage {
  content?: string | null;
  reasoning_content?: string | null;
}

export interface GapGptImageGenerationResult {
  url: string;
}

export class GapGptProviderError extends AiProviderError {
  constructor(error: ProviderErrorShape) {
    super({
      provider: "gapgpt",
      providerName: "GapGPT",
      status: error.status,
      code: error.code,
      type: error.type,
      message: error.message || "GapGPT request failed.",
    });
    this.name = "GapGptProviderError";
  }
}

function getGapGptClient() {
  const apiKey = process.env.GAPGPT_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("GAPGPT_API_KEY is not configured.");
  }

  return new OpenAI({
    baseURL: GAPGPT_BASE_URL,
    apiKey,
  });
}

function toProviderError(error: unknown): GapGptProviderError {
  if (error && typeof error === "object") {
    const candidate = error as ProviderErrorShape;
    return new GapGptProviderError({
      status: candidate.status,
      code: candidate.code,
      type: candidate.type,
      message: candidate.message,
    });
  }

  return new GapGptProviderError({ message: "GapGPT request failed." });
}

export async function createGapGptChatCompletion(
  model: string,
  messages: AiProviderChatMessage[]
): Promise<AiProviderChatCompletionResult> {
  const client = getGapGptClient();

  let response;

  try {
    response = await client.chat.completions.create({
      model,
      messages,
    });
  } catch (error) {
    throw toProviderError(error);
  }

  const responseMessage = response.choices[0]?.message as GapGptResponseMessage | undefined;
  const content = responseMessage?.content?.trim();
  const reasoningContent = responseMessage?.reasoning_content?.trim();

  if (!content) {
    throw new GapGptProviderError({ message: "The AI provider returned an empty response.", status: 502 });
  }

  return {
    content,
    ...(reasoningContent ? { reasoningContent } : {}),
  };
}

export async function createGapGptImageGeneration(
  model: string,
  prompt: string,
  size: AiImageSize
): Promise<GapGptImageGenerationResult> {
  const client = getGapGptClient();

  let response;

  try {
    response = await client.images.generate({
      model,
      prompt,
      size,
    });
  } catch (error) {
    throw toProviderError(error);
  }

  const url = response.data?.[0]?.url?.trim();

  if (!url) {
    throw new GapGptProviderError({ message: "The AI provider returned an empty image response.", status: 502 });
  }

  return { url };
}
