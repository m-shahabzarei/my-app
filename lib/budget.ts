import { addJalaliMonths, formatMonthHeading, getJalaliDateParts, todayKey } from "@/lib/planning";
import type { BudgetEntry, BudgetMonthRecord, BudgetMonthSummary, IncomeItem, IncomeSource } from "@/types/budget";

function normalizeMonthPart(value: number): string {
  return String(Math.max(1, Math.min(12, value))).padStart(2, "0");
}

export function buildBudgetMonthKey(year: number, month: number): string {
  return `${year}-${normalizeMonthPart(month)}`;
}

export function parseBudgetMonthKey(monthKey: string): { year: number; month: number } {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    const today = getCurrentBudgetMonthKey();
    return parseBudgetMonthKey(today);
  }

  return { year, month };
}

export function getCurrentBudgetMonthKey(): string {
  const today = getJalaliDateParts(todayKey());
  return buildBudgetMonthKey(today.year, today.month);
}

export function shiftBudgetMonthKey(monthKey: string, amount: number): string {
  const { year, month } = parseBudgetMonthKey(monthKey);
  const next = addJalaliMonths(year, month, amount);
  return buildBudgetMonthKey(next.year, next.month);
}

export function formatBudgetMonthLabel(monthKey: string): string {
  const { year, month } = parseBudgetMonthKey(monthKey);
  return formatMonthHeading(year, month);
}

export function createEmptyBudgetMonthRecord(monthKey: string): BudgetMonthRecord {
  return {
    monthKey,
    incomeItems: [],
    savingItems: [],
    expenseItems: [],
  };
}

export function normalizeAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export function sumIncomeSources(sources: IncomeSource[]): number {
  return sources.reduce((total, source) => total + normalizeAmount(source.amount), 0);
}

export function sumIncomeItems(items: IncomeItem[]): number {
  return items.reduce((total, item) => total + sumIncomeSources(item.sources), 0);
}

export function sumBudgetEntries(entries: BudgetEntry[]): number {
  return entries.reduce((total, item) => total + normalizeAmount(item.amount), 0);
}

export function getBudgetMonthSummary(record?: BudgetMonthRecord): BudgetMonthSummary {
  const month = record ?? createEmptyBudgetMonthRecord(getCurrentBudgetMonthKey());
  const totalIncome = sumIncomeItems(month.incomeItems);
  const totalSavings = sumBudgetEntries(month.savingItems);
  const totalExpenses = sumBudgetEntries(month.expenseItems);
  const netBalance = totalIncome - totalSavings - totalExpenses;
  const categoryTotals = month.expenseItems.reduce<Record<string, number>>((totals, item) => {
    const key = item.category.trim() || "بدون دسته";
    totals[key] = (totals[key] ?? 0) + normalizeAmount(item.amount);
    return totals;
  }, {});
  const topExpenseCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const entryCount = month.incomeItems.length + month.savingItems.length + month.expenseItems.length;

  return {
    totalIncome,
    totalSavings,
    totalExpenses,
    netBalance,
    savingsRate: totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0,
    topExpenseCategory,
    entryCount,
    hasActivity: entryCount > 0,
  };
}
