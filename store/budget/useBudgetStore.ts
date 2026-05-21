import { create } from "zustand";
import { createEmptyBudgetMonthRecord, getCurrentBudgetMonthKey, normalizeAmount } from "@/lib/budget";
import type { BudgetEntry, BudgetEntryDraft, BudgetMonthRecord, IncomeItem, IncomeItemDraft, IncomeSource } from "@/types/budget";

interface BudgetState {
  months: Record<string, BudgetMonthRecord>;
  selectedMonthKey: string;
  hasHydrated: boolean;
  hydrate: () => void;
  setSelectedMonth: (monthKey: string) => void;
  addIncomeItem: (draft: IncomeItemDraft) => void;
  updateIncomeItem: (itemId: string, draft: IncomeItemDraft) => void;
  deleteIncomeItem: (itemId: string) => void;
  addSavingItem: (draft: BudgetEntryDraft) => void;
  updateSavingItem: (itemId: string, draft: BudgetEntryDraft) => void;
  deleteSavingItem: (itemId: string) => void;
  addExpenseItem: (draft: BudgetEntryDraft) => void;
  updateExpenseItem: (itemId: string, draft: BudgetEntryDraft) => void;
  deleteExpenseItem: (itemId: string) => void;
}

const STORAGE_KEY = "budget_monthly_v1";

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function persist(months: Record<string, BudgetMonthRecord>, selectedMonthKey: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ months, selectedMonthKey }));
}

function normalizeSource(value: unknown): IncomeSource | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<IncomeSource>;
  if (typeof source.label !== "string") return null;

  return {
    id: typeof source.id === "string" ? source.id : createId(),
    label: source.label.trim(),
    amount: normalizeAmount(Number(source.amount)),
  };
}

function normalizeIncomeItem(value: unknown): IncomeItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<IncomeItem>;
  if (typeof item.id !== "string" || typeof item.title !== "string" || !Array.isArray(item.sources)) return null;

  const sources = item.sources.map(normalizeSource).filter((source): source is IncomeSource => Boolean(source));
  if (sources.length === 0) return null;

  const now = new Date().toISOString();

  return {
    id: item.id,
    title: item.title.trim(),
    sources,
    notes: typeof item.notes === "string" && item.notes.trim() ? item.notes.trim() : undefined,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : now,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : now,
  };
}

function normalizeEntry(value: unknown): BudgetEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<BudgetEntry>;
  if (typeof entry.id !== "string" || typeof entry.title !== "string") return null;

  const now = new Date().toISOString();

  return {
    id: entry.id,
    title: entry.title.trim(),
    category: typeof entry.category === "string" ? entry.category.trim() : "",
    amount: normalizeAmount(Number(entry.amount)),
    notes: typeof entry.notes === "string" && entry.notes.trim() ? entry.notes.trim() : undefined,
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : now,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : now,
  };
}

function normalizeMonthRecord(monthKey: string, value: unknown): BudgetMonthRecord {
  if (!value || typeof value !== "object") return createEmptyBudgetMonthRecord(monthKey);
  const record = value as Partial<BudgetMonthRecord>;

  return {
    monthKey,
    incomeItems: Array.isArray(record.incomeItems)
      ? record.incomeItems.map(normalizeIncomeItem).filter((item): item is IncomeItem => Boolean(item))
      : [],
    savingItems: Array.isArray(record.savingItems)
      ? record.savingItems.map(normalizeEntry).filter((item): item is BudgetEntry => Boolean(item))
      : [],
    expenseItems: Array.isArray(record.expenseItems)
      ? record.expenseItems.map(normalizeEntry).filter((item): item is BudgetEntry => Boolean(item))
      : [],
  };
}

function buildIncomeItem(draft: IncomeItemDraft, existing?: IncomeItem): IncomeItem {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    title: draft.title.trim(),
    sources: draft.sources
      .map((source) => ({
        id: createId(),
        label: source.label.trim(),
        amount: normalizeAmount(source.amount),
      }))
      .filter((source) => source.label && source.amount > 0),
    notes: draft.notes?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function buildEntry(draft: BudgetEntryDraft, existing?: BudgetEntry): BudgetEntry {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    title: draft.title.trim(),
    category: draft.category.trim(),
    amount: normalizeAmount(draft.amount),
    notes: draft.notes?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function updateSelectedMonth(
  state: BudgetState,
  updater: (monthRecord: BudgetMonthRecord) => BudgetMonthRecord
): Pick<BudgetState, "months"> {
  const currentMonth = state.months[state.selectedMonthKey] ?? createEmptyBudgetMonthRecord(state.selectedMonthKey);
  const nextMonth = updater(currentMonth);
  const nextMonths = {
    ...state.months,
    [state.selectedMonthKey]: nextMonth,
  };

  persist(nextMonths, state.selectedMonthKey);
  return { months: nextMonths };
}

export const useBudgetStore = create<BudgetState>((set) => ({
  months: {},
  selectedMonthKey: getCurrentBudgetMonthKey(),
  hasHydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ hasHydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { months?: unknown; selectedMonthKey?: unknown };
      const months =
        parsed.months && typeof parsed.months === "object"
          ? Object.fromEntries(
              Object.entries(parsed.months as Record<string, unknown>).map(([monthKey, value]) => [monthKey, normalizeMonthRecord(monthKey, value)])
            )
          : {};
      const selectedMonthKey =
        typeof parsed.selectedMonthKey === "string" && parsed.selectedMonthKey.trim()
          ? parsed.selectedMonthKey
          : getCurrentBudgetMonthKey();

      set({ months, selectedMonthKey, hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },

  setSelectedMonth: (monthKey) =>
    set((state) => {
      persist(state.months, monthKey);
      return { selectedMonthKey: monthKey };
    }),

  addIncomeItem: (draft) =>
    set((state) => {
      if (!draft.title.trim()) return state;
      const nextItem = buildIncomeItem(draft);
      if (nextItem.sources.length === 0) return state;

      return updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        incomeItems: [nextItem, ...monthRecord.incomeItems],
      }));
    }),

  updateIncomeItem: (itemId, draft) =>
    set((state) => {
      if (!draft.title.trim()) return state;
      const currentMonth = state.months[state.selectedMonthKey] ?? createEmptyBudgetMonthRecord(state.selectedMonthKey);
      const existing = currentMonth.incomeItems.find((item) => item.id === itemId);
      if (!existing) return state;

      const nextItem = buildIncomeItem(draft, existing);
      if (nextItem.sources.length === 0) return state;

      return updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        incomeItems: monthRecord.incomeItems.map((item) => (item.id === itemId ? nextItem : item)),
      }));
    }),

  deleteIncomeItem: (itemId) =>
    set((state) =>
      updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        incomeItems: monthRecord.incomeItems.filter((item) => item.id !== itemId),
      }))
    ),

  addSavingItem: (draft) =>
    set((state) => {
      if (!draft.title.trim() || normalizeAmount(draft.amount) <= 0) return state;
      const nextItem = buildEntry(draft);

      return updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        savingItems: [nextItem, ...monthRecord.savingItems],
      }));
    }),

  updateSavingItem: (itemId, draft) =>
    set((state) => {
      if (!draft.title.trim() || normalizeAmount(draft.amount) <= 0) return state;
      const currentMonth = state.months[state.selectedMonthKey] ?? createEmptyBudgetMonthRecord(state.selectedMonthKey);
      const existing = currentMonth.savingItems.find((item) => item.id === itemId);
      if (!existing) return state;

      const nextItem = buildEntry(draft, existing);

      return updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        savingItems: monthRecord.savingItems.map((item) => (item.id === itemId ? nextItem : item)),
      }));
    }),

  deleteSavingItem: (itemId) =>
    set((state) =>
      updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        savingItems: monthRecord.savingItems.filter((item) => item.id !== itemId),
      }))
    ),

  addExpenseItem: (draft) =>
    set((state) => {
      if (!draft.title.trim() || normalizeAmount(draft.amount) <= 0) return state;
      const nextItem = buildEntry(draft);

      return updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        expenseItems: [nextItem, ...monthRecord.expenseItems],
      }));
    }),

  updateExpenseItem: (itemId, draft) =>
    set((state) => {
      if (!draft.title.trim() || normalizeAmount(draft.amount) <= 0) return state;
      const currentMonth = state.months[state.selectedMonthKey] ?? createEmptyBudgetMonthRecord(state.selectedMonthKey);
      const existing = currentMonth.expenseItems.find((item) => item.id === itemId);
      if (!existing) return state;

      const nextItem = buildEntry(draft, existing);

      return updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        expenseItems: monthRecord.expenseItems.map((item) => (item.id === itemId ? nextItem : item)),
      }));
    }),

  deleteExpenseItem: (itemId) =>
    set((state) =>
      updateSelectedMonth(state, (monthRecord) => ({
        ...monthRecord,
        expenseItems: monthRecord.expenseItems.filter((item) => item.id !== itemId),
      }))
    ),
}));
