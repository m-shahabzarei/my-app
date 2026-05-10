import { create } from "zustand";
import { getDefaultAiModelByCapability, getEnabledAiModelsByCapability } from "@/config/ai-models";
import type { AiChatMessage } from "@/types/ai/index";

interface AiCodeState {
  messages: AiChatMessage[];
  isGenerating: boolean;
  selectedModelId: string | null;
  error: string | null;
  selectModel: (modelId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

type AiCodeApiResponse = {
  message?: {
    role: "assistant";
    content: string;
  };
  error?: string;
};

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function createMessage(role: AiChatMessage["role"], content: string): AiChatMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function getDefaultCodeModelId() {
  return getDefaultAiModelByCapability("code")?.modelId ?? null;
}

function isEnabledCodeModel(modelId: string) {
  return getEnabledAiModelsByCapability("code").some((model) => model.modelId === modelId);
}

function toApiMessages(messages: AiChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export const useAiCodeStore = create<AiCodeState>((set, get) => ({
  messages: [],
  isGenerating: false,
  selectedModelId: getDefaultCodeModelId(),
  error: null,

  selectModel: (modelId) => {
    if (!isEnabledCodeModel(modelId)) return;
    set({ selectedModelId: modelId, error: null });
  },

  sendMessage: async (content) => {
    const cleanContent = content.trim();
    const state = get();

    if (!cleanContent || state.isGenerating) return;

    if (!state.selectedModelId) {
      set({ error: "Select a code model before sending a message." });
      return;
    }

    const userMessage = createMessage("user", cleanContent);
    const nextMessages = [...state.messages, userMessage];

    set({ messages: nextMessages, isGenerating: true, error: null });

    try {
      const response = await fetch("/api/ai/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: state.selectedModelId, messages: toApiMessages(nextMessages) }),
      });

      const data = (await response.json().catch(() => ({}))) as AiCodeApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "AI code request failed.");
      }

      const assistantContent = data.message?.content?.trim();

      if (!assistantContent) {
        throw new Error("The AI provider returned an empty response.");
      }

      set((currentState) => ({
        messages: [...currentState.messages, createMessage("assistant", assistantContent)],
        isGenerating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while generating the coding response.";
      set({ isGenerating: false, error: message });
    }
  },

  clearMessages: () => set({ messages: [], error: null, isGenerating: false }),
  clearError: () => set({ error: null }),
}));
