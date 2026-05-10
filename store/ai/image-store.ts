import { create } from "zustand";
import { defaultAiImageSize, isAiImageSize } from "@/config/ai-image";
import { getDefaultAiModelByCapability, getEnabledAiModelsByCapability } from "@/config/ai-models";
import type { AiImageGenerationResponse, AiImageSize } from "@/types/ai/index";

interface AiImageState {
  prompt: string;
  selectedModelId: string | null;
  selectedSize: AiImageSize;
  isGenerating: boolean;
  imageUrl: string | null;
  error: string | null;
  setPrompt: (prompt: string) => void;
  selectModel: (modelId: string) => void;
  selectSize: (size: AiImageSize) => void;
  generateImage: () => Promise<void>;
  clearError: () => void;
  clearImage: () => void;
}

type ImageGenerationApiResponse = Partial<AiImageGenerationResponse> & {
  error?: string;
};

function getDefaultImageModelId() {
  return getDefaultAiModelByCapability("image-generation")?.modelId ?? null;
}

function isEnabledImageModel(modelId: string) {
  return getEnabledAiModelsByCapability("image-generation").some((model) => model.modelId === modelId);
}

export const useAiImageStore = create<AiImageState>((set, get) => ({
  prompt: "",
  selectedModelId: getDefaultImageModelId(),
  selectedSize: defaultAiImageSize,
  isGenerating: false,
  imageUrl: null,
  error: null,

  setPrompt: (prompt) => set({ prompt, error: null }),

  selectModel: (modelId) => {
    if (!isEnabledImageModel(modelId)) return;
    set({ selectedModelId: modelId, error: null });
  },

  selectSize: (size) => {
    if (!isAiImageSize(size)) return;
    set({ selectedSize: size, error: null });
  },

  generateImage: async () => {
    const state = get();
    const prompt = state.prompt.trim();

    if (state.isGenerating) return;

    if (!prompt) {
      set({ error: "Describe the image you want to create first." });
      return;
    }

    if (!state.selectedModelId) {
      set({ error: "Select an image model before generating." });
      return;
    }

    set({ isGenerating: true, error: null, imageUrl: null });

    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          modelId: state.selectedModelId,
          size: state.selectedSize,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ImageGenerationApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed.");
      }

      const imageUrl = data.imageUrl?.trim();

      if (!imageUrl) {
        throw new Error("The image provider returned an empty response.");
      }

      set({ imageUrl, isGenerating: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while generating the image.";
      set({ error: message, isGenerating: false });
    }
  },

  clearError: () => set({ error: null }),
  clearImage: () => set({ imageUrl: null, error: null }),
}));
