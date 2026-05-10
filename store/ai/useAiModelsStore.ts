import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getEnabledAiModels } from "@/config/ai-models";
import type { AiModelConfig } from "@/types/ai/index";

interface AiModelsState {
  models: AiModelConfig[];
  selectedModelId: string | null;
  registerModels: (models: AiModelConfig[]) => void;
  selectModel: (modelId: string | null) => void;
}

const initialModels = getEnabledAiModels();

function getDefaultModelId() {
  return initialModels[0]?.modelId ?? null;
}

function isEnabledModel(modelId: string | null, models: AiModelConfig[]) {
  return modelId === null || models.some((model) => model.modelId === modelId);
}

export const useAiModelsStore = create<AiModelsState>()(
  persist(
    (set, get) => ({
      models: initialModels,
      selectedModelId: getDefaultModelId(),

      registerModels: (models) => {
        const enabledModels = models.filter((model) => model.enabled);
        const selectedModelStillExists = enabledModels.some((model) => model.modelId === get().selectedModelId);

        set({
          models: enabledModels,
          selectedModelId: selectedModelStillExists ? get().selectedModelId : enabledModels[0]?.modelId ?? null,
        });
      },

      selectModel: (modelId) => {
        if (!isEnabledModel(modelId, get().models)) return;
        set({ selectedModelId: modelId });
      },
    }),
    {
      name: "ai-selected-model-v1",
      partialize: (state) => ({ selectedModelId: state.selectedModelId }),
      merge: (persistedState, currentState) => {
        const selectedModelId =
          persistedState && typeof persistedState === "object" && "selectedModelId" in persistedState
            ? (persistedState.selectedModelId as string | null)
            : null;

        return {
          ...currentState,
          selectedModelId: isEnabledModel(selectedModelId, currentState.models) ? selectedModelId : getDefaultModelId(),
        };
      },
    }
  )
);
