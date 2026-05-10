"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2 } from "lucide-react";
import AiModelSelector from "@/components/ai/AiModelSelector";
import AiPageHeader from "@/components/ai/AiPageHeader";
import { useAiModels } from "@/hooks/ai/useAiModels";
import { useAiChatStore } from "@/store/ai/useAiChatStore";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import EmptyChatState from "./EmptyChatState";

export default function ChatContainer() {
  const messages = useAiChatStore((state) => state.messages);
  const isGenerating = useAiChatStore((state) => state.isGenerating);
  const error = useAiChatStore((state) => state.error);
  const sendMessage = useAiChatStore((state) => state.sendMessage);
  const clearMessages = useAiChatStore((state) => state.clearMessages);
  const clearError = useAiChatStore((state) => state.clearError);
  const { selectedModelId } = useAiModels("chat");
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isGenerating, error]);

  async function handleSendMessage(content: string) {
    await sendMessage(content, selectedModelId);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_28rem),#050505] text-white">
      <div className="mx-auto flex w-full  flex-1 flex-col gap-5 p-4 pb-0 sm:p-6 sm:pb-0 xl:p-8 xl:pb-0">
        <AiPageHeader
          eyebrow="AI Chat"
          action={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <AiModelSelector />
              <button
                type="button"
                onClick={clearMessages}
                disabled={messages.length === 0 || isGenerating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:border-white/10 disabled:hover:bg-black/30"
              >
                <Trash2 className="h-4 w-4" />
                پاک کردن چت
              </button>
            </div>
          }
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/3 shadow-2xl shadow-black/20">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <EmptyChatState />
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                </AnimatePresence>
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-400">
                      Gemma is thinking...
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                      <button type="button" onClick={clearError} className="text-xs text-rose-200/70 transition hover:text-rose-100">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
                <div ref={scrollAnchorRef} />
              </div>
            )}
          </div>

          <ChatInput onSend={handleSendMessage} disabled={isGenerating} />
        </main>
      </div>
    </div>
  );
}
