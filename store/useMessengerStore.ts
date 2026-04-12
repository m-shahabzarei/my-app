import { create } from "zustand";

interface MessengerState {
  activeMessengers: string[];
  loadFromStorage: () => void;
  toggleMessenger: (appId: string) => void;
}

const STORAGE_KEY = "active_messengers";

export const useMessengerStore = create<MessengerState>((set, get) => ({
  activeMessengers: ["telegram", "gmail"],

  loadFromStorage: () => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      set({ activeMessengers: JSON.parse(data) });
    }
  },

  toggleMessenger: (appId) => {
    const current = get().activeMessengers;
    let updated: string[];

    if (current.includes(appId)) {
      updated = current.filter((id) => id !== appId);
    } else {
      updated = [...current, appId];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ activeMessengers: updated });
  },
}));