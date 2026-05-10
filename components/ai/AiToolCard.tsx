"use client";

import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { AiToolDefinition } from "@/types/ai/index";
import ComingSoonBadge from "./ComingSoonBadge";

interface AiToolCardProps {
  tool: AiToolDefinition;
  index: number;
}

export default function AiToolCard({ tool, index }: AiToolCardProps) {
  const Icon = tool.icon;
  const active = tool.status === "active";
  const activeCardClassName = tool.accent?.cardClassName ?? "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/7";
  const activeIconClassName = tool.accent?.iconClassName ?? "border-white/15 bg-white/10 text-white";
  const glowClassName = tool.accent?.glowClassName ?? "from-transparent via-white/40 to-transparent";

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      whileHover={active ? { y: -3 } : undefined}
      className={`group relative h-full overflow-hidden rounded-3xl border p-5 shadow-2xl shadow-black/20 transition ${
        active
          ? activeCardClassName
          : "cursor-not-allowed border-white/10 bg-white/3 opacity-60"
      }`}
    >
      {active && <div className={`absolute inset-x-8 top-0 h-px bg-linear-to-r ${glowClassName}`} />}

      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-2xl border p-3 ${active ? activeIconClassName : "border-white/10 bg-black/20 text-neutral-500"}`}>
          <Icon className="h-5 w-5" />
        </div>
        {active ? (
          <ArrowUpRight className="h-4 w-4 text-neutral-500 transition group-hover:text-white" />
        ) : (
          <ComingSoonBadge />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">{tool.title}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-400">{tool.description}</p>
      </div>

      {active && tool.accent && (
        <div className="mt-5 inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          {tool.accent.label}
        </div>
      )}

      {!active && (
        <div className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
          <Lock className="h-3.5 w-3.5" />
          Inactive for now
        </div>
      )}
    </motion.div>
  );

  if (!active) return content;

  return (
    <Link href={tool.href} className="block h-full focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black rounded-3xl">
      {content}
    </Link>
  );
}
