"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addJalaliMonths,
  formatMonthHeading,
  formatPersianNumber,
  formatShortDate,
  getJalaliDateParts,
  getMonthGrid,
  PERSIAN_WEEKDAYS,
  todayKey,
} from "@/lib/planning";
import type { PlanningDaySummary, PlanningTask } from "@/types/planning";

interface CalendarSidebarProps {
  selectedDate: string;
  tasks: PlanningTask[];
  planningDays: PlanningDaySummary[];
  onSelectDate: (date: string) => void;
}

export default function CalendarSidebar({ selectedDate, tasks, planningDays, onSelectDate }: CalendarSidebarProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const visibleMonth = useMemo(() => {
    const selectedMonth = getJalaliDateParts(selectedDate);
    return addJalaliMonths(selectedMonth.year, selectedMonth.month, monthOffset);
  }, [monthOffset, selectedDate]);

  const monthDays = useMemo(
    () => getMonthGrid(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year]
  );

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of tasks) counts.set(task.date, (counts.get(task.date) ?? 0) + 1);
    return counts;
  }, [tasks]);

  const visiblePlanningDays = useMemo(() => {
    const today = todayKey();
    const upcoming = planningDays.filter((day) => day.date >= today).slice(0, 5);
    const previous = planningDays.filter((day) => day.date < today).slice(-5).reverse();
    return [...upcoming, ...previous].slice(0, 8);
  }, [planningDays]);

  function selectDate(date: string) {
    setMonthOffset(0);
    onSelectDate(date);
  }

  const today = todayKey();

  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start" dir="rtl">
      <section className="rounded-3xl border border-white/10 bg-white/3 p-4 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-white">تقویم</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="ماه قبل"
              onClick={() => setMonthOffset((offset) => offset - 1)}
              className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="ماه بعد"
              onClick={() => setMonthOffset((offset) => offset + 1)}
              className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mb-4 text-lg font-semibold text-white">{formatMonthHeading(visibleMonth.year, visibleMonth.month)}</p>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-neutral-600">
          {PERSIAN_WEEKDAYS.map((weekday) => (
            <span key={weekday} className="py-1">
              {weekday.slice(0, 1)}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const selected = day.dateKey === selectedDate;
            const current = day.dateKey === today;
            const count = taskCounts.get(day.dateKey) ?? 0;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => selectDate(day.dateKey)}
                className={`relative aspect-square rounded-xl text-sm transition ${
                  selected
                    ? "bg-white font-semibold text-black"
                    : day.isCurrentMonth
                      ? "text-neutral-300 hover:bg-white/10 hover:text-white"
                      : "text-neutral-700 hover:bg-white/4"
                }`}
              >
                {formatPersianNumber(day.dayNumber)}
                {count > 0 && (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${selected ? "bg-black" : "bg-blue-300"}`}
                  />
                )}
                {current && !selected && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/3 p-4 shadow-2xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-white">روزهای برنامه‌ریزی</h2>
          <span className="text-xs text-neutral-500">{formatPersianNumber(planningDays.length)} روز</span>
        </div>

        <div className="space-y-2">
          {visiblePlanningDays.map((day) => {
            const selected = day.date === selectedDate;
            const doneLabel = `${formatPersianNumber(day.completed)}/${formatPersianNumber(day.total)}`;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => selectDate(day.date)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-right transition ${
                  selected
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-black/20 text-neutral-400 hover:border-white/20 hover:bg-white/6 hover:text-white"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{formatShortDate(day.date)}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{formatPersianNumber(day.total)} تسک</p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-neutral-300">{doneLabel}</span>
              </button>
            );
          })}

          {visiblePlanningDays.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-neutral-500">
              برای شروع تاریخچه برنامه‌ریزی، یک تسک بسازید.
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
