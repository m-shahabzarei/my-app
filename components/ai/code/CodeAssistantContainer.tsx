"use client";

import { useEffect, useMemo, useRef } from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getAiModelById } from "@/config/ai-models";
import { useAiCodeStore } from "@/store/ai/useAiCodeStore";
import CodeChatInput from "./CodeChatInput";
import CodeEmptyState from "./CodeEmptyState";
import CodeMessage from "./CodeMessage";
import CodeModelSelector from "./CodeModelSelector";

export default function CodeAssistantContainer() {
  const messages = useAiCodeStore((state) => state.messages);
  const isGenerating = useAiCodeStore((state) => state.isGenerating);
  const selectedModelId = useAiCodeStore((state) => state.selectedModelId);
  const error = useAiCodeStore((state) => state.error);
  const selectModel = useAiCodeStore((state) => state.selectModel);
  const sendMessage = useAiCodeStore((state) => state.sendMessage);
  const clearMessages = useAiCodeStore((state) => state.clearMessages);
  const clearError = useAiCodeStore((state) => state.clearError);
  const selectedModel = useMemo(() => (selectedModelId ? getAiModelById(selectedModelId) : null), [selectedModelId]);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isGenerating, error]);

  async function handleSendMessage(content: string) {
    await sendMessage(content);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30rem),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_24rem),#050505] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 pb-0 sm:p-6 sm:pb-0 xl:p-8 xl:pb-0">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-black/20 p-4 sm:flex-row sm:items-end sm:justify-between">
            <CodeModelSelector selectedModelId={selectedModelId} onModelChange={selectModel} disabled={isGenerating} />
            <button
              type="button"
              onClick={clearMessages}
              disabled={messages.length === 0 || isGenerating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:border-white/10 disabled:hover:bg-black/25"
            >
              <Trash2 className="h-4 w-4" />
              Clear chat
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <CodeEmptyState />
            ) : (
              <div className="mx-auto flex max-w-5xl flex-col gap-5">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <CodeMessage key={message.id} message={message} />
                  ))}
                </AnimatePresence>

                {isGenerating && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />
                      {selectedModel?.displayName ?? "Code assistant"} is thinking...
                    </div>
                  </motion.div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>{error}</p>
                        </div>
                        <button type="button" onClick={clearError} className="text-xs text-rose-200/70 transition hover:text-rose-100">
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={scrollAnchorRef} />
              </div>
            )}
          </div>

          <CodeChatInput onSend={handleSendMessage} disabled={isGenerating} />
        </main>
      </div>
    </div>
  );
}
