import type { Edge, Node, Viewport } from "@xyflow/react";

export const ROADMAP_NODE_TYPE = "roadmapNode" as const;

export type RoadmapStatus = "idea" | "planned" | "in-progress" | "blocked" | "done";
export type RoadmapPriority = "low" | "medium" | "high" | "critical";
export type RoadmapColor = "violet" | "cyan" | "emerald" | "amber" | "rose" | "slate";
export type RoadmapEdgeRelation = "default" | "child";

export interface RoadmapNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  color: RoadmapColor;
  tags: string[];
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapEdgeData extends Record<string, unknown> {
  relation: RoadmapEdgeRelation;
}

export type RoadmapNode = Node<RoadmapNodeData, typeof ROADMAP_NODE_TYPE>;
export type RoadmapEdge = Edge<RoadmapEdgeData>;

export interface RoadmapGraph {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface RoadmapHistoryEntry extends RoadmapGraph {
  timestamp: number;
}

export interface RoadmapPersistedGraph extends RoadmapGraph {
  version: 1;
  viewport: Viewport;
  updatedAt: string;
}

export interface RoadmapColorStyle {
  label: string;
  swatchClassName: string;
  nodeClassName: string;
  accentClassName: string;
  glowClassName: string;
  handleClassName: string;
  textClassName: string;
  minimapColor: string;
}

export interface RoadmapStatusMeta {
  label: string;
  className: string;
  dotClassName: string;
}

export interface RoadmapPriorityMeta {
  label: string;
  className: string;
}
