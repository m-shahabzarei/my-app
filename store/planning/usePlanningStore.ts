import { create } from "zustand";
import { normalizeTaskTimes, todayKey } from "@/lib/planning";
import type { PlanningTask, PlanningTaskColor, PlanningTaskDraft } from "@/types/planning";

interface PlanningState {
  tasks: PlanningTask[];
  selectedDate: string;
  hasHydrated: boolean;
  hydrate: () => void;
  setSelectedDate: (date: string) => void;
  addTask: (task: PlanningTaskDraft) => void;
  updateTask: (taskId: string, task: PlanningTaskDraft) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompleted: (taskId: string) => void;
  scheduleTask: (taskId: string, startTime: string, endTime?: string) => void;
}

const STORAGE_KEY = "planning_daily_v1";
const DEFAULT_COLOR: PlanningTaskColor = "slate";

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function persist(tasks: PlanningTask[], selectedDate: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, selectedDate }));
}

function isStoredTask(value: unknown): value is PlanningTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<PlanningTask>;
  return typeof task.id === "string" && typeof task.title === "string" && typeof task.date === "string";
}

function normalizeStoredTask(task: PlanningTask): PlanningTask {
  const now = new Date().toISOString();
  const [startTime, endTime] = normalizeTaskTimes(task.startTime, task.endTime);

  return {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    date: task.date,
    completed: Boolean(task.completed),
    startTime,
    endTime,
    color: task.color || DEFAULT_COLOR,
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || now,
  };
}

function buildTask(task: PlanningTaskDraft, existing?: PlanningTask): PlanningTask {
  const now = new Date().toISOString();
  const [startTime, endTime] = normalizeTaskTimes(task.startTime, task.endTime);

  return {
    id: existing?.id ?? createId(),
    title: task.title.trim(),
    description: task.description?.trim() || undefined,
    date: task.date || todayKey(),
    completed: existing?.completed ?? false,
    startTime,
    endTime,
    color: task.color || DEFAULT_COLOR,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export const usePlanningStore = create<PlanningState>((set) => ({
  tasks: [],
  selectedDate: todayKey(),
  hasHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ hasHydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { tasks?: unknown; selectedDate?: unknown };
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks.filter(isStoredTask).map(normalizeStoredTask) : [];
      const selectedDate = typeof parsed.selectedDate === "string" ? parsed.selectedDate : todayKey();
      set({ tasks, selectedDate, hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },

  setSelectedDate: (date) =>
    set((state) => {
      persist(state.tasks, date);
      return { selectedDate: date };
    }),

  addTask: (draft) =>
    set((state) => {
      if (!draft.title.trim()) return state;
      const nextTasks = [...state.tasks, buildTask(draft)];
      persist(nextTasks, state.selectedDate);
      return { tasks: nextTasks };
    }),

  updateTask: (taskId, draft) =>
    set((state) => {
      if (!draft.title.trim()) return state;
      const nextTasks = state.tasks.map((task) => (task.id === taskId ? buildTask(draft, task) : task));
      persist(nextTasks, state.selectedDate);
      return { tasks: nextTasks };
    }),

  deleteTask: (taskId) =>
    set((state) => {
      const nextTasks = state.tasks.filter((task) => task.id !== taskId);
      persist(nextTasks, state.selectedDate);
      return { tasks: nextTasks };
    }),

  toggleTaskCompleted: (taskId) =>
    set((state) => {
      const now = new Date().toISOString();
      const nextTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed, updatedAt: now } : task
      );
      persist(nextTasks, state.selectedDate);
      return { tasks: nextTasks };
    }),

  scheduleTask: (taskId, startTime, endTime) =>
    set((state) => {
      const now = new Date().toISOString();
      const [nextStartTime, nextEndTime] = normalizeTaskTimes(startTime, endTime);
      const nextTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, startTime: nextStartTime, endTime: nextEndTime, updatedAt: now } : task
      );
      persist(nextTasks, state.selectedDate);
      return { tasks: nextTasks };
    }),
}));
