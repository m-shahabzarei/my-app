"use client";

import { useMemo, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Pencil, Trash2 } from "lucide-react";
import { formatTimeRange, minutesToTime, timeToMinutes } from "@/lib/planning";
import type { PlanningTask } from "@/types/planning";
import { planningColorStyles } from "./colors";

interface TimelineViewProps {
  tasks: PlanningTask[];
  onScheduleTask: (taskId: string, startTime: string, endTime: string) => void;
  onEditTask: (task: PlanningTask) => void;
  onDeleteTask: (taskId: string) => void;
}

const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_HEIGHT = 76;
const SLOT_HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

function readDraggedTaskId(event: DragEvent<HTMLElement>) {
  return event.dataTransfer.getData("application/x-planning-task") || event.dataTransfer.getData("text/plain");
}

function blockStyle(task: PlanningTask) {
  const dayStart = START_HOUR * 60;
  const dayEnd = END_HOUR * 60;
  const start = timeToMinutes(task.startTime) ?? dayStart;
  const end = timeToMinutes(task.endTime) ?? start + 60;
  const visibleStart = Math.max(dayStart, Math.min(start, dayEnd));
  const visibleEnd = Math.max(visibleStart + 30, Math.min(end, dayEnd));

  return {
    top: ((visibleStart - dayStart) / 60) * SLOT_HEIGHT + 4,
    height: Math.max(48, ((visibleEnd - visibleStart) / 60) * SLOT_HEIGHT - 8),
  };
}

export default function TimelineView({ tasks, onScheduleTask, onEditTask, onDeleteTask }: TimelineViewProps) {
  const timedTasks = useMemo(() => {
    const dayStart = START_HOUR * 60;
    const dayEnd = END_HOUR * 60;

    return tasks.filter((task) => {
      const start = timeToMinutes(task.startTime);
      const end = timeToMinutes(task.endTime) ?? (start ?? 0) + 60;
      return start !== null && start < dayEnd && end > dayStart;
    });
  }, [tasks]);

  function handleDrop(event: DragEvent<HTMLElement>, hour: number) {
    event.preventDefault();
    const taskId = readDraggedTaskId(event);
    if (!taskId) return;

    onScheduleTask(taskId, minutesToTime(hour * 60), minutesToTime((hour + 1) * 60));
  }

  function handleDragStart(event: DragEvent<HTMLElement>, taskId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-planning-task", taskId);
    event.dataTransfer.setData("text/plain", taskId);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/3 p-4 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">Time blocks</p>
          <p className="mt-1 text-xs text-neutral-500">Drag a task into a slot, or set time manually when editing.</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400">06:00–22:00</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className="relative" style={{ height: SLOT_HOURS.length * SLOT_HEIGHT }}>
          {SLOT_HOURS.map((hour, index) => (
            <div
              key={hour}
              className="absolute left-0 right-0"
              style={{ top: index * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, hour)}
            >
              <div className="flex h-full">
                <div className="w-16 shrink-0 pr-3 pt-3 text-right text-xs text-neutral-600">{minutesToTime(hour * 60)}</div>
                <div className="flex-1 border-t border-white/10 transition hover:bg-white/3" />
              </div>
            </div>
          ))}

          {timedTasks.length === 0 && (
            <div className="absolute left-20 right-4 top-6 rounded-2xl border border-dashed border-white/10 bg-white/2.5 p-4 text-sm text-neutral-500">
              Scheduled tasks will appear here.
            </div>
          )}

          <div className="pointer-events-none absolute bottom-0 left-16 right-0 top-0">
            <AnimatePresence initial={false}>
              {timedTasks.map((task) => {
                const color = planningColorStyles[task.color];

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="pointer-events-auto absolute left-3 right-3"
                    style={blockStyle(task)}
                  >
                    <div
                      draggable
                      onDragStart={(event) => handleDragStart(event, task.id)}
                      className={`h-full cursor-grab rounded-2xl border ${color.border} ${color.bg} p-3 shadow-xl shadow-black/25 active:cursor-grabbing`}
                    >
                      <div className="flex h-full min-h-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span className={`h-2 w-2 rounded-full ${color.dot}`} />
                            <Clock3 className="h-3 w-3" />
                            {formatTimeRange(task.startTime, task.endTime)}
                          </div>
                          <p className={`mt-1 truncate text-sm font-medium ${task.completed ? "text-neutral-500 line-through" : "text-white"}`}>{task.title}</p>
                          {task.description && <p className="mt-0.5 truncate text-xs text-neutral-500">{task.description}</p>}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            aria-label="Edit time block"
                            onClick={() => onEditTask(task)}
                            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete time block"
                            onClick={() => onDeleteTask(task.id)}
                            className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
