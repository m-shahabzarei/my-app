"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Braces, Loader2, SendHorizontal } from "lucide-react";

interface CodeChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function CodeChatInput({ onSend, disabled = false }: CodeChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = value.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [value]);

  async function send() {
    if (!canSend) return;
    const message = value;
    setValue("");
    await onSend(message);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void send();
  }

  return (
    <div className="sticky bottom-0 border-t border-white/10 bg-[#050505]/90 p-3 backdrop-blur-2xl sm:p-4">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.045] p-2 shadow-2xl shadow-black/30 transition focus-within:border-cyan-300/35">
        <div className="flex items-start gap-2">
          <div className="mt-2 hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 sm:flex">
            <Braces className="h-4 w-4" />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={disabled}
            placeholder={disabled ? "Generating coding response..." : "Ask for a refactor, paste an error, or describe the code you want..."}
            className="max-h-56 min-h-16 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-6 text-white outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:text-neutral-500 sm:px-3"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            aria-label="Send coding message"
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-600"
          >
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 pb-2 pt-1 font-mono text-[11px] text-neutral-600">
          <span>Enter sends</span>
          <span>Shift + Enter adds a line</span>
          <span>Markdown and code blocks supported</span>
        </div>
      </div>
    </div>
  );
}
