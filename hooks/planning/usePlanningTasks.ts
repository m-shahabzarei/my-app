"use client";

import { useMemo } from "react";
import { comparePlanningTasks } from "@/lib/planning";
import { usePlanningStore } from "@/store/planning/usePlanningStore";
import type { PlanningDaySummary } from "@/types/planning";

export function usePlanningTasks() {
  const tasks = usePlanningStore((state) => state.tasks);
  const selectedDate = usePlanningStore((state) => state.selectedDate);

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.date === selectedDate).sort(comparePlanningTasks),
    [tasks, selectedDate]
  );

  const timedTasks = useMemo(() => selectedTasks.filter((task) => task.startTime), [selectedTasks]);
  const unscheduledTasks = useMemo(() => selectedTasks.filter((task) => !task.startTime), [selectedTasks]);

  const planningDays = useMemo<PlanningDaySummary[]>(() => {
    const days = new Map<string, PlanningDaySummary>();

    for (const task of tasks) {
      const current = days.get(task.date) ?? { date: task.date, total: 0, completed: 0 };
      current.total += 1;
      current.completed += task.completed ? 1 : 0;
      days.set(task.date, current);
    }

    return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks]);

  const selectedStats = useMemo(
    () => ({
      total: selectedTasks.length,
      completed: selectedTasks.filter((task) => task.completed).length,
      timed: timedTasks.length,
      unscheduled: unscheduledTasks.length,
    }),
    [selectedTasks, timedTasks.length, unscheduledTasks.length]
  );

  return {
    tasks,
    selectedDate,
    selectedTasks,
    timedTasks,
    unscheduledTasks,
    planningDays,
    selectedStats,
  };
}
