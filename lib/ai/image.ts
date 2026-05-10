import "server-only";

import { createGapGptImageGeneration } from "@/lib/ai/providers";
import type { AiImageGenerationResponse, AiImageSize, AiModelConfig } from "@/types/ai/index";

interface GenerateAiImageParams {
  model: AiModelConfig;
  prompt: string;
  size: AiImageSize;
}

export async function generateAiImage({ model, prompt, size }: GenerateAiImageParams): Promise<AiImageGenerationResponse> {
  if (model.provider === "gapgpt") {
    const result = await createGapGptImageGeneration(model.modelId, prompt, size);
    return { imageUrl: result.url };
  }

  throw new Error("Selected provider is not implemented for image generation yet.");
}
