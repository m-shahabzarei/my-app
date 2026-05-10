"use client";

import { useMemo } from "react";
import { getAiModelGroups } from "@/config/ai-models";
import { useAiModelsStore } from "@/store/ai/useAiModelsStore";
import type { AiCapability } from "@/types/ai/index";

export function useAiModels(capability?: AiCapability) {
  const availableModels = useAiModelsStore((state) => state.models);
  const storedSelectedModelId = useAiModelsStore((state) => state.selectedModelId);
  const selectModel = useAiModelsStore((state) => state.selectModel);

  const models = useMemo(
    () => availableModels.filter((model) => !capability || model.capabilities.includes(capability)),
    [availableModels, capability]
  );
  const modelGroups = useMemo(() => getAiModelGroups(models), [models]);
  const selectedModel = useMemo(
    () => models.find((model) => model.modelId === storedSelectedModelId) ?? null,
    [models, storedSelectedModelId]
  );

  return {
    models,
    modelGroups,
    selectedModel,
    selectedModelId: selectedModel?.modelId ?? null,
    selectModel,
  };
}
