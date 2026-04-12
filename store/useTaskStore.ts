import { create } from "zustand";
import { Task, ChecklistItem } from "@/types";

interface TaskState {
  planningTasks: Task[];
  learningTasks: Task[];
  loadFromStorage: () => void;
  addTask: (type: "planning" | "learning", task: Omit<Task, "id" | "done">) => void;
  updateTask: (type: "planning" | "learning", taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (type: "planning" | "learning", taskId: string) => void;
  toggleTaskDone: (type: "planning" | "learning", taskId: string) => void;
  toggleChecklistItem: (type: "planning" | "learning", taskId: string, checklistItemId: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const PLANNING_KEY = "planning_tasks";
const LEARNING_KEY = "learning_tasks";

export const useTaskStore = create<TaskState>((set, get) => ({
  planningTasks: [],
  learningTasks: [],

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    
    const planningData = localStorage.getItem(PLANNING_KEY);
    const learningData = localStorage.getItem(LEARNING_KEY);

    set({
      planningTasks: planningData ? JSON.parse(planningData) : [],
      learningTasks: learningData ? JSON.parse(learningData) : [],
    });
  },

  addTask: (type, task) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      done: false,
    };

    const tasks = type === "planning" ? get().planningTasks : get().learningTasks;
    const updatedTasks = [...tasks, newTask];

    if (type === "planning") {
      localStorage.setItem(PLANNING_KEY, JSON.stringify(updatedTasks));
      set({ planningTasks: updatedTasks });
    } else {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
      set({ learningTasks: updatedTasks });
    }
  },

  updateTask: (type, taskId, updatedTask) => {
    const tasks = type === "planning" ? get().planningTasks : get().learningTasks;
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updatedTask } : task
    );

    if (type === "planning") {
      localStorage.setItem(PLANNING_KEY, JSON.stringify(updatedTasks));
      set({ planningTasks: updatedTasks });
    } else {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
      set({ learningTasks: updatedTasks });
    }
  },

  deleteTask: (type, taskId) => {
    const tasks = type === "planning" ? get().planningTasks : get().learningTasks;
    const updatedTasks = tasks.filter((task) => task.id !== taskId);

    if (type === "planning") {
      localStorage.setItem(PLANNING_KEY, JSON.stringify(updatedTasks));
      set({ planningTasks: updatedTasks });
    } else {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
      set({ learningTasks: updatedTasks });
    }
  },

  toggleTaskDone: (type, taskId) => {
    const tasks = type === "planning" ? get().planningTasks : get().learningTasks;
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );

    if (type === "planning") {
      localStorage.setItem(PLANNING_KEY, JSON.stringify(updatedTasks));
      set({ planningTasks: updatedTasks });
    } else {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
      set({ learningTasks: updatedTasks });
    }
  },

  toggleChecklistItem: (type, taskId, checklistItemId) => {
    const tasks = type === "planning" ? get().planningTasks : get().learningTasks;
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        checklist: task.checklist.map((item) =>
          item.id === checklistItemId ? { ...item, done: !item.done } : item
        ),
      };
    });

    if (type === "planning") {
      localStorage.setItem(PLANNING_KEY, JSON.stringify(updatedTasks));
      set({ planningTasks: updatedTasks });
    } else {
      localStorage.setItem(LEARNING_KEY, JSON.stringify(updatedTasks));
      set({ learningTasks: updatedTasks });
    }
  },
}));