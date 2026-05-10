"use client";

import { useLayoutEffect, useRef, type KeyboardEvent } from "react";

interface ImagePromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function ImagePromptInput({ value, onChange, onSubmit, disabled = false }: ImagePromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 260)}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) return;
    event.preventDefault();
    onSubmit();
  }

  return (
    <label className="block">
      <span className="mb-3 block text-sm font-medium text-neutral-300">Prompt</span>
      <div className="rounded-3xl border border-white/10 bg-black/30 p-3 shadow-2xl shadow-black/20 transition focus-within:border-white/25 focus-within:bg-black/40">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={5}
          placeholder="Describe the image you want to create..."
          className="min-h-40 w-full resize-none bg-transparent px-2 py-2 text-base leading-7 text-white outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:text-neutral-500"
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1 text-xs text-neutral-600">
          <span>Use vivid details for composition, lighting, mood, and style.</span>
          <span className="hidden sm:inline">⌘/Ctrl + Enter</span>
        </div>
      </div>
    </label>
  );
}
