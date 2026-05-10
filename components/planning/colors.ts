import type { PlanningTaskColor } from "@/types/planning";

export const planningColorStyles: Record<
  PlanningTaskColor,
  {
    dot: string;
    border: string;
    bg: string;
    text: string;
    ring: string;
  }
> = {
  slate: {
    dot: "bg-slate-400",
    border: "border-slate-500/20",
    bg: "bg-slate-500/10",
    text: "text-slate-200",
    ring: "ring-slate-400/40",
  },
  blue: {
    dot: "bg-blue-400",
    border: "border-blue-500/25",
    bg: "bg-blue-500/10",
    text: "text-blue-200",
    ring: "ring-blue-400/40",
  },
  violet: {
    dot: "bg-violet-400",
    border: "border-violet-500/25",
    bg: "bg-violet-500/10",
    text: "text-violet-200",
    ring: "ring-violet-400/40",
  },
  emerald: {
    dot: "bg-emerald-400",
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/10",
    text: "text-emerald-200",
    ring: "ring-emerald-400/40",
  },
  amber: {
    dot: "bg-amber-400",
    border: "border-amber-500/25",
    bg: "bg-amber-500/10",
    text: "text-amber-200",
    ring: "ring-amber-400/40",
  },
  rose: {
    dot: "bg-rose-400",
    border: "border-rose-500/25",
    bg: "bg-rose-500/10",
    text: "text-rose-200",
    ring: "ring-rose-400/40",
  },
};
