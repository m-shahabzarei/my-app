"use client";

import { motion } from "framer-motion";
import { Copy, GitBranchPlus, Layers3, Palette, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  roadmapColors,
  roadmapColorStyles,
  roadmapPriorities,
  roadmapPriorityMeta,
  roadmapStatuses,
  roadmapStatusMeta,
} from "@/lib/roadmap";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import type { RoadmapColor, RoadmapPriority, RoadmapStatus } from "@/types/roadmap";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300/40 focus:bg-black/55";

interface RoadmapTagInputProps {
  value: string;
  onCommit: (tags: string[]) => void;
}

function RoadmapTagInput({ value, onCommit }: RoadmapTagInputProps) {
  const [tagDraft, setTagDraft] = useState(value);

  const commitTags = () => {
    const tags = tagDraft
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onCommit(tags);
    setTagDraft(tags.join(", "));
  };

  return (
    <input
      value={tagDraft}
      onChange={(event) => setTagDraft(event.target.value)}
      onBlur={commitTags}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitTags();
        }
      }}
      placeholder="strategy, launch, mobile"
      className={fieldClassName}
    />
  );
}

export default function RoadmapInspector() {
  const nodes = useRoadmapStore((state) => state.nodes);
  const selectedNodeIds = useRoadmapStore((state) => state.selectedNodeIds);
  const updateNodeData = useRoadmapStore((state) => state.updateNodeData);
  const addChildNode = useRoadmapStore((state) => state.addChildNode);
  const deleteNodes = useRoadmapStore((state) => state.deleteNodes);
  const duplicateNodes = useRoadmapStore((state) => state.duplicateNodes);
  const changeSelectedStatus = useRoadmapStore((state) => state.changeSelectedStatus);
  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeIds[0]),
    [nodes, selectedNodeIds]
  );

  if (selectedNodeIds.length > 1) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="pointer-events-auto w-full rounded-[1.6rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-4 lg:w-80 lg:rounded-[2rem]"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{selectedNodeIds.length} nodes selected</h2>
            <p className="text-sm text-zinc-500">Apply bulk actions to the selection.</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {roadmapStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => changeSelectedStatus(status)}
              className={`rounded-2xl px-3 py-2 text-left text-xs font-semibold ring-1 transition hover:scale-[1.02] ${roadmapStatusMeta[status].className}`}
            >
              {roadmapStatusMeta[status].label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => duplicateNodes(selectedNodeIds)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => deleteNodes(selectedNodeIds)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </motion.aside>
    );
  }

  if (!selectedNode) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="pointer-events-auto w-full rounded-[1.6rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-4 lg:w-80 lg:rounded-[2rem]"
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 inline-flex rounded-2xl border border-violet-300/20 bg-violet-300/10 p-3 text-violet-100">
            <Palette className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-white">Design your flow</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Select a node to edit its details, create child milestones, recolor cards, or change priority and status.
          </p>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Shortcuts</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
            <span className="rounded-xl bg-white/5 px-2 py-2">N · new</span>
            <span className="rounded-xl bg-white/5 px-2 py-2">C · child</span>
            <span className="rounded-xl bg-white/5 px-2 py-2">⌘Z · undo</span>
            <span className="rounded-xl bg-white/5 px-2 py-2">Del · remove</span>
          </div>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="pointer-events-auto w-full rounded-[1.6rem] border border-white/10 bg-zinc-950/70 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-4 lg:w-80 lg:rounded-[2rem]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Inspector</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Node details</h2>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ring-1 ${roadmapStatusMeta[selectedNode.data.status].className}`}>
          {roadmapStatusMeta[selectedNode.data.status].label}
        </span>
      </div>

      <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Title</span>
          <input
            value={selectedNode.data.title}
            onChange={(event) => updateNodeData(selectedNode.id, { title: event.target.value })}
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Description</span>
          <textarea
            value={selectedNode.data.description}
            onChange={(event) => updateNodeData(selectedNode.id, { description: event.target.value })}
            className={`${fieldClassName} min-h-20 sm:min-h-28 resize-none leading-6`}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Tags</span>
          <RoadmapTagInput
            key={selectedNode.id}
            value={selectedNode.data.tags.join(", ")}
            onCommit={(tags) => updateNodeData(selectedNode.id, { tags })}
          />
        </label>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Status</span>
          <select
            value={selectedNode.data.status}
            onChange={(event) => updateNodeData(selectedNode.id, { status: event.target.value as RoadmapStatus })}
            className={fieldClassName}
          >
            {roadmapStatuses.map((status) => (
              <option key={status} value={status}>
                {roadmapStatusMeta[status].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Priority</span>
          <select
            value={selectedNode.data.priority}
            onChange={(event) => updateNodeData(selectedNode.id, { priority: event.target.value as RoadmapPriority })}
            className={fieldClassName}
          >
            {roadmapPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {roadmapPriorityMeta[priority].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Color</span>
          <div className="grid grid-cols-3 gap-2">
            {roadmapColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateNodeData(selectedNode.id, { color: color as RoadmapColor })}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10 ${selectedNode.data.color === color ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5"}`}
              >
                <span className={`h-3 w-3 rounded-full ${roadmapColorStyles[color].swatchClassName}`} />
                {roadmapColorStyles[color].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={() => addChildNode(selectedNode.id)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <GitBranchPlus className="h-4 w-4" />
            Child
          </button>
          <button
            type="button"
            onClick={() => duplicateNodes([selectedNode.id])}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            type="button"
            onClick={() => deleteNodes([selectedNode.id])}
            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/15"
          >
            <Trash2 className="h-4 w-4" />
            Delete node
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
