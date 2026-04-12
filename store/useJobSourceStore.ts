import { create } from "zustand";
import { JobSource } from "@/types";

interface JobSourceState {
  activeSources: JobSource[];
  loadFromStorage: () => void;
  toggleSource: (source: JobSource) => void;
}

const STORAGE_KEY = "job_sources";

export const useJobSourceStore = create<JobSourceState>((set, get) => ({
  activeSources: ["jobinja", "jobvision"],

  loadFromStorage: () => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      set({ activeSources: JSON.parse(data) });
    }
  },

  toggleSource: (source: JobSource) => {
    const current = get().activeSources;
    let updated: JobSource[];

    if (current.includes(source)) {
      updated = current.filter((s) => s !== source);
    } else {
      updated = [...current, source];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ activeSources: updated });
  },
}));