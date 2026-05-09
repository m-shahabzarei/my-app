"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Minimize2 } from "lucide-react";
import { useCallback, useMemo, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import RoadmapNode from "@/components/roadmap/RoadmapNode";
import { matchesRoadmapSearch, roadmapColors, roadmapColorStyles } from "@/lib/roadmap";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { ROADMAP_NODE_TYPE, type RoadmapColor, type RoadmapEdge, type RoadmapNode as RoadmapNodeType } from "@/types/roadmap";

interface RoadmapCanvasProps {
  flowWrapperRef: RefObject<HTMLDivElement | null>;
  isFullscreen: boolean;
  onFlowInit: (instance: ReactFlowInstance<RoadmapNodeType, RoadmapEdge>) => void;
  onToggleFullscreen: () => void;
}

function RoadmapCanvasInner({ flowWrapperRef, isFullscreen, onFlowInit, onToggleFullscreen }: RoadmapCanvasProps) {
  const {
    nodes,
    edges,
    viewport,
    searchQuery,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeIds,
    setViewport,
    captureHistory,
  } = useRoadmapStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      viewport: state.viewport,
      searchQuery: state.searchQuery,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      setSelectedNodeIds: state.setSelectedNodeIds,
      setViewport: state.setViewport,
      captureHistory: state.captureHistory,
    }))
  );

  const nodeTypes = useMemo(() => ({ [ROADMAP_NODE_TYPE]: RoadmapNode }), []);
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      animated: true,
      interactionWidth: 18,
      markerEnd: { type: MarkerType.ArrowClosed },
      className: "roadmap-flow-edge",
    }),
    []
  );
  const proOptions = useMemo(() => ({ hideAttribution: true }), []);
  const getMinimapNodeColor = useCallback((node: RoadmapNodeType): string => {
    const color = node.data.color;
    return roadmapColors.includes(color as RoadmapColor)
      ? roadmapColorStyles[color as RoadmapColor].minimapColor
      : roadmapColorStyles.violet.minimapColor;
  }, []);
  const matchingNodeIds = useMemo(
    () => new Set(nodes.filter((node) => matchesRoadmapSearch(node, searchQuery)).map((node) => node.id)),
    [nodes, searchQuery]
  );
  const hasSearch = searchQuery.trim().length > 0;
  const visibleNodes = useMemo(() => {
    if (!hasSearch) return nodes;

    return nodes.map((node) => ({
      ...node,
      hidden: !matchingNodeIds.has(node.id),
    }));
  }, [hasSearch, matchingNodeIds, nodes]);
  const visibleEdges = useMemo(() => {
    if (!hasSearch) return edges;

    return edges.map((edge) => ({
      ...edge,
      hidden: !matchingNodeIds.has(edge.source) || !matchingNodeIds.has(edge.target),
    }));
  }, [edges, hasSearch, matchingNodeIds]);

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams<RoadmapNodeType, RoadmapEdge>) => {
      setSelectedNodeIds(selectedNodes.map((node) => node.id));
    },
    [setSelectedNodeIds]
  );
  const handleMoveEnd = useCallback(
    (_: MouseEvent | TouchEvent | null, nextViewport: { x: number; y: number; zoom: number }) => {
      setViewport(nextViewport);
    },
    [setViewport]
  );
  const handleNodeDragStart = useCallback(() => {
    captureHistory();
  }, [captureHistory]);

  return (
    <div ref={flowWrapperRef} className="roadmap-canvas-frame relative h-full w-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/50">
      <ReactFlow<RoadmapNodeType, RoadmapEdge>
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onFlowInit}
        onSelectionChange={handleSelectionChange}
        onNodeDragStart={handleNodeDragStart}
        onMoveEnd={handleMoveEnd}
        defaultViewport={viewport}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.18}
        maxZoom={1.7}
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        connectOnClick
        deleteKeyCode={null}
        proOptions={proOptions}
        className="roadmap-react-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="rgba(255,255,255,0.16)" />
        <MiniMap
          pannable
          zoomable
          nodeBorderRadius={18}
          nodeStrokeWidth={2}
          nodeColor={getMinimapNodeColor}
          maskColor="rgba(2, 6, 23, 0.68)"
          className="roadmap-minimap hidden sm:block"
        />
        <Controls className="roadmap-controls" showInteractive={false} />
      </ReactFlow>
      {isFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="absolute right-4 top-4 z-40 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-2.5 text-sm font-medium text-white shadow-2xl shadow-black/50 backdrop-blur-2xl transition hover:bg-white/10"
        >
          <Minimize2 className="h-4 w-4" />
          Exit fullscreen
        </button>
      )}
    </div>
  );
}

export default function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
