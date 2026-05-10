"use client";

import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";
import { formatDayHeading, todayKey } from "@/lib/planning";

interface PlannerHeaderProps {
  selectedDate: string;
  totalTasks: number;
  completedTasks: number;
  timedTasks: number;
  onAddTask: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export default function PlannerHeader({
  selectedDate,
  totalTasks,
  completedTasks,
  timedTasks,
  onAddTask,
  onPreviousDay,
  onNextDay,
  onToday,
}: PlannerHeaderProps) {
  const isToday = selectedDate === todayKey();

  return (
    <header className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-400">
            <CalendarDays className="h-4 w-4" />
            <span>Planning</span>
          </div>
          <h1 className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">{formatDayHeading(selectedDate)}</h1>
          <p className="mt-2 text-sm text-neutral-400">A calm daily plan with lightweight time blocking.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1.5 text-center sm:min-w-72">
            <div className="rounded-xl px-3 py-2">
              <p className="text-base font-semibold text-white">{totalTasks}</p>
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">Tasks</p>
            </div>
            <div className="rounded-xl px-3 py-2">
              <p className="inline-flex items-center justify-center gap-1 text-base font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {completedTasks}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">Done</p>
            </div>
            <div className="rounded-xl px-3 py-2">
              <p className="inline-flex items-center justify-center gap-1 text-base font-semibold text-white">
                <Clock3 className="h-4 w-4 text-blue-300" />
                {timedTasks}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">Timed</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
              <button
                type="button"
                aria-label="Previous day"
                onClick={onPreviousDay}
                className="rounded-xl p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onToday}
                disabled={isToday}
                className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:cursor-default disabled:text-neutral-600 disabled:hover:bg-transparent"
              >
                امروز
              </button>
              <button
                type="button"
                aria-label="Next day"
                onClick={onNextDay}
                className="rounded-xl p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onAddTask}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
