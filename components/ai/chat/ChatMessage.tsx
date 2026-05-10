"use client";

import { useId, useState } from "react";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import type { AiChatMessage } from "@/types/ai/index";
import MessageReasoning from "./MessageReasoning";
import ReasoningToggle from "./ReasoningToggle";

interface ChatMessageProps {
  message: AiChatMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const reasoningId = useId();
  const isUser = message.role === "user";
  const Icon = isUser ? User : Bot;
  const hasReasoning = !isUser && Boolean(message.reasoningContent);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-300">
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-3xl border px-4 py-3 text-sm leading-6 shadow-xl shadow-black/10 sm:max-w-[70%] ${
          isUser
            ? "border-white/15 bg-white text-black"
            : "border-white/10 bg-white/5 text-neutral-100"
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>

        {hasReasoning && message.reasoningContent && (
          <>
            <ReasoningToggle
              expanded={reasoningExpanded}
              onToggle={() => setReasoningExpanded((expanded) => !expanded)}
              controlsId={reasoningId}
            />
            <MessageReasoning id={reasoningId} expanded={reasoningExpanded} content={message.reasoningContent} />
          </>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-black">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </motion.article>
  );
}
