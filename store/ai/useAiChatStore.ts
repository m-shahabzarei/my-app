import { create } from "zustand";
import type { AiChatMessage } from "@/types/ai/index";

interface AiChatState {
  messages: AiChatMessage[];
  isGenerating: boolean;
  error: string | null;
  sendMessage: (content: string, modelId: string | null) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

type AiChatApiResponse = {
  message?: {
    role: "assistant";
    content: string;
    reasoning_content?: string;
  };
  error?: string;
};

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function createMessage(role: AiChatMessage["role"], content: string, reasoningContent?: string): AiChatMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...(reasoningContent ? { reasoningContent } : {}),
  };
}

export const useAiChatStore = create<AiChatState>((set, get) => ({
  messages: [],
  isGenerating: false,
  error: null,

  sendMessage: async (content, modelId) => {
    const cleanContent = content.trim();
    if (!cleanContent || get().isGenerating) return;

    if (!modelId) {
      set({ error: "Please select an AI model before sending a message." });
      return;
    }

    const userMessage = createMessage("user", cleanContent);
    const nextMessages = [...get().messages, userMessage];

    set({ messages: nextMessages, isGenerating: true, error: null });

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelId, messages: nextMessages }),
      });

      const data = (await response.json().catch(() => ({}))) as AiChatApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      const assistantContent = data.message?.content?.trim();
      if (!assistantContent) {
        throw new Error("The AI provider returned an empty response.");
      }

      const reasoningContent = data.message?.reasoning_content?.trim();

      set((state) => ({
        messages: [...state.messages, createMessage("assistant", assistantContent, reasoningContent)],
        isGenerating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while generating the response.";
      set({ isGenerating: false, error: message });
    }
  },

  clearMessages: () => set({ messages: [], error: null, isGenerating: false }),
  clearError: () => set({ error: null }),
}));
