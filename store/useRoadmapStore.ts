import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type Viewport,
  type XYPosition,
} from "@xyflow/react";
import { create } from "zustand";
import {
  cloneRoadmapGraph,
  createRoadmapEdge,
  createRoadmapNode,
  DEFAULT_ROADMAP_STORAGE_SCOPE,
  DEFAULT_ROADMAP_VIEWPORT,
  getRoadmapStorageKey,
  getStarterRoadmap,
  isRoadmapPersistedGraph,
  normalizeRoadmapStorageScope,
  ROADMAP_STORAGE_KEY,
  serializeRoadmapGraph,
} from "@/lib/roadmap";
import type {
  RoadmapEdge,
  RoadmapGraph,
  RoadmapHistoryEntry,
  RoadmapNode,
  RoadmapNodeData,
  RoadmapPersistedGraph,
  RoadmapStatus,
} from "@/types/roadmap";

const HISTORY_LIMIT = 50;
const NODE_OFFSET = 48;

interface CommitOptions {
  capture?: boolean;
  selectedNodeIds?: string[];
  viewport?: Viewport;
}

interface RoadmapState extends RoadmapGraph {
  selectedNodeIds: string[];
  searchQuery: string;
  hasHydrated: boolean;
  storageScope: string | null;
  viewport: Viewport;
  past: RoadmapHistoryEntry[];
  future: RoadmapHistoryEntry[];
  loadFromStorage: (scope?: string | null) => void;
  saveToStorage: () => void;
  resetToStarterData: () => void;
  captureHistory: () => void;
  setNodes: (nodes: RoadmapNode[]) => void;
  setEdges: (edges: RoadmapEdge[]) => void;
  onNodesChange: (changes: NodeChange<RoadmapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<RoadmapEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position?: XYPosition) => string;
  addChildNode: (parentId: string) => string | null;
  updateNodeData: (nodeId: string, data: Partial<Omit<RoadmapNodeData, "createdAt" | "updatedAt">>) => void;
  deleteNodes: (nodeIds: string[]) => void;
  duplicateNodes: (nodeIds: string[]) => string[];
  changeSelectedStatus: (status: RoadmapStatus) => void;
  setSelectedNodeIds: (nodeIds: string[]) => void;
  setSearchQuery: (query: string) => void;
  setViewport: (viewport: Viewport) => void;
  undo: () => void;
  redo: () => void;
}

function sanitizeNode(node: RoadmapNode): RoadmapNode {
  const nextNode: RoadmapNode = {
    ...node,
    position: { ...node.position },
    data: {
      ...node.data,
      tags: [...node.data.tags],
    },
  };

  delete nextNode.hidden;
  delete nextNode.selected;
  delete nextNode.dragging;
  delete nextNode.width;
  delete nextNode.height;
  delete nextNode.initialWidth;
  delete nextNode.initialHeight;
  delete nextNode.measured;

  return nextNode;
}

function sanitizeEdge(edge: RoadmapEdge): RoadmapEdge {
  const nextEdge: RoadmapEdge = {
    ...edge,
    data: edge.data ? { ...edge.data } : { relation: "default" },
  };

  delete nextEdge.hidden;
  delete nextEdge.selected;

  return nextEdge;
}

function sanitizeGraph(nodes: RoadmapNode[], edges: RoadmapEdge[]): RoadmapGraph {
  return {
    nodes: nodes.map(sanitizeNode),
    edges: edges.map(sanitizeEdge),
  };
}

function readPersistedRoadmapGraph(storageKey: string): RoadmapPersistedGraph | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (isRoadmapPersistedGraph(parsed)) return parsed;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }

  localStorage.removeItem(storageKey);
  return null;
}

function persistRoadmapGraph(nodes: RoadmapNode[], edges: RoadmapEdge[], viewport: Viewport, scope?: string | null): void {
  if (typeof window === "undefined") return;

  const graph = sanitizeGraph(nodes, edges);
  localStorage.setItem(getRoadmapStorageKey(scope), JSON.stringify(serializeRoadmapGraph(graph.nodes, graph.edges, viewport)));
}

function createHistoryEntry(nodes: RoadmapNode[], edges: RoadmapEdge[]): RoadmapHistoryEntry {
  return {
    ...cloneRoadmapGraph(sanitizeGraph(nodes, edges)),
    timestamp: Date.now(),
  };
}

function nextNodePosition(nodes: RoadmapNode[]): XYPosition {
  if (nodes.length === 0) return { x: 0, y: 0 };

  const anchor = nodes[nodes.length - 1];
  return {
    x: anchor.position.x + 360,
    y: anchor.position.y + (nodes.length % 2 === 0 ? -NODE_OFFSET : NODE_OFFSET),
  };
}

function getDurableNodeChanges(changes: NodeChange<RoadmapNode>[]): NodeChange<RoadmapNode>[] {
  return changes.filter((change) => change.type !== "select" && change.type !== "dimensions");
}

function getDurableEdgeChanges(changes: EdgeChange<RoadmapEdge>[]): EdgeChange<RoadmapEdge>[] {
  return changes.filter((change) => change.type !== "select");
}

function shouldCaptureNodeChanges(changes: NodeChange<RoadmapNode>[]): boolean {
  return changes.some((change) => change.type !== "position");
}

function shouldCaptureEdgeChanges(changes: EdgeChange<RoadmapEdge>[]): boolean {
  return changes.some((change) => change.type !== "select");
}

function hasSameSelection(current: string[], next: string[]): boolean {
  if (current.length !== next.length) return false;

  const selected = new Set(current);
  return next.every((nodeId) => selected.has(nodeId));
}

function hasSameViewport(current: Viewport, next: Viewport): boolean {
  return (
    Math.abs(current.x - next.x) < 0.5 &&
    Math.abs(current.y - next.y) < 0.5 &&
    Math.abs(current.zoom - next.zoom) < 0.001
  );
}

function haveSameTags(current: string[], next: string[]): boolean {
  return current.length === next.length && current.every((tag, index) => tag === next[index]);
}

function haveSameNodeData(current: RoadmapNodeData, next: RoadmapNodeData): boolean {
  return (
    current.title === next.title &&
    current.description === next.description &&
    current.status === next.status &&
    current.priority === next.priority &&
    current.color === next.color &&
    current.parentId === next.parentId &&
    current.createdAt === next.createdAt &&
    current.updatedAt === next.updatedAt &&
    haveSameTags(current.tags, next.tags)
  );
}

function haveSameNode(current: RoadmapNode, next: RoadmapNode): boolean {
  return (
    current.id === next.id &&
    current.type === next.type &&
    current.position.x === next.position.x &&
    current.position.y === next.position.y &&
    current.dragHandle === next.dragHandle &&
    current.parentId === next.parentId &&
    haveSameNodeData(current.data, next.data)
  );
}

function haveSameEdge(current: RoadmapEdge, next: RoadmapEdge): boolean {
  return (
    current.id === next.id &&
    current.source === next.source &&
    current.target === next.target &&
    current.sourceHandle === next.sourceHandle &&
    current.targetHandle === next.targetHandle &&
    current.type === next.type &&
    current.animated === next.animated &&
    current.className === next.className &&
    current.data?.relation === next.data?.relation
  );
}

function haveSameNodes(current: RoadmapNode[], next: RoadmapNode[]): boolean {
  return current.length === next.length && current.every((node, index) => haveSameNode(node, next[index]));
}

function haveSameEdges(current: RoadmapEdge[], next: RoadmapEdge[]): boolean {
  return current.length === next.length && current.every((edge, index) => haveSameEdge(edge, next[index]));
}

function hasPatchChanged(node: RoadmapNode, data: Partial<Omit<RoadmapNodeData, "createdAt" | "updatedAt">>): boolean {
  return Object.entries(data).some(([key, value]) => {
    if (key === "tags" && Array.isArray(value)) return !haveSameTags(node.data.tags, value);
    return node.data[key as keyof RoadmapNodeData] !== value;
  });
}

export const useRoadmapStore = create<RoadmapState>((set, get) => {
  const commitGraph = (nodesInput: RoadmapNode[], edgesInput: RoadmapEdge[], options: CommitOptions = {}) => {
    const state = get();
    const graph = sanitizeGraph(nodesInput, edgesInput);
    const graphChanged = !haveSameNodes(state.nodes, graph.nodes) || !haveSameEdges(state.edges, graph.edges);
    const viewport = options.viewport ?? state.viewport;
    const viewportChanged = !hasSameViewport(state.viewport, viewport);
    const selectedNodeIds = options.selectedNodeIds ?? state.selectedNodeIds;
    const selectionChanged = !hasSameSelection(state.selectedNodeIds, selectedNodeIds);

    if (!graphChanged && !viewportChanged && !selectionChanged) return;

    const history = options.capture && graphChanged
      ? {
          past: [...state.past, createHistoryEntry(state.nodes, state.edges)].slice(-HISTORY_LIMIT),
          future: [],
        }
      : {};

    if (graphChanged || viewportChanged) {
      persistRoadmapGraph(graph.nodes, graph.edges, viewport, state.storageScope);
    }

    set({
      nodes: graphChanged ? graph.nodes : state.nodes,
      edges: graphChanged ? graph.edges : state.edges,
      selectedNodeIds,
      viewport,
      ...history,
    });
  };

  return {
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    searchQuery: "",
    hasHydrated: false,
    storageScope: null,
    viewport: DEFAULT_ROADMAP_VIEWPORT,
    past: [],
    future: [],

    loadFromStorage: (scope) => {
      if (typeof window === "undefined") return;

      const storageScope = normalizeRoadmapStorageScope(scope);
      const state = get();
      if (state.hasHydrated && state.storageScope === storageScope) return;

      const storageKey = getRoadmapStorageKey(storageScope);
      let persisted = readPersistedRoadmapGraph(storageKey);

      if (!persisted && storageScope === DEFAULT_ROADMAP_STORAGE_SCOPE) {
        persisted = readPersistedRoadmapGraph(ROADMAP_STORAGE_KEY);
        if (persisted) {
          const graph = sanitizeGraph(persisted.nodes, persisted.edges);
          persistRoadmapGraph(graph.nodes, graph.edges, persisted.viewport ?? DEFAULT_ROADMAP_VIEWPORT, storageScope);
        }
      }

      if (persisted) {
        const graph = sanitizeGraph(persisted.nodes, persisted.edges);
        set({
          ...graph,
          selectedNodeIds: [],
          viewport: persisted.viewport ?? DEFAULT_ROADMAP_VIEWPORT,
          hasHydrated: true,
          storageScope,
          past: [],
          future: [],
        });
        return;
      }

      const starterRoadmap = getStarterRoadmap();
      const starter = sanitizeGraph(starterRoadmap.nodes, starterRoadmap.edges);
      set({
        ...starter,
        selectedNodeIds: [],
        viewport: DEFAULT_ROADMAP_VIEWPORT,
        hasHydrated: true,
        storageScope,
        past: [],
        future: [],
      });
    },

    saveToStorage: () => {
      const { nodes, edges, viewport, storageScope } = get();
      persistRoadmapGraph(nodes, edges, viewport, storageScope);
    },

    resetToStarterData: () => {
      const starter = getStarterRoadmap();
      commitGraph(starter.nodes, starter.edges, {
        capture: true,
        selectedNodeIds: [],
        viewport: DEFAULT_ROADMAP_VIEWPORT,
      });
    },

    captureHistory: () => {
      const { nodes, edges, past } = get();
      set({
        past: [...past, createHistoryEntry(nodes, edges)].slice(-HISTORY_LIMIT),
        future: [],
      });
    },

    setNodes: (nodes) => {
      commitGraph(nodes, get().edges, { capture: true });
    },

    setEdges: (edges) => {
      commitGraph(get().nodes, edges, { capture: true });
    },

    onNodesChange: (changes) => {
      const durableChanges = getDurableNodeChanges(changes);
      if (durableChanges.length === 0) return;

      const state = get();
      const nodes = applyNodeChanges<RoadmapNode>(durableChanges, state.nodes);
      commitGraph(nodes, state.edges, {
        capture: shouldCaptureNodeChanges(durableChanges),
      });
    },

    onEdgesChange: (changes) => {
      const durableChanges = getDurableEdgeChanges(changes);
      if (durableChanges.length === 0) return;

      const state = get();
      const edges = applyEdgeChanges<RoadmapEdge>(durableChanges, state.edges);
      commitGraph(state.nodes, edges, { capture: shouldCaptureEdgeChanges(durableChanges) });
    },

    onConnect: (connection) => {
      if (!connection.source || !connection.target) return;

      const state = get();
      const edge = createRoadmapEdge(connection.source, connection.target, "default", connection);
      commitGraph(state.nodes, [...state.edges, edge], { capture: true });
    },

    addNode: (position) => {
      const state = get();
      const node = createRoadmapNode({ position: position ?? nextNodePosition(state.nodes) });

      commitGraph([...state.nodes, node], state.edges, { capture: true, selectedNodeIds: [node.id] });
      return node.id;
    },

    addChildNode: (parentId) => {
      const state = get();
      const parent = state.nodes.find((node) => node.id === parentId);
      if (!parent) return null;

      const child = createRoadmapNode({
        title: `${parent.data.title} child`,
        description: "Break this roadmap item into a concrete next step.",
        status: "idea",
        priority: parent.data.priority,
        color: parent.data.color,
        parentId,
        position: { x: parent.position.x + 380, y: parent.position.y + 160 },
      });
      const edge = createRoadmapEdge(parentId, child.id, "child");

      commitGraph([...state.nodes, child], [...state.edges, edge], { capture: true, selectedNodeIds: [child.id] });
      return child.id;
    },

    updateNodeData: (nodeId, data) => {
      const state = get();
      const node = state.nodes.find((item) => item.id === nodeId);
      if (!node || !hasPatchChanged(node, data)) return;

      const timestamp = new Date().toISOString();
      const nodes = state.nodes.map((item) =>
        item.id === nodeId
          ? {
              ...item,
              data: {
                ...item.data,
                ...data,
                updatedAt: timestamp,
              },
            }
          : item
      );

      commitGraph(nodes, state.edges, { capture: true });
    },

    deleteNodes: (nodeIds) => {
      if (nodeIds.length === 0) return;

      const state = get();
      const deleted = new Set(nodeIds);
      const nodes = state.nodes
        .filter((node) => !deleted.has(node.id))
        .map((node) => ({
          ...node,
          data: deleted.has(node.data.parentId ?? "") ? { ...node.data, parentId: undefined } : node.data,
        }));
      const edges = state.edges.filter((edge) => !deleted.has(edge.source) && !deleted.has(edge.target));
      const selectedNodeIds = state.selectedNodeIds.filter((nodeId) => !deleted.has(nodeId));

      commitGraph(nodes, edges, { capture: true, selectedNodeIds });
    },

    duplicateNodes: (nodeIds) => {
      const state = get();
      const sourceNodes = state.nodes.filter((node) => nodeIds.includes(node.id));
      if (sourceNodes.length === 0) return [];

      const idMap = new Map(sourceNodes.map((node) => [node.id, crypto.randomUUID()]));
      const timestamp = new Date().toISOString();
      const duplicatedNodes = sourceNodes.map((node) => {
        const duplicatedId = idMap.get(node.id);
        const parentId = node.data.parentId ? idMap.get(node.data.parentId) : undefined;

        return createRoadmapNode({
          id: duplicatedId ?? crypto.randomUUID(),
          title: `${node.data.title} copy`,
          description: node.data.description,
          status: node.data.status,
          priority: node.data.priority,
          color: node.data.color,
          tags: [...node.data.tags],
          parentId,
          position: { x: node.position.x + 64, y: node.position.y + 64 },
        });
      }).map((node): RoadmapNode => ({
        ...node,
        data: {
          ...node.data,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      }));
      const duplicatedEdges = state.edges
        .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
        .map((edge) =>
          createRoadmapEdge(
            idMap.get(edge.source) ?? crypto.randomUUID(),
            idMap.get(edge.target) ?? crypto.randomUUID(),
            edge.data?.relation ?? "default",
            { sourceHandle: edge.sourceHandle ?? null, targetHandle: edge.targetHandle ?? null }
          )
        );
      const duplicatedIds = duplicatedNodes.map((node) => node.id);

      commitGraph([...state.nodes, ...duplicatedNodes], [...state.edges, ...duplicatedEdges], {
        capture: true,
        selectedNodeIds: duplicatedIds,
      });

      return duplicatedIds;
    },

    changeSelectedStatus: (status) => {
      const state = get();
      if (state.selectedNodeIds.length === 0) return;

      const selected = new Set(state.selectedNodeIds);
      let changed = false;
      const timestamp = new Date().toISOString();
      const nodes = state.nodes.map((node) => {
        if (!selected.has(node.id) || node.data.status === status) return node;

        changed = true;
        return {
          ...node,
          data: {
            ...node.data,
            status,
            updatedAt: timestamp,
          },
        };
      });

      if (!changed) return;
      commitGraph(nodes, state.edges, { capture: true });
    },

    setSelectedNodeIds: (nodeIds) => {
      const state = get();
      if (hasSameSelection(state.selectedNodeIds, nodeIds)) return;

      set({ selectedNodeIds: nodeIds });
    },

    setSearchQuery: (query) => {
      if (get().searchQuery === query) return;

      set({ searchQuery: query });
    },

    setViewport: (viewport) => {
      const { nodes, edges, viewport: currentViewport, storageScope } = get();
      if (hasSameViewport(currentViewport, viewport)) return;

      persistRoadmapGraph(nodes, edges, viewport, storageScope);
      set({ viewport });
    },

    undo: () => {
      const state = get();
      const previous = state.past[state.past.length - 1];
      if (!previous) return;

      const current = createHistoryEntry(state.nodes, state.edges);
      const future = [current, ...state.future].slice(0, HISTORY_LIMIT);
      const past = state.past.slice(0, -1);
      const graph = sanitizeGraph(previous.nodes, previous.edges);

      persistRoadmapGraph(graph.nodes, graph.edges, state.viewport, state.storageScope);
      set({ ...graph, selectedNodeIds: [], past, future });
    },

    redo: () => {
      const state = get();
      const next = state.future[0];
      if (!next) return;

      const current = createHistoryEntry(state.nodes, state.edges);
      const future = state.future.slice(1);
      const past = [...state.past, current].slice(-HISTORY_LIMIT);
      const graph = sanitizeGraph(next.nodes, next.edges);

      persistRoadmapGraph(graph.nodes, graph.edges, state.viewport, state.storageScope);
      set({ ...graph, selectedNodeIds: [], past, future });
    },
  };
});
