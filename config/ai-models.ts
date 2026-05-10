import type { AiCapability, AiModelConfig, AiModelGroup } from "@/types/ai/index";

export const aiModels: AiModelConfig[] = [
  {
    provider: "gapgpt",
    providerName: "GapGPT",
    modelId: "gemma-3-27b-it",
    displayName: "Gemma 3 27B",
    capabilities: ["chat"],
    enabled: true,
  },
  {
    provider: "gapgpt",
    providerName: "GapGPT",
    modelId: "deepseek-v4-flash",
    displayName: "DeepSeek V4 Flash",
    capabilities: ["chat"],
    enabled: true,
  },
  {
    provider: "gapgpt",
    providerName: "GapGPT",
    modelId: "gemini-2.5-flash-image",
    displayName: "gemini-2.5-flash-image",
    capabilities: ["image-generation"],
    enabled: true,
  },
  {
    provider: "openrouter",
    providerName: "OpenRouter",
    modelId: "qwen/qwen3-coder:free",
    displayName: "Qwen 3 Coder",
    capabilities: ["code"],
    enabled: true,
  },
  {
    provider: "openrouter",
    providerName: "OpenRouter",
    modelId: "nvidia/nemotron-3-super-120b-a12b:free",
    displayName: "Nemotron 3 Super 120B",
    capabilities: ["code"],
    enabled: true,
  },
];

export function getEnabledAiModels(): AiModelConfig[] {
  return aiModels.filter((model) => model.enabled);
}

export function getAiModelById(modelId: string): AiModelConfig | null {
  return getEnabledAiModels().find((model) => model.modelId === modelId) ?? null;
}

export function getEnabledAiModelsByCapability(capability: AiCapability): AiModelConfig[] {
  return getEnabledAiModels().filter((model) => model.capabilities.includes(capability));
}

export function getDefaultAiModelByCapability(capability: AiCapability): AiModelConfig | null {
  return getEnabledAiModelsByCapability(capability)[0] ?? null;
}

export function getAiModelGroups(models: AiModelConfig[] = getEnabledAiModels()): AiModelGroup[] {
  const groups = new Map<string, AiModelGroup>();

  for (const model of models) {
    const existing = groups.get(model.provider);

    if (existing) {
      existing.models.push(model);
      continue;
    }

    groups.set(model.provider, {
      provider: model.provider,
      providerName: model.providerName,
      models: [model],
    });
  }

  return Array.from(groups.values());
}
