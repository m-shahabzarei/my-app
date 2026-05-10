"use client";

import type { DragEvent } from "react";
import { Check, Clock3, GripVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatTimeRange } from "@/lib/planning";
import type { PlanningTask } from "@/types/planning";
import { planningColorStyles } from "./colors";

interface TaskCardProps {
  task: PlanningTask;
  onToggle: (taskId: string) => void;
  onEdit: (task: PlanningTask) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const color = planningColorStyles[task.color];

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-planning-task", task.id);
    event.dataTransfer.setData("text/plain", task.id);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        className={`group rounded-2xl border ${color.border} ${color.bg} p-3 transition hover:border-white/20 hover:bg-white/6 ${
          task.completed ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
            onClick={() => onToggle(task.id)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
              task.completed ? "border-white bg-white text-black" : "border-white/25 text-transparent hover:border-white/60"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className={`truncate text-sm font-medium ${task.completed ? "line-through text-neutral-500" : "text-white"}`}>
                  {task.title}
                </h3>
                {task.description && <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{task.description}</p>}
              </div>
              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600 opacity-0 transition group-hover:opacity-100" />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${color.text} ${color.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                <Clock3 className="h-3 w-3" />
                {formatTimeRange(task.startTime, task.endTime)}
              </span>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Edit task"
                  onClick={() => onEdit(task)}
                  className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Delete task"
                  onClick={() => onDelete(task.id)}
                  className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
