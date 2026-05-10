"use client";

import { ChevronDown } from "lucide-react";
import { getAiModelGroups, getEnabledAiModelsByCapability } from "@/config/ai-models";
import type { AiImageSize } from "@/types/ai/index";
import ImageSizeSelector from "./ImageSizeSelector";

const imageModelGroups = getAiModelGroups(getEnabledAiModelsByCapability("image-generation"));

interface ImageControlsProps {
  selectedModelId: string | null;
  selectedSize: AiImageSize;
  onModelChange: (modelId: string) => void;
  onSizeChange: (size: AiImageSize) => void;
  disabled?: boolean;
}

export default function ImageControls({
  selectedModelId,
  selectedSize,
  onModelChange,
  onSizeChange,
  disabled = false,
}: ImageControlsProps) {
  const hasModels = imageModelGroups.some((group) => group.models.length > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-2 text-sm text-neutral-400">
        Image model
        <div className="relative">
          <select
            value={selectedModelId ?? ""}
            onChange={(event) => onModelChange(event.target.value)}
            disabled={disabled || !hasModels}
            className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 pr-10 text-sm text-neutral-200 outline-none transition hover:border-white/20 focus:border-white/30 disabled:cursor-not-allowed disabled:text-neutral-500"
          >
            {!hasModels && <option value="">No image models available</option>}
            {imageModelGroups.map((group) => (
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

      <ImageSizeSelector value={selectedSize} onChange={onSizeChange} disabled={disabled} />
    </div>
  );
}
