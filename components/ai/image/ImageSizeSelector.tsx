"use client";

import { ChevronDown } from "lucide-react";
import { aiImageSizes } from "@/config/ai-image";
import type { AiImageSize } from "@/types/ai/index";

interface ImageSizeSelectorProps {
  value: AiImageSize;
  onChange: (size: AiImageSize) => void;
  disabled?: boolean;
}

export default function ImageSizeSelector({ value, onChange, disabled = false }: ImageSizeSelectorProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-neutral-400">
      Image size
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as AiImageSize)}
          disabled={disabled}
          className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/30 px-4 pr-10 text-sm text-neutral-200 outline-none transition hover:border-white/20 focus:border-white/30 disabled:cursor-not-allowed disabled:text-neutral-500"
        >
          {aiImageSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label} · {size.description}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      </div>
    </label>
  );
}
