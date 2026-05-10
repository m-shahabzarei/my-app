import type { LucideIcon } from "lucide-react";

export type AiToolStatus = "active" | "disabled";

export type AiToolSlug =
  | "chat"
  | "image"
  | "code"
  | "video"
  | "flashcards"
  | "powerpoint"
  | "files"
  | "speech-to-text";

export interface AiToolDefinition {
  slug: AiToolSlug;
  title: string;
  description: string;
  href: string;
  status: AiToolStatus;
  icon: LucideIcon;
  accent?: {
    label: string;
    cardClassName: string;
    iconClassName: string;
    glowClassName: string;
  };
}

export type AiProvider = "gapgpt" | "openrouter" | "openai" | "anthropic" | "google" | "xai" | "local" | "custom";

export type AiCapability =
  | "chat"
  | "code"
  | "vision"
  | "image"
  | "image-generation"
  | "video"
  | "video-generation"
  | "files"
  | "speech-to-text"
  | "embeddings"
  | "multimodal";

export interface AiModelConfig {
  provider: AiProvider;
  providerName: string;
  modelId: string;
  displayName: string;
  capabilities: AiCapability[];
  enabled: boolean;
  comingSoon?: boolean;
}

export interface AiModelGroup {
  provider: AiProvider;
  providerName: string;
  models: AiModelConfig[];
}

export type AiChatRole = "user" | "assistant";

export interface AiChatMessage {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
  reasoningContent?: string;
}

export type AiImageSize = "1024x1024" | "1024x1792" | "1792x1024";

export interface AiImageGenerationRequest {
  prompt: string;
  modelId: string;
  size: AiImageSize;
}

export interface AiImageGenerationResponse {
  imageUrl: string;
}
