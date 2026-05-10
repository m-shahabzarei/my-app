import { create } from "zustand";
import { Task } from "@/types";

interface TaskState {
  learningTasks: Task[];
  loadFromStorage: () => void;
  addTask: (task: Omit<Task, "id" | "done">) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskDone: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, checklistItemId: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const LEARNING_KEY = "learning_tasks";

export const useTaskStore = create<TaskState>((set, get) => ({
  learningTasks: [],

  loadFromStorage: () => {
    if (typeof window === "undefined") return;

    const learningData = localStorage.getItem(LEARNING_KEY);
    set({ learningTasks: learningData ? JSON.parse(learningData) : [] });
  },

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      done: false,
    };

    const updatedTasks = [...get().learningTasks, newTask];
    localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
    set({ learningTasks: updatedTasks });
  },

  updateTask: (taskId, updatedTask) => {
    const updatedTasks = get().learningTasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task));
    localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
    set({ learningTasks: updatedTasks });
  },

  deleteTask: (taskId) => {
    const updatedTasks = get().learningTasks.filter((task) => task.id !== taskId);
    localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
    set({ learningTasks: updatedTasks });
  },

  toggleTaskDone: (taskId) => {
    const updatedTasks = get().learningTasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task));
    localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
    set({ learningTasks: updatedTasks });
  },

  toggleChecklistItem: (taskId, checklistItemId) => {
    const updatedTasks = get().learningTasks.map((task) => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        checklist: task.checklist.map((item) => (item.id === checklistItemId ? { ...item, done: !item.done } : item)),
      };
    });

    localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
    set({ learningTasks: updatedTasks });
  },
}));
