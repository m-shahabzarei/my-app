"use client";

import { motion } from "framer-motion";
import { Focus, GitBranchPlus, Maximize2, Plus, Trash2 } from "lucide-react";
import { useRoadmapStore } from "@/store/useRoadmapStore";

interface RoadmapFloatingActionsProps {
  onFitView: () => void;
  onToggleFullscreen: () => void;
}

export default function RoadmapFloatingActions({ onFitView, onToggleFullscreen }: RoadmapFloatingActionsProps) {
  const addNode = useRoadmapStore((state) => state.addNode);
  const addChildNode = useRoadmapStore((state) => state.addChildNode);
  const deleteNodes = useRoadmapStore((state) => state.deleteNodes);
  const selectedNodeIds = useRoadmapStore((state) => state.selectedNodeIds);
  const canCreateChild = selectedNodeIds.length === 1;
  const hasSelection = selectedNodeIds.length > 0;

  return (
    <motion.div
      data-export-hidden="true"
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.18, duration: 0.35 }}
      className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950/75 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:gap-2 sm:p-2"
    >
      <button
        type="button"
        onClick={() => addNode()}
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200"
        aria-label="Create node"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => selectedNodeIds[0] && addChildNode(selectedNodeIds[0])}
        disabled={!canCreateChild}
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Create child node"
      >
        <GitBranchPlus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onFitView}
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 transition hover:bg-white/10"
        aria-label="Fit roadmap"
      >
        <Focus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 transition hover:bg-white/10"
        aria-label="Show roadmap fullscreen"
      >
        <Maximize2 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => deleteNodes(selectedNodeIds)}
        disabled={!hasSelection}
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-rose-300/20 bg-rose-400/10 text-rose-100 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Delete selected nodes"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </motion.div>
  );
}
