"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { ReactFlowInstance } from "@xyflow/react";
import RoadmapCanvas from "@/components/roadmap/RoadmapCanvas";
import RoadmapFloatingActions from "@/components/roadmap/RoadmapFloatingActions";
import RoadmapInspector from "@/components/roadmap/RoadmapInspector";
import RoadmapToolbar from "@/components/roadmap/RoadmapToolbar";
import { useRoadmapShortcuts } from "@/hooks/useRoadmapShortcuts";
import { exportRoadmapAsPng } from "@/lib/roadmap";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import type { RoadmapEdge, RoadmapNode } from "@/types/roadmap";

export default function RoadmapShell() {
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const flowInstanceRef = useRef<ReactFlowInstance<RoadmapNode, RoadmapEdge> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState(false);
  const {
    hasHydrated,
    selectedNodeIds,
    loadFromStorage,
    addNode,
    addChildNode,
    deleteNodes,
    undo,
    redo,
  } = useRoadmapStore(
    useShallow((state) => ({
      hasHydrated: state.hasHydrated,
      selectedNodeIds: state.selectedNodeIds,
      loadFromStorage: state.loadFromStorage,
      addNode: state.addNode,
      addChildNode: state.addChildNode,
      deleteNodes: state.deleteNodes,
      undo: state.undo,
      redo: state.redo,
    }))
  );

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsCanvasFullscreen(document.fullscreenElement === flowWrapperRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFlowInit = useCallback((instance: ReactFlowInstance<RoadmapNode, RoadmapEdge>) => {
    flowInstanceRef.current = instance;
  }, []);

  const handleFitView = useCallback(() => {
    flowInstanceRef.current?.fitView({ padding: 0.22, duration: 650 });
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await flowWrapperRef.current?.requestFullscreen();
  }, []);

  const handleExport = useCallback(async () => {
    if (!flowWrapperRef.current) return;

    await exportRoadmapAsPng(flowWrapperRef.current, `roadmap-${new Date().toISOString().slice(0, 10)}.png`);
  }, []);

  const handleAddNode = useCallback(() => {
    addNode();
  }, [addNode]);

  const handleAddChildNode = useCallback(() => {
    const selectedNodeId = selectedNodeIds[0];
    if (selectedNodeId) addChildNode(selectedNodeId);
  }, [addChildNode, selectedNodeIds]);

  const handleDeleteSelected = useCallback(() => {
    deleteNodes(selectedNodeIds);
  }, [deleteNodes, selectedNodeIds]);

  useRoadmapShortcuts({
    searchInputRef,
    selectedNodeIds,
    addNode: handleAddNode,
    addChildNode: handleAddChildNode,
    deleteSelected: handleDeleteSelected,
    undo,
    redo,
  });

  if (!hasHydrated) {
    return (
      <div className="relative flex h-[calc(100dvh-5rem)] min-h-[520px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_34%),#020617] p-3 lg:h-[100dvh] lg:min-h-[720px] lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-6 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl"
        >
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-violet-300/20" />
          <h1 className="text-xl font-semibold text-white">Preparing Road Map</h1>
          <p className="mt-2 text-sm text-zinc-500">Restoring your visual roadmap workspace.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative h-[calc(100dvh-5rem)] min-h-[520px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_34%),#020617] p-2 sm:p-4 lg:h-[100dvh] lg:min-h-[720px] lg:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-1/2 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col gap-2 sm:gap-4">
        <RoadmapToolbar searchInputRef={searchInputRef} onExport={handleExport} />

        <section className="relative min-h-0 flex-1">
          <RoadmapCanvas
            flowWrapperRef={flowWrapperRef}
            isFullscreen={isCanvasFullscreen}
            onFlowInit={handleFlowInit}
            onToggleFullscreen={handleToggleFullscreen}
          />

          <div className="absolute left-4 top-4 z-20 hidden max-h-[calc(100%-2rem)] overflow-y-auto lg:block" data-export-hidden="true">
            <RoadmapInspector />
          </div>

          {selectedNodeIds.length > 0 && (
            <div className="absolute inset-x-2 bottom-2 z-20 max-h-[58%] overflow-y-auto rounded-[1.6rem] lg:hidden" data-export-hidden="true">
              <RoadmapInspector />
            </div>
          )}

          <div className="absolute right-2 top-2 z-30 sm:right-4 sm:top-4 lg:bottom-4 lg:right-4 lg:top-auto" data-export-hidden="true">
            <RoadmapFloatingActions onFitView={handleFitView} onToggleFullscreen={handleToggleFullscreen} />
          </div>
        </section>
      </div>
    </main>
  );
}
