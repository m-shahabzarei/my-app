"use client";

import * as ContextMenu from "@radix-ui/react-context-menu";
import { Check, Copy, GitBranchPlus, Palette, Trash2 } from "lucide-react";
import { roadmapColors, roadmapColorStyles, roadmapStatuses, roadmapStatusMeta } from "@/lib/roadmap";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import type { ReactNode } from "react";
import type { RoadmapColor, RoadmapStatus } from "@/types/roadmap";

interface RoadmapContextMenuProps {
  nodeId: string;
  currentColor: RoadmapColor;
  currentStatus: RoadmapStatus;
  children: ReactNode;
}

const itemClassName =
  "flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none transition-colors data-[highlighted]:bg-white/10 data-[highlighted]:text-white";

export default function RoadmapContextMenu({ nodeId, currentColor, currentStatus, children }: RoadmapContextMenuProps) {
  const addChildNode = useRoadmapStore((state) => state.addChildNode);
  const duplicateNodes = useRoadmapStore((state) => state.duplicateNodes);
  const deleteNodes = useRoadmapStore((state) => state.deleteNodes);
  const updateNodeData = useRoadmapStore((state) => state.updateNodeData);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-50 min-w-56 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <ContextMenu.Item className={itemClassName} onSelect={() => addChildNode(nodeId)}>
            <GitBranchPlus className="h-4 w-4 text-cyan-200" />
            Create child node
          </ContextMenu.Item>
          <ContextMenu.Item className={itemClassName} onSelect={() => duplicateNodes([nodeId])}>
            <Copy className="h-4 w-4 text-violet-200" />
            Duplicate node
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-2 h-px bg-white/10" />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={itemClassName}>
              <Palette className="h-4 w-4 text-amber-200" />
              Change color
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="z-50 min-w-48 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                {roadmapColors.map((color) => (
                  <ContextMenu.Item
                    key={color}
                    className={itemClassName}
                    onSelect={() => updateNodeData(nodeId, { color })}
                  >
                    <span className={`h-3 w-3 rounded-full ${roadmapColorStyles[color].swatchClassName}`} />
                    {roadmapColorStyles[color].label}
                    {currentColor === color && <Check className="ml-auto h-4 w-4 text-emerald-200" />}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={itemClassName}>
              <Check className="h-4 w-4 text-emerald-200" />
              Set status
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="z-50 min-w-48 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
                {roadmapStatuses.map((status) => (
                  <ContextMenu.Item
                    key={status}
                    className={itemClassName}
                    onSelect={() => updateNodeData(nodeId, { status })}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${roadmapStatusMeta[status].dotClassName}`} />
                    {roadmapStatusMeta[status].label}
                    {currentStatus === status && <Check className="ml-auto h-4 w-4 text-emerald-200" />}
                  </ContextMenu.Item>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator className="my-2 h-px bg-white/10" />

          <ContextMenu.Item
            className="flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-200 outline-none transition-colors data-[highlighted]:bg-rose-500/15 data-[highlighted]:text-rose-100"
            onSelect={() => deleteNodes([nodeId])}
          >
            <Trash2 className="h-4 w-4" />
            Delete node
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
