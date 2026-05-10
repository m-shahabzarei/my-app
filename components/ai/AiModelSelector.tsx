"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAiModels } from "@/hooks/ai/useAiModels";
import type { AiCapability } from "@/types/ai/index";

interface AiModelSelectorProps {
  capability?: AiCapability;
}

export default function AiModelSelector({ capability = "chat" }: AiModelSelectorProps) {
  const { modelGroups, selectedModelId, selectModel } = useAiModels(capability);
  const hasModels = modelGroups.some((group) => group.models.length > 0);
  const firstModelId = modelGroups[0]?.models[0]?.modelId ?? null;

  useEffect(() => {
    if (!hasModels || selectedModelId || !firstModelId) return;
    selectModel(firstModelId);
  }, [firstModelId, hasModels, selectedModelId, selectModel]);

  return (
    <div className="relative min-w-56">
      <select
        value={selectedModelId ?? ""}
        onChange={(event) => selectModel(event.target.value || null)}
        disabled={!hasModels}
        className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 pr-10 text-sm text-neutral-300 outline-none transition hover:border-white/20 focus:border-white/30 disabled:cursor-not-allowed disabled:text-neutral-500"
      >
        {!hasModels && <option value="">No models available</option>}
        {modelGroups.map((group) => (
          <optgroup key={group.provider} label={group.providerName}>
            {group.models.map((model) => (
              <option key={model.modelId} value={model.modelId}>
                {model.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
    </div>
  );
}
