"use client";

import { Bot, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import type { AiChatMessage } from "@/types/ai/index";
import CodeMarkdown from "./CodeMarkdown";

interface CodeMessageProps {
  message: AiChatMessage;
}

export default function CodeMessage({ message }: CodeMessageProps) {
  const isUser = message.role === "user";
  const Icon = isUser ? UserRound : Bot;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div
        className={`min-w-0 rounded-3xl border px-4 py-3 text-sm shadow-2xl shadow-black/15 ${
          isUser
            ? "max-w-[86%] border-white/15 bg-white text-black sm:max-w-[72%]"
            : "w-full max-w-4xl border-white/10 bg-white/[0.045] text-neutral-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap wrap-break-word leading-6">{message.content}</p>
        ) : (
          <div className="code-markdown min-w-0">
            <CodeMarkdown content={message.content} />
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white text-black">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </motion.article>
  );
}
