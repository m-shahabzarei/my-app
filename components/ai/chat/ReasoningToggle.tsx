"use client";

import { Brain, ChevronDown } from "lucide-react";

interface ReasoningToggleProps {
  expanded: boolean;
  onToggle: () => void;
  controlsId: string;
}

export default function ReasoningToggle({ expanded, onToggle, controlsId }: ReasoningToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controlsId}
      className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-white/20 hover:bg-white/10 hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-white/30"
    >
      <Brain className="h-3.5 w-3.5" />
      {expanded ? "Hide reasoning" : "Show reasoning"}
      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>
  );
}
