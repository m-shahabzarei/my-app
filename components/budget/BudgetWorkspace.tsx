"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  PencilLine,
  PiggyBank,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Card from "@/components/Card";
import {
  createEmptyBudgetMonthRecord,
  formatBudgetMonthLabel,
  getBudgetMonthSummary,
  getCurrentBudgetMonthKey,
  normalizeAmount,
  shiftBudgetMonthKey,
  sumIncomeSources,
} from "@/lib/budget";
import { formatPersianNumber } from "@/lib/planning";
import { useBudgetStore } from "@/store/budget/useBudgetStore";
import type { BudgetEntry, BudgetEntryDraft, IncomeItem, IncomeItemDraft } from "@/types/budget";

type EntryKind = "saving" | "expense";

type IncomeFormState = {
  title: string;
  notes: string;
  sources: Array<{
    id: string;
    label: string;
    amount: string;
  }>;
};

type EntryFormState = {
  title: string;
  category: string;
  amount: string;
  notes: string;
};

function createDraftId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyIncomeForm(): IncomeFormState {
  return {
    title: "",
    notes: "",
    sources: [{ id: createDraftId(), label: "", amount: "" }],
  };
}

function createIncomeFormFromItem(item: IncomeItem): IncomeFormState {
  return {
    title: item.title,
    notes: item.notes || "",
    sources: item.sources.map((source) => ({
      id: source.id,
      label: source.label,
      amount: String(source.amount),
    })),
  };
}

function createEmptyEntryForm(): EntryFormState {
  return {
    title: "",
    category: "",
    amount: "",
    notes: "",
  };
}

function createEntryFormFromItem(item: BudgetEntry): EntryFormState {
  return {
    title: item.title,
    category: item.category,
    amount: String(item.amount),
    notes: item.notes || "",
  };
}

function formatAmount(value: number): string {
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  return formatPersianNumber(formatted);
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
      : tone === "warn"
        ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
        : "border-white/10 bg-white/5 text-neutral-200";

  return (
    <Card className={`border ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3 text-right">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-sm leading-7 text-neutral-500">{hint}</p>
        </div>
      </div>
    </Card>
  );
}

function SectionIntro({
  title,
  description,
  total,
  icon: Icon,
}: {
  title: string;
  description: string;
  total: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-right">
      <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-end gap-2">
          <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-neutral-400">{total}</span>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className="text-sm leading-7 text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        variant === "danger"
          ? "border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/16"
          : "border border-white/10 bg-black/25 text-neutral-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-5 py-6 text-right">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-neutral-500">{description}</p>
    </div>
  );
}

export default function BudgetWorkspace() {
  const months = useBudgetStore((state) => state.months);
  const selectedMonthKey = useBudgetStore((state) => state.selectedMonthKey);
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const hydrate = useBudgetStore((state) => state.hydrate);
  const setSelectedMonth = useBudgetStore((state) => state.setSelectedMonth);
  const addIncomeItem = useBudgetStore((state) => state.addIncomeItem);
  const updateIncomeItem = useBudgetStore((state) => state.updateIncomeItem);
  const deleteIncomeItem = useBudgetStore((state) => state.deleteIncomeItem);
  const addSavingItem = useBudgetStore((state) => state.addSavingItem);
  const updateSavingItem = useBudgetStore((state) => state.updateSavingItem);
  const deleteSavingItem = useBudgetStore((state) => state.deleteSavingItem);
  const addExpenseItem = useBudgetStore((state) => state.addExpenseItem);
  const updateExpenseItem = useBudgetStore((state) => state.updateExpenseItem);
  const deleteExpenseItem = useBudgetStore((state) => state.deleteExpenseItem);

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [incomeForm, setIncomeForm] = useState<IncomeFormState>(createEmptyIncomeForm);
  const [incomeError, setIncomeError] = useState("");

  const [savingOpen, setSavingOpen] = useState(false);
  const [editingSavingId, setEditingSavingId] = useState<string | null>(null);
  const [savingForm, setSavingForm] = useState<EntryFormState>(createEmptyEntryForm);
  const [savingError, setSavingError] = useState("");

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<EntryFormState>(createEmptyEntryForm);
  const [expenseError, setExpenseError] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const currentMonth = useMemo(
    () => months[selectedMonthKey] ?? createEmptyBudgetMonthRecord(selectedMonthKey),
    [months, selectedMonthKey]
  );

  const summary = useMemo(() => getBudgetMonthSummary(currentMonth), [currentMonth]);

  const incomeItems = useMemo(
    () => [...currentMonth.incomeItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [currentMonth.incomeItems]
  );
  const savingItems = useMemo(
    () => [...currentMonth.savingItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [currentMonth.savingItems]
  );
  const expenseItems = useMemo(
    () => [...currentMonth.expenseItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [currentMonth.expenseItems]
  );

  const incomeSectionTotal = summary.totalIncome;
  const savingSectionTotal = summary.totalSavings;
  const expenseSectionTotal = summary.totalExpenses;

  const monthlyStatus = useMemo(() => {
    if (!summary.hasActivity) {
      return {
        title: "ماه هنوز شروع نشده",
        description: "برای این ماه هنوز ورودی ثبت نکرده‌ای. از درآمد یا خرج‌های ثابت شروع کن تا تصویر ماه شکل بگیرد.",
      };
    }

    if (summary.netBalance < 0) {
      return {
        title: "ماه در وضعیت کسری است",
        description: "مجموع پس‌انداز و مخارج از درآمد بیشتر شده. بهتر است یا هزینه‌ها را سبک‌تر کنی یا منابع درآمد را کامل‌تر ثبت کنی.",
      };
    }

    if (summary.totalSavings === 0 && summary.totalIncome > 0) {
      return {
        title: "درآمد ثبت شده ولی پس‌اندازی نداری",
        description: "اگر حتی یک مبلغ کوچک برای پس‌انداز کنار بگذاری، تصویر واقعی‌تری از تعادل ماه به دست می‌آید.",
      };
    }

    return {
      title: "وضعیت ماه متعادل است",
      description: "ثبت‌ها نشان می‌دهد فعلاً دخل‌وخرج کنترل شده و می‌توانی تمرکزت را روی نظم ثبت ماهانه نگه داری.",
    };
  }, [summary]);

  const currentMonthLabel = useMemo(() => formatBudgetMonthLabel(selectedMonthKey), [selectedMonthKey]);

  function openNewIncomeForm() {
    setEditingIncomeId(null);
    setIncomeForm(createEmptyIncomeForm());
    setIncomeError("");
    setIncomeOpen(true);
  }

  function closeIncomeForm() {
    setEditingIncomeId(null);
    setIncomeForm(createEmptyIncomeForm());
    setIncomeError("");
    setIncomeOpen(false);
  }

  function openEditIncomeForm(item: IncomeItem) {
    setEditingIncomeId(item.id);
    setIncomeForm(createIncomeFormFromItem(item));
    setIncomeError("");
    setIncomeOpen(true);
  }

  function openEntryForm(kind: EntryKind) {
    if (kind === "saving") {
      setEditingSavingId(null);
      setSavingForm(createEmptyEntryForm());
      setSavingError("");
      setSavingOpen(true);
      return;
    }

    setEditingExpenseId(null);
    setExpenseForm(createEmptyEntryForm());
    setExpenseError("");
    setExpenseOpen(true);
  }

  function closeEntryForm(kind: EntryKind) {
    if (kind === "saving") {
      setEditingSavingId(null);
      setSavingForm(createEmptyEntryForm());
      setSavingError("");
      setSavingOpen(false);
      return;
    }

    setEditingExpenseId(null);
    setExpenseForm(createEmptyEntryForm());
    setExpenseError("");
    setExpenseOpen(false);
  }

  function openEditEntryForm(kind: EntryKind, item: BudgetEntry) {
    if (kind === "saving") {
      setEditingSavingId(item.id);
      setSavingForm(createEntryFormFromItem(item));
      setSavingError("");
      setSavingOpen(true);
      return;
    }

    setEditingExpenseId(item.id);
    setExpenseForm(createEntryFormFromItem(item));
    setExpenseError("");
    setExpenseOpen(true);
  }

  function updateIncomeSource(sourceId: string, field: "label" | "amount", value: string) {
    setIncomeForm((current) => ({
      ...current,
      sources: current.sources.map((source) => (source.id === sourceId ? { ...source, [field]: value } : source)),
    }));
  }

  function addIncomeSource() {
    setIncomeForm((current) => ({
      ...current,
      sources: [...current.sources, { id: createDraftId(), label: "", amount: "" }],
    }));
  }

  function removeIncomeSource(sourceId: string) {
    setIncomeForm((current) => ({
      ...current,
      sources: current.sources.length === 1 ? current.sources : current.sources.filter((source) => source.id !== sourceId),
    }));
  }

  function handleIncomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSources = incomeForm.sources
      .map((source) => ({
        label: source.label.trim(),
        amount: normalizeAmount(Number(source.amount)),
      }))
      .filter((source) => source.label && source.amount > 0);

    if (!incomeForm.title.trim()) {
      setIncomeError("عنوان درآمد را وارد کن.");
      return;
    }

    if (nextSources.length === 0) {
      setIncomeError("حداقل یک منبع درآمد با مبلغ معتبر لازم است.");
      return;
    }

    const draft: IncomeItemDraft = {
      title: incomeForm.title,
      notes: incomeForm.notes,
      sources: nextSources,
    };

    if (editingIncomeId) {
      updateIncomeItem(editingIncomeId, draft);
    } else {
      addIncomeItem(draft);
    }

    closeIncomeForm();
  }

  function handleEntrySubmit(kind: EntryKind, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = kind === "saving" ? savingForm : expenseForm;
    const setError = kind === "saving" ? setSavingError : setExpenseError;
    const amount = normalizeAmount(Number(form.amount));

    if (!form.title.trim()) {
      setError("عنوان مورد را وارد کن.");
      return;
    }

    if (amount <= 0) {
      setError("مبلغ معتبر وارد کن.");
      return;
    }

    const draft: BudgetEntryDraft = {
      title: form.title,
      category: form.category,
      amount,
      notes: form.notes,
    };

    if (kind === "saving") {
      if (editingSavingId) {
        updateSavingItem(editingSavingId, draft);
      } else {
        addSavingItem(draft);
      }
    } else if (editingExpenseId) {
      updateExpenseItem(editingExpenseId, draft);
    } else {
      addExpenseItem(draft);
    }

    closeEntryForm(kind);
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_28rem),radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24rem),#050505] p-4 text-white sm:p-6 xl:p-8">
        <Card className="mx-auto max-w-4xl border-white/10 bg-white/4 py-16 text-center">
          <p className="text-lg font-semibold text-white">در حال آماده‌سازی بودجه ماهانه...</p>
          <p className="mt-2 text-sm text-neutral-500">داده‌های ذخیره‌شده مرورگر در حال بارگذاری هستند.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_28rem),radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24rem),#050505] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6 xl:p-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-0">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_280px]">
              <div className="space-y-5 text-right">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-neutral-300">
                  <Wallet className="h-4 w-4" />
                  حساب و کتاب ماهانه با ماه‌های شمسی
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Budget</h1>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(getCurrentBudgetMonthKey())}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                  >
                    این ماه
                  </button>
                  <button
                    type="button"
                    onClick={openNewIncomeForm}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    افزودن درآمد
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[26px] border border-white/10 bg-black/30 p-4 text-right">
                  <p className="text-xs font-medium text-neutral-500">ماه انتخاب‌شده</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{currentMonthLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-400">هر ماه پرونده جدا دارد؛ چیزی که اینجا ثبت می‌کنی فقط به همین ماه مربوط است.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(shiftBudgetMonthKey(selectedMonthKey, 1))}
                    className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      بعدی
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(getCurrentBudgetMonthKey())}
                    className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    امروز
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(shiftBudgetMonthKey(selectedMonthKey, -1))}
                    className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <span className="flex items-center justify-center gap-2">
                      قبلی
                      <ChevronLeft className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/4 text-right">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
                  {summary.netBalance >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">وضعیت کلی ماه</p>
                  <p className="mt-1 text-sm leading-7 text-neutral-500">یک نگاه سریع به تعادل این ماه و رفتار کلی ثبت‌ها.</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs font-medium text-neutral-500">تراز نهایی</p>
                <p className={`mt-2 text-3xl font-semibold ${summary.netBalance >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
                  {summary.netBalance >= 0 ? "+" : "-"}
                  {formatAmount(Math.abs(summary.netBalance))}
                </p>
                <p className="mt-2 text-sm leading-7 text-neutral-400">{monthlyStatus.title}</p>
              </div>
              <div className="space-y-3 text-sm leading-7 text-neutral-400">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">{monthlyStatus.description}</div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  نرخ پس‌انداز این ماه: <span className="text-white">{formatPersianNumber(summary.savingsRate)}٪</span>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  {summary.topExpenseCategory
                    ? `بیشترین فشار هزینه روی دسته ${summary.topExpenseCategory} بوده است.`
                    : "هنوز دسته‌ای برای مخارج ثبت نشده تا بتوان بیشترین هزینه را مشخص کرد."}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  در این ماه <span className="text-white">{formatPersianNumber(summary.entryCount)}</span> مورد ثبت شده است.
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(100, summary.savingsRate))}%` }} />
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="کل درآمد" value={formatAmount(summary.totalIncome)} hint="جمع کل منابع درآمدی این ماه" icon={Landmark} />
          <SummaryCard label="کل پس‌انداز" value={formatAmount(summary.totalSavings)} hint="مبالغی که کنار گذاشته‌ای" icon={PiggyBank} />
          <SummaryCard label="کل مخارج" value={formatAmount(summary.totalExpenses)} hint="هزینه‌های ثبت‌شده این ماه" icon={Receipt} />
          <SummaryCard
            label="تراز نهایی"
            value={`${summary.netBalance >= 0 ? "+" : "-"}${formatAmount(Math.abs(summary.netBalance))}`}
            hint={summary.netBalance >= 0 ? "خروجی ماه هنوز مثبت است" : "الان خرج و پس‌انداز بیشتر از درآمد شده"}
            icon={summary.netBalance >= 0 ? TrendingUp : TrendingDown}
            tone={summary.netBalance >= 0 ? "good" : "warn"}
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-5">
            <Card className="border-white/10 bg-white/4">
              <div className="space-y-5 text-right">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={openNewIncomeForm}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                    >
                      <Plus className="h-4 w-4" />
                      افزودن درآمد
                    </button>
                  </div>
                  <SectionIntro
                    title="درآمدها"
                    description="برای هر درآمد می‌توانی چند منبع جدا تعریف کنی و جمع کل آن را همان‌جا ببینی."
                    total={`جمع ماه: ${formatAmount(incomeSectionTotal)}`}
                    icon={Landmark}
                  />
                </div>

                {incomeOpen && (
                  <form onSubmit={handleIncomeSubmit} className="space-y-4 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ActionButton label="انصراف" onClick={closeIncomeForm} />
                        <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200">
                          {editingIncomeId ? "ذخیره تغییرات" : "ثبت درآمد"}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{editingIncomeId ? "ویرایش درآمد" : "درآمد جدید"}</p>
                        <p className="mt-1 text-xs text-neutral-500">هر ردیف می‌تواند یک منبع جدا برای این درآمد باشد.</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>عنوان درآمد</span>
                        <input
                          type="text"
                          value={incomeForm.title}
                          onChange={(event) => setIncomeForm((current) => ({ ...current, title: event.target.value }))}
                          placeholder="مثلاً حقوق، پروژه، فروش"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>یادداشت</span>
                        <input
                          type="text"
                          value={incomeForm.notes}
                          onChange={(event) => setIncomeForm((current) => ({ ...current, notes: event.target.value }))}
                          placeholder="توضیح کوتاه اختیاری"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={addIncomeSource}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <Plus className="h-4 w-4" />
                          افزودن منبع
                        </button>
                        <p className="text-sm font-medium text-white">منابع درآمد</p>
                      </div>

                      {incomeForm.sources.map((source, index) => (
                        <div key={source.id} className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                          <label className="space-y-2 text-right text-sm text-neutral-300">
                            <span>نام منبع {formatPersianNumber(index + 1)}</span>
                            <input
                              type="text"
                              value={source.label}
                              onChange={(event) => updateIncomeSource(source.id, "label", event.target.value)}
                              placeholder="مثلاً حقوق شرکت، پروژه فریلنس"
                              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                            />
                          </label>
                          <label className="space-y-2 text-right text-sm text-neutral-300">
                            <span>مبلغ</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              value={source.amount}
                              onChange={(event) => updateIncomeSource(source.id, "amount", event.target.value)}
                              placeholder="0"
                              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                            />
                          </label>
                          <div className="flex items-end justify-end">
                            <button
                              type="button"
                              onClick={() => removeIncomeSource(source.id)}
                              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      <p className="text-sm text-neutral-400">{incomeError || "فقط ردیف‌هایی ذخیره می‌شوند که هم عنوان منبع داشته باشند و هم مبلغ معتبر."}</p>
                      <p className="text-sm font-semibold text-white">
                        جمع این درآمد: {formatAmount(incomeForm.sources.reduce((total, source) => total + normalizeAmount(Number(source.amount)), 0))}
                      </p>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {incomeItems.length > 0 ? (
                    incomeItems.map((item) => {
                      const total = sumIncomeSources(item.sources);
                      return (
                        <div key={item.id} className="rounded-[28px] border border-white/10 bg-black/25 p-4 text-right">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-wrap justify-end gap-2">
                              <ActionButton label="ویرایش" onClick={() => openEditIncomeForm(item)} />
                              <ActionButton label="حذف" variant="danger" onClick={() => deleteIncomeItem(item.id)} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                                  جمع: {formatAmount(total)}
                                </span>
                                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                              </div>
                              {item.notes && <p className="text-sm leading-7 text-neutral-400">{item.notes}</p>}
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            {item.sources.map((source) => (
                              <div key={source.id} className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-neutral-300">
                                <span className="text-white">{source.label}</span>
                                <span className="mx-2 text-neutral-500">•</span>
                                <span>{formatAmount(source.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyPanel
                      title="هنوز درآمدی برای این ماه ثبت نشده."
                      description="می‌توانی یک درآمد اصلی بسازی و داخلش چند منبع مختلف مثل حقوق، پروژه یا فروش را جدا وارد کنی."
                    />
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-white/10 bg-white/4">
              <div className="space-y-5 text-right">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEntryForm("saving")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                    >
                      <Plus className="h-4 w-4" />
                      افزودن پس‌انداز
                    </button>
                  </div>
                  <SectionIntro
                    title="پس‌اندازها"
                    description="هر مبلغی که کنار گذاشتی با دلیل یا دسته خودش ثبت کن تا نرخ واقعی پس‌اندازت مشخص باشد."
                    total={`جمع ماه: ${formatAmount(savingSectionTotal)}`}
                    icon={PiggyBank}
                  />
                </div>

                {savingOpen && (
                  <form onSubmit={(event) => handleEntrySubmit("saving", event)} className="space-y-4 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ActionButton label="انصراف" onClick={() => closeEntryForm("saving")} />
                        <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200">
                          {editingSavingId ? "ذخیره تغییرات" : "ثبت پس‌انداز"}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{editingSavingId ? "ویرایش پس‌انداز" : "پس‌انداز جدید"}</p>
                        <p className="mt-1 text-xs text-neutral-500">یک مورد ساده با عنوان، دسته و مبلغ ثبت کن.</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>عنوان</span>
                        <input
                          type="text"
                          value={savingForm.title}
                          onChange={(event) => setSavingForm((current) => ({ ...current, title: event.target.value }))}
                          placeholder="مثلاً صندوق اضطراری"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>دسته یا دلیل</span>
                        <input
                          type="text"
                          value={savingForm.category}
                          onChange={(event) => setSavingForm((current) => ({ ...current, category: event.target.value }))}
                          placeholder="مثلاً سرمایه‌گذاری، هدف کوتاه‌مدت"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>مبلغ</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={savingForm.amount}
                          onChange={(event) => setSavingForm((current) => ({ ...current, amount: event.target.value }))}
                          placeholder="0"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>یادداشت</span>
                        <input
                          type="text"
                          value={savingForm.notes}
                          onChange={(event) => setSavingForm((current) => ({ ...current, notes: event.target.value }))}
                          placeholder="اختیاری"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-neutral-400">
                      {savingError || "پس‌اندازهایی که ثبت می‌کنی مستقیماً در نرخ پس‌انداز و وضعیت کلی ماه اثر می‌گذارند."}
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {savingItems.length > 0 ? (
                    savingItems.map((item) => (
                      <div key={item.id} className="rounded-[28px] border border-white/10 bg-black/25 p-4 text-right">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex flex-wrap justify-end gap-2">
                            <ActionButton label="ویرایش" onClick={() => openEditEntryForm("saving", item)} />
                            <ActionButton label="حذف" variant="danger" onClick={() => deleteSavingItem(item.id)} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                                {formatAmount(item.amount)}
                              </span>
                              <h3 className="text-base font-semibold text-white">{item.title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-neutral-400">
                              {item.category && <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-300">{item.category}</span>}
                              {item.notes && <span>{item.notes}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel
                      title="هنوز پس‌اندازی برای این ماه ثبت نشده."
                      description="اگر قرار است مبلغی را برای سرمایه‌گذاری، صندوق اضطراری یا هدف مشخص کنار بگذاری، همین‌جا ثبتش کن."
                    />
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-white/10 bg-white/4">
              <div className="space-y-5 text-right">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEntryForm("expense")}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                    >
                      <Plus className="h-4 w-4" />
                      افزودن خرج
                    </button>
                  </div>
                  <SectionIntro
                    title="مخارج"
                    description="تمام خرج‌های مهم ماه را با دسته و توضیح کوتاه ثبت کن تا منبع فشار هزینه مشخص شود."
                    total={`جمع ماه: ${formatAmount(expenseSectionTotal)}`}
                    icon={Receipt}
                  />
                </div>

                {expenseOpen && (
                  <form onSubmit={(event) => handleEntrySubmit("expense", event)} className="space-y-4 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ActionButton label="انصراف" onClick={() => closeEntryForm("expense")} />
                        <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200">
                          {editingExpenseId ? "ذخیره تغییرات" : "ثبت خرج"}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{editingExpenseId ? "ویرایش خرج" : "خرج جدید"}</p>
                        <p className="mt-1 text-xs text-neutral-500">هر خرج را با عنوان، دسته و مبلغ جدا وارد کن.</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>عنوان</span>
                        <input
                          type="text"
                          value={expenseForm.title}
                          onChange={(event) => setExpenseForm((current) => ({ ...current, title: event.target.value }))}
                          placeholder="مثلاً اجاره، خرید، قبض"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>دسته</span>
                        <input
                          type="text"
                          value={expenseForm.category}
                          onChange={(event) => setExpenseForm((current) => ({ ...current, category: event.target.value }))}
                          placeholder="مثلاً خانه، رفت‌وآمد، خوراک"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>مبلغ</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={expenseForm.amount}
                          onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
                          placeholder="0"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                      <label className="space-y-2 text-right text-sm text-neutral-300">
                        <span>یادداشت</span>
                        <input
                          type="text"
                          value={expenseForm.notes}
                          onChange={(event) => setExpenseForm((current) => ({ ...current, notes: event.target.value }))}
                          placeholder="اختیاری"
                          className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                        />
                      </label>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-neutral-400">
                      {expenseError || "با دسته‌بندی درست مخارج، تشخیص پرهزینه‌ترین بخش ماه خیلی سریع‌تر می‌شود."}
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {expenseItems.length > 0 ? (
                    expenseItems.map((item) => (
                      <div key={item.id} className="rounded-[28px] border border-white/10 bg-black/25 p-4 text-right">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex flex-wrap justify-end gap-2">
                            <ActionButton label="ویرایش" onClick={() => openEditEntryForm("expense", item)} />
                            <ActionButton label="حذف" variant="danger" onClick={() => deleteExpenseItem(item.id)} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-200">
                                {formatAmount(item.amount)}
                              </span>
                              <h3 className="text-base font-semibold text-white">{item.title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-neutral-400">
                              {item.category && <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-300">{item.category}</span>}
                              {item.notes && <span>{item.notes}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel
                      title="هنوز خرجی برای این ماه ثبت نشده."
                      description="مخارج مهم مثل اجاره، خوراک، رفت‌وآمد یا هر هزینه موردی را ثبت کن تا تراز ماه واقعی شود."
                    />
                  )}
                </div>
              </div>
            </Card>
          </main>

          <aside className="space-y-5">
            <Card className="border-white/10 bg-white/4 text-right">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">مرور سریع ماه</h2>
                  <p className="mt-1 text-sm leading-7 text-neutral-500">خلاصه‌ای از چیزی که برای این ماه ثبت شده است.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm leading-7 text-neutral-300">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  {summary.totalIncome > 0
                    ? `تا اینجا ${formatAmount(summary.totalIncome)} درآمد ثبت شده است.`
                    : "هنوز درآمدی برای این ماه ثبت نکرده‌ای."}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  {summary.totalSavings > 0
                    ? `${formatAmount(summary.totalSavings)} برای پس‌انداز کنار گذاشته‌ای.`
                    : "هنوز موردی در بخش پس‌انداز ثبت نشده است."}
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  {summary.totalExpenses > 0
                    ? `${formatAmount(summary.totalExpenses)} خرج ثبت شده و می‌توانی روند ماه را دقیق‌تر ببینی.`
                    : "هنوز خرجی ثبت نشده است."}
                </div>
              </div>
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
}
