"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
  children: ReactNode;
}

export default function CodeBlock({ code, language, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const label = language || "text";

  async function copyCode() {
    if (!code.trim()) return;

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-2xl shadow-black/25">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">{label}</span>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="inline-flex h-8 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto p-4 text-[13px] leading-6 text-neutral-100 sm:text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
