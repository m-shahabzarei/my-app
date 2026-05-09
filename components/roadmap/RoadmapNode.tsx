"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { GitBranchPlus, GripHorizontal, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import RoadmapContextMenu from "@/components/roadmap/RoadmapContextMenu";
import {
  roadmapColors,
  roadmapColorStyles,
  roadmapPriorityMeta,
  roadmapStatusMeta,
} from "@/lib/roadmap";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import type { RoadmapNode as RoadmapNodeType } from "@/types/roadmap";

export default function RoadmapNode({ id, data }: NodeProps<RoadmapNodeType>) {
  const updateNodeData = useRoadmapStore((state) => state.updateNodeData);
  const deleteNodes = useRoadmapStore((state) => state.deleteNodes);
  const addChildNode = useRoadmapStore((state) => state.addChildNode);
  const isSelected = useRoadmapStore((state) => state.selectedNodeIds.includes(id));
  const childCount = useRoadmapStore((state) => state.nodes.filter((node) => node.data.parentId === id).length);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);

  const colorStyle = roadmapColorStyles[data.color];
  const status = roadmapStatusMeta[data.status];
  const priority = roadmapPriorityMeta[data.priority];
  const tagPreview = useMemo(() => data.tags.slice(0, 3), [data.tags]);

  const openEditor = () => {
    setTitle(data.title);
    setDescription(data.description);
    setEditing(true);
  };

  const commitEdit = () => {
    const nextTitle = title.trim() || "Untitled roadmap item";
    const nextDescription = description.trim();
    if (nextTitle !== data.title || nextDescription !== data.description) {
      updateNodeData(id, { title: nextTitle, description: nextDescription });
    }
    setTitle(nextTitle);
    setDescription(nextDescription);
    setEditing(false);
  };

  const cancelEdit = () => {
    setTitle(data.title);
    setDescription(data.description);
    setEditing(false);
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commitEdit();
    }
  };

  return (
    <RoadmapContextMenu nodeId={id} currentColor={data.color} currentStatus={data.status}>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className={`roadmap-node-drag-handle group relative w-72 overflow-hidden rounded-[1.4rem] border p-3 text-white backdrop-blur-2xl transition-all duration-300 sm:w-80 sm:rounded-[1.65rem] sm:p-4 ${colorStyle.nodeClassName} ${colorStyle.glowClassName} ${isSelected ? "ring-2 ring-white/45 ring-offset-2 ring-offset-black" : "ring-1 ring-white/5"}`}
        onDoubleClick={openEditor}
      >
        <Handle type="target" position={Position.Left} className={`roadmap-handle ${colorStyle.handleClassName}`} />
        <Handle type="source" position={Position.Right} className={`roadmap-handle ${colorStyle.handleClassName}`} />
        <Handle type="target" position={Position.Top} className={`roadmap-handle ${colorStyle.handleClassName}`} />
        <Handle type="source" position={Position.Bottom} className={`roadmap-handle ${colorStyle.handleClassName}`} />

        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colorStyle.accentClassName}`} />
        <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-opacity group-hover:opacity-80" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ring-1 ${status.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`} />
                {status.label}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ring-1 ${priority.className}`}>
                {priority.label}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="nodrag flex flex-col gap-2"
                >
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onBlur={commitEdit}
                    className="w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-white/30 focus:bg-black/70"
                    autoFocus
                  />
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onBlur={commitEdit}
                    className="min-h-20 w-full resize-none rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-xs leading-5 text-zinc-200 outline-none transition focus:border-white/30 focus:bg-black/70"
                  />
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 shrink-0 ${colorStyle.textClassName}`} />
                    <h3 className="truncate text-base font-semibold tracking-tight text-white">{data.title}</h3>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300">{data.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <GripHorizontal className="mt-1 h-5 w-5 shrink-0 text-white/35 transition group-hover:text-white/70" />
        </div>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {tagPreview.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[0.65rem] font-medium text-zinc-300">
              {tag}
            </span>
          ))}
          {data.tags.length > tagPreview.length && (
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[0.65rem] font-medium text-zinc-400">
              +{data.tags.length - tagPreview.length}
            </span>
          )}
          {childCount > 0 && (
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[0.65rem] font-semibold text-cyan-100">
              {childCount} child{childCount === 1 ? "" : "ren"}
            </span>
          )}
        </div>

        <div className="nodrag relative mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <AnimatePresence initial={false}>
            {editing ? (
              <motion.div
                key="color-controls"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 overflow-hidden"
              >
                {roadmapColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Set ${roadmapColorStyles[color].label} color`}
                    onClick={() => updateNodeData(id, { color })}
                    className={`h-5 w-5 rounded-full border transition hover:scale-110 ${roadmapColorStyles[color].swatchClassName} ${data.color === color ? "border-white ring-2 ring-white/30" : "border-white/20"}`}
                  />
                ))}
              </motion.div>
            ) : (
              <span className="h-5" />
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => addChildNode(id)}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/10"
              aria-label="Create child node"
            >
              <GitBranchPlus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => deleteNodes([id])}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-rose-100 transition hover:border-rose-200/40 hover:bg-rose-300/10"
              aria-label="Delete node"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </RoadmapContextMenu>
  );
}
