"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = value.trim().length > 0 && !disabled;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
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
    <div className="sticky bottom-0 border-t border-white/10 bg-black/80 p-3 backdrop-blur-xl sm:p-4">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/30 transition focus-within:border-white/25">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder={disabled ? "Generating response..." : "Message Gemma..."}
            className="max-h-44 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:text-neutral-500"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-600"
          >
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
