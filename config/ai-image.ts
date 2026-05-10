import type { AiImageSize } from "@/types/ai/index";

export const aiImageSizes: Array<{
  value: AiImageSize;
  label: string;
  description: string;
}> = [
  {
    value: "1024x1024",
    label: "Square",
    description: "1024 × 1024",
  },
  {
    value: "1024x1792",
    label: "Portrait",
    description: "1024 × 1792",
  },
  {
    value: "1792x1024",
    label: "Landscape",
    description: "1792 × 1024",
  },
];

export const defaultAiImageSize: AiImageSize = "1024x1024";

export function isAiImageSize(value: unknown): value is AiImageSize {
  return typeof value === "string" && aiImageSizes.some((size) => size.value === value);
}
