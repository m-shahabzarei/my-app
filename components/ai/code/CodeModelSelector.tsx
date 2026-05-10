"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { getAiModelGroups, getEnabledAiModelsByCapability } from "@/config/ai-models";

interface CodeModelSelectorProps {
  selectedModelId: string | null;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export default function CodeModelSelector({ selectedModelId, onModelChange, disabled = false }: CodeModelSelectorProps) {
  const modelGroups = useMemo(() => getAiModelGroups(getEnabledAiModelsByCapability("code")), []);
  const hasModels = modelGroups.some((group) => group.models.length > 0);

  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-72">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">Code model</span>
      <div className="relative">
        <select
          value={selectedModelId ?? ""}
          onChange={(event) => onModelChange(event.target.value)}
          disabled={!hasModels || disabled}
          className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-black/35 px-4 pr-10 text-sm text-neutral-200 outline-none transition hover:border-cyan-300/25 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:text-neutral-500"
        >
          {!hasModels && <option value="">No code models available</option>}
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
    </label>
  );
}
