"use client";

import { AnimatePresence, motion } from "framer-motion";

interface MessageReasoningProps {
  id: string;
  expanded: boolean;
  content: string;
}

export default function MessageReasoning({ id, expanded, content }: MessageReasoningProps) {
  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          id={id}
          key="reasoning"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-6 text-neutral-400">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600">Reasoning</p>
            <div className="whitespace-pre-wrap break-words">{content}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
