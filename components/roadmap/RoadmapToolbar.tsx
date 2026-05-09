"use client";

import { motion } from "framer-motion";
import { Download, Plus, Redo2, RotateCcw, Search, Sparkles, Undo2 } from "lucide-react";
import { useState, type RefObject } from "react";
import { useRoadmapStore } from "@/store/useRoadmapStore";

interface RoadmapToolbarProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
  onExport: () => Promise<void>;
}

const primaryButtonClassName =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-200 sm:w-auto sm:rounded-2xl sm:px-3.5 sm:py-2.5";
const secondaryButtonClassName =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:rounded-2xl sm:px-3 sm:py-2.5";

export default function RoadmapToolbar({ searchInputRef, onExport }: RoadmapToolbarProps) {
  const nodes = useRoadmapStore((state) => state.nodes);
  const edges = useRoadmapStore((state) => state.edges);
  const searchQuery = useRoadmapStore((state) => state.searchQuery);
  const setSearchQuery = useRoadmapStore((state) => state.setSearchQuery);
  const addNode = useRoadmapStore((state) => state.addNode);
  const resetToStarterData = useRoadmapStore((state) => state.resetToStarterData);
  const undo = useRoadmapStore((state) => state.undo);
  const redo = useRoadmapStore((state) => state.redo);
  const canUndo = useRoadmapStore((state) => state.past.length > 0);
  const canRedo = useRoadmapStore((state) => state.future.length > 0);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Replace this roadmap with the premium starter template?")) {
      resetToStarterData();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="pointer-events-auto relative z-20 rounded-2xl border border-white/10 bg-zinc-950/70 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:rounded-[2rem] sm:p-3"
    >
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-violet-100 sm:block">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-2xl">Road Map</h1>
              <span className="hidden rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-violet-100 sm:inline-flex">
                Flow builder
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-zinc-400 sm:mt-1 sm:text-sm">
              {nodes.length} nodes · {edges.length} connections · autosaved locally
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:flex lg:flex-row">
          <div className="relative min-w-0 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search nodes..."
              className="h-10 w-full rounded-xl border border-white/10 bg-black/35 py-2 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300/40 focus:bg-black/55 sm:rounded-2xl sm:py-2.5"
            />
          </div>

          <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2 lg:overflow-visible lg:pb-0">
            <button type="button" onClick={() => addNode()} className={primaryButtonClassName} aria-label="Create new node">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New node</span>
            </button>
            <button type="button" onClick={undo} disabled={!canUndo} className={secondaryButtonClassName} aria-label="Undo">
              <Undo2 className="h-4 w-4" />
              <span className="hidden md:inline">Undo</span>
            </button>
            <button type="button" onClick={redo} disabled={!canRedo} className={secondaryButtonClassName} aria-label="Redo">
              <Redo2 className="h-4 w-4" />
              <span className="hidden md:inline">Redo</span>
            </button>
            <button type="button" onClick={handleExport} disabled={exporting} className={secondaryButtonClassName} aria-label="Export PNG">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{exporting ? "Exporting" : "PNG"}</span>
            </button>
            <button type="button" onClick={handleReset} className={secondaryButtonClassName} aria-label="Reset roadmap">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
