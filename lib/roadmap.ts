import { MarkerType, type Connection, type Viewport, type XYPosition } from "@xyflow/react";
import { toPng } from "html-to-image";
import { v4 as uuidv4 } from "uuid";
import {
  ROADMAP_NODE_TYPE,
  type RoadmapColor,
  type RoadmapColorStyle,
  type RoadmapEdge,
  type RoadmapEdgeRelation,
  type RoadmapGraph,
  type RoadmapNode,
  type RoadmapPersistedGraph,
  type RoadmapPriority,
  type RoadmapPriorityMeta,
  type RoadmapStatus,
  type RoadmapStatusMeta,
} from "@/types/roadmap";

export const ROADMAP_STORAGE_KEY = "roadmap_graph_v1";
export const DEFAULT_ROADMAP_STORAGE_SCOPE = "anonymous";
export const DEFAULT_ROADMAP_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 0.82 };

export function normalizeRoadmapStorageScope(scope?: string | null): string {
  const normalizedScope = scope?.trim().replace(/[^a-zA-Z0-9._-]+/g, "_");
  return normalizedScope || DEFAULT_ROADMAP_STORAGE_SCOPE;
}

export function getRoadmapStorageKey(scope?: string | null): string {
  return `${ROADMAP_STORAGE_KEY}:${normalizeRoadmapStorageScope(scope)}`;
}

export const roadmapColorStyles: Record<RoadmapColor, RoadmapColorStyle> = {
  violet: {
    label: "Violet",
    swatchClassName: "bg-violet-400",
    nodeClassName: "border-violet-400/45 bg-violet-500/10",
    accentClassName: "from-violet-400 via-fuchsia-400 to-indigo-400",
    glowClassName: "shadow-[0_0_42px_rgba(139,92,246,0.28)]",
    handleClassName: "!bg-violet-400 !border-violet-100",
    textClassName: "text-violet-100",
    minimapColor: "#8b5cf6",
  },
  cyan: {
    label: "Cyan",
    swatchClassName: "bg-cyan-300",
    nodeClassName: "border-cyan-300/45 bg-cyan-400/10",
    accentClassName: "from-cyan-300 via-sky-400 to-blue-500",
    glowClassName: "shadow-[0_0_42px_rgba(34,211,238,0.24)]",
    handleClassName: "!bg-cyan-300 !border-cyan-50",
    textClassName: "text-cyan-50",
    minimapColor: "#22d3ee",
  },
  emerald: {
    label: "Emerald",
    swatchClassName: "bg-emerald-300",
    nodeClassName: "border-emerald-300/45 bg-emerald-400/10",
    accentClassName: "from-emerald-300 via-teal-300 to-lime-300",
    glowClassName: "shadow-[0_0_42px_rgba(52,211,153,0.22)]",
    handleClassName: "!bg-emerald-300 !border-emerald-50",
    textClassName: "text-emerald-50",
    minimapColor: "#34d399",
  },
  amber: {
    label: "Amber",
    swatchClassName: "bg-amber-300",
    nodeClassName: "border-amber-300/45 bg-amber-400/10",
    accentClassName: "from-amber-300 via-orange-300 to-yellow-200",
    glowClassName: "shadow-[0_0_42px_rgba(251,191,36,0.22)]",
    handleClassName: "!bg-amber-300 !border-amber-50",
    textClassName: "text-amber-50",
    minimapColor: "#fbbf24",
  },
  rose: {
    label: "Rose",
    swatchClassName: "bg-rose-300",
    nodeClassName: "border-rose-300/45 bg-rose-400/10",
    accentClassName: "from-rose-300 via-pink-400 to-red-400",
    glowClassName: "shadow-[0_0_42px_rgba(251,113,133,0.24)]",
    handleClassName: "!bg-rose-300 !border-rose-50",
    textClassName: "text-rose-50",
    minimapColor: "#fb7185",
  },
  slate: {
    label: "Slate",
    swatchClassName: "bg-slate-300",
    nodeClassName: "border-slate-300/35 bg-slate-400/10",
    accentClassName: "from-slate-200 via-zinc-300 to-stone-300",
    glowClassName: "shadow-[0_0_42px_rgba(148,163,184,0.18)]",
    handleClassName: "!bg-slate-300 !border-slate-50",
    textClassName: "text-slate-50",
    minimapColor: "#94a3b8",
  },
};

export const roadmapStatusMeta: Record<RoadmapStatus, RoadmapStatusMeta> = {
  idea: {
    label: "Idea",
    className: "bg-slate-400/10 text-slate-200 ring-slate-300/20",
    dotClassName: "bg-slate-300",
  },
  planned: {
    label: "Planned",
    className: "bg-sky-400/10 text-sky-100 ring-sky-300/25",
    dotClassName: "bg-sky-300",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-violet-400/10 text-violet-100 ring-violet-300/25",
    dotClassName: "bg-violet-300",
  },
  blocked: {
    label: "Blocked",
    className: "bg-rose-400/10 text-rose-100 ring-rose-300/25",
    dotClassName: "bg-rose-300",
  },
  done: {
    label: "Done",
    className: "bg-emerald-400/10 text-emerald-100 ring-emerald-300/25",
    dotClassName: "bg-emerald-300",
  },
};

export const roadmapPriorityMeta: Record<RoadmapPriority, RoadmapPriorityMeta> = {
  low: {
    label: "Low",
    className: "bg-white/5 text-zinc-300 ring-white/10",
  },
  medium: {
    label: "Medium",
    className: "bg-cyan-400/10 text-cyan-100 ring-cyan-300/20",
  },
  high: {
    label: "High",
    className: "bg-amber-400/10 text-amber-100 ring-amber-300/25",
  },
  critical: {
    label: "Critical",
    className: "bg-rose-400/10 text-rose-100 ring-rose-300/25",
  },
};

export const roadmapStatuses = Object.keys(roadmapStatusMeta) as RoadmapStatus[];
export const roadmapPriorities = Object.keys(roadmapPriorityMeta) as RoadmapPriority[];
export const roadmapColors = Object.keys(roadmapColorStyles) as RoadmapColor[];

interface CreateRoadmapNodeInput {
  id?: string;
  title?: string;
  description?: string;
  status?: RoadmapStatus;
  priority?: RoadmapPriority;
  color?: RoadmapColor;
  tags?: string[];
  parentId?: string;
  position: XYPosition;
}

export function createRoadmapNode({
  id = uuidv4(),
  title = "New roadmap item",
  description = "Describe the milestone, dependency, or outcome.",
  status = "idea",
  priority = "medium",
  color = "violet",
  tags = [],
  parentId,
  position,
}: CreateRoadmapNodeInput): RoadmapNode {
  const timestamp = new Date().toISOString();

  return {
    id,
    type: ROADMAP_NODE_TYPE,
    position,
    dragHandle: ".roadmap-node-drag-handle",
    data: {
      title,
      description,
      status,
      priority,
      color,
      tags,
      parentId,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };
}

export function createRoadmapEdge(
  source: string,
  target: string,
  relation: RoadmapEdgeRelation = "default",
  connection?: Pick<Connection, "sourceHandle" | "targetHandle">
): RoadmapEdge {
  return {
    id: `edge-${source}-${target}-${uuidv4()}`,
    source,
    target,
    sourceHandle: connection?.sourceHandle ?? null,
    targetHandle: connection?.targetHandle ?? null,
    type: "smoothstep",
    animated: true,
    selectable: true,
    focusable: true,
    interactionWidth: 18,
    className: relation === "child" ? "roadmap-flow-edge roadmap-flow-edge-child" : "roadmap-flow-edge",
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { relation },
  };
}

export function getStarterRoadmap(): RoadmapGraph {
  const nodes: RoadmapNode[] = [
    createRoadmapNode({
      id: "starter-discovery",
      title: "Discovery sprint",
      description: "Align goals, define personas, collect constraints, and map the critical success metrics.",
      status: "done",
      priority: "high",
      color: "emerald",
      tags: ["research", "alignment"],
      position: { x: -460, y: -80 },
    }),
    createRoadmapNode({
      id: "starter-mvp",
      title: "MVP workflow",
      description: "Ship the core planner with node creation, connections, persistence, and daily usage loops.",
      status: "in-progress",
      priority: "critical",
      color: "violet",
      tags: ["product", "canvas"],
      position: { x: -40, y: -160 },
    }),
    createRoadmapNode({
      id: "starter-ai",
      title: "AI starter templates",
      description: "Generate launch plans, learning tracks, and project roadmaps from concise prompts.",
      status: "planned",
      priority: "high",
      color: "cyan",
      tags: ["AI", "templates"],
      position: { x: 410, y: -40 },
    }),
    createRoadmapNode({
      id: "starter-mobile",
      title: "Mobile canvas polish",
      description: "Optimize pinch zoom, compact controls, bottom navigation, and touch-first editing flows.",
      status: "planned",
      priority: "medium",
      color: "amber",
      tags: ["mobile", "UX"],
      parentId: "starter-mvp",
      position: { x: -40, y: 160 },
    }),
    createRoadmapNode({
      id: "starter-launch",
      title: "Launch analytics",
      description: "Track adoption, completion funnels, exports, and roadmap collaboration engagement.",
      status: "idea",
      priority: "medium",
      color: "rose",
      tags: ["analytics", "growth"],
      position: { x: 420, y: 260 },
    }),
  ].map((node): RoadmapNode => ({
    ...node,
    selected: false,
  }));

  return {
    nodes,
    edges: [
      createRoadmapEdge("starter-discovery", "starter-mvp", "default"),
      createRoadmapEdge("starter-mvp", "starter-ai", "default"),
      createRoadmapEdge("starter-mvp", "starter-mobile", "child"),
      createRoadmapEdge("starter-ai", "starter-launch", "default"),
    ],
  };
}

export function cloneRoadmapGraph({ nodes, edges }: RoadmapGraph): RoadmapGraph {
  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      data: {
        ...node.data,
        tags: [...node.data.tags],
      },
    })),
    edges: edges.map((edge) => ({
      ...edge,
      data: edge.data ? { ...edge.data } : { relation: "default" },
    })),
  };
}

export function isRoadmapPersistedGraph(value: unknown): value is RoadmapPersistedGraph {
  if (typeof value !== "object" || value === null) return false;
  const graph = value as Partial<RoadmapPersistedGraph>;

  return graph.version === 1 && Array.isArray(graph.nodes) && Array.isArray(graph.edges);
}

export function matchesRoadmapSearch(node: RoadmapNode, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = [
    node.data.title,
    node.data.description,
    node.data.status,
    node.data.priority,
    node.data.color,
    ...node.data.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export async function exportRoadmapAsPng(target: HTMLElement, fileName = "roadmap.png"): Promise<void> {
  const dataUrl = await toPng(target, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#020617",
    filter: (node) => !(node instanceof HTMLElement && node.dataset.exportHidden === "true"),
  });
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

export function serializeRoadmapGraph(nodes: RoadmapNode[], edges: RoadmapEdge[], viewport: Viewport): RoadmapPersistedGraph {
  return {
    version: 1,
    nodes,
    edges,
    viewport,
    updatedAt: new Date().toISOString(),
  };
}
