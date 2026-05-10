"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  formatPersianNumber,
  getJalaliDateParts,
  getJalaliMonthLength,
  JALALI_MONTHS,
  jalaliToDateKey,
} from "@/lib/planning";
import { PLANNING_COLORS, type PlanningTask, type PlanningTaskColor, type PlanningTaskDraft } from "@/types/planning";
import { planningColorStyles } from "./colors";

interface TaskDialogProps {
  open: boolean;
  selectedDate: string;
  task: PlanningTask | null;
  onClose: () => void;
  onSave: (task: PlanningTaskDraft) => void;
  onDelete: (taskId: string) => void;
}

interface TaskFormState {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: PlanningTaskColor;
}

function getInitialForm(task: PlanningTask | null, selectedDate: string): TaskFormState {
  if (!task) {
    return {
      title: "",
      description: "",
      date: selectedDate,
      startTime: "",
      endTime: "",
      color: "slate",
    };
  }

  return {
    title: task.title,
    description: task.description ?? "",
    date: task.date,
    startTime: task.startTime ?? "",
    endTime: task.endTime ?? "",
    color: task.color,
  };
}

function TaskDialogPanel({ selectedDate, task, onClose, onSave, onDelete }: TaskDialogProps) {
  const [form, setForm] = useState<TaskFormState>(() => getInitialForm(task, selectedDate));
  const jalaliDate = getJalaliDateParts(form.date || selectedDate);
  const yearOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => jalaliDate.year - 3 + index),
    [jalaliDate.year]
  );
  const dayOptions = useMemo(
    () => Array.from({ length: getJalaliMonthLength(jalaliDate.year, jalaliDate.month) }, (_, index) => index + 1),
    [jalaliDate.month, jalaliDate.year]
  );

  function updateJalaliDate(nextDate: Partial<typeof jalaliDate>) {
    const nextYear = nextDate.year ?? jalaliDate.year;
    const nextMonth = nextDate.month ?? jalaliDate.month;
    const nextDay = Math.min(nextDate.day ?? jalaliDate.day, getJalaliMonthLength(nextYear, nextMonth));
    setForm({ ...form, date: jalaliToDateKey(nextYear, nextMonth, nextDay) });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    onSave({
      title,
      description: form.description.trim() || undefined,
      date: form.date || selectedDate,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      color: form.color,
    });
    onClose();
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="planning-task-dialog-title"
      className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-neutral-950 p-5 shadow-2xl shadow-black/60 sm:p-6"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Daily plan</p>
          <h2 id="planning-task-dialog-title" className="mt-1 text-xl font-semibold text-white">
            {task ? "Edit task" : "Create task"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Title</label>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            autoFocus
            required
            placeholder="What do you want to get done?"
            className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={3}
            placeholder="Optional notes"
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">تاریخ شمسی</label>
          <div className="grid grid-cols-3 gap-2" dir="rtl">
            <select
              value={jalaliDate.day}
              onChange={(event) => updateJalaliDate({ day: Number(event.target.value) })}
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-3 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/6"
            >
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  {formatPersianNumber(day)}
                </option>
              ))}
            </select>
            <select
              value={jalaliDate.month}
              onChange={(event) => updateJalaliDate({ month: Number(event.target.value) })}
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-3 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/6"
            >
              {JALALI_MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={jalaliDate.year}
              onChange={(event) => updateJalaliDate({ year: Number(event.target.value) })}
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-3 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/6"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {formatPersianNumber(year)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Start</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => setForm({ ...form, startTime: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/6"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">End</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => setForm({ ...form, endTime: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/6"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-400">Color</label>
          <div className="flex flex-wrap gap-2">
            {PLANNING_COLORS.map((color) => {
              const styles = planningColorStyles[color];
              const selected = form.color === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs capitalize transition ${styles.border} ${styles.bg} ${styles.text} ${
                    selected ? `ring-2 ${styles.ring}` : "hover:border-white/30"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {task && (
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="w-full rounded-2xl border border-rose-500/20 px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 sm:w-auto"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 sm:flex-none"
            >
              {task ? "Save changes" : "Create task"}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

export default function TaskDialog(props: TaskDialogProps) {
  const { open, onClose, task, selectedDate } = props;

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-70 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <TaskDialogPanel key={task?.id ?? `new-${selectedDate}`} {...props} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
