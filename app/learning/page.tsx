"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Filter,
  Layers3,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Card from "@/components/Card";
import TaskModal from "@/components/TaskModal";
import Checkbox from "@/components/Checkbox";
import { fromDateKey, formatDayHeading, formatPersianNumber, todayKey } from "@/lib/planning";
import { useTaskStore } from "@/store/useTaskStore";
import { Task } from "@/types";

type LearningStatus = "overdue" | "today" | "upcoming" | "done";
type StatusFilter = "all" | "focus" | "upcoming" | "completed";
type SortMode = "priority" | "date-asc" | "date-desc";

type LearningTaskDraft = Omit<Task, "id" | "done">;

const statusStyles: Record<LearningStatus, { label: string; badge: string; panel: string }> = {
  overdue: {
    label: "عقب‌افتاده",
    badge: "border border-rose-400/25 bg-rose-500/10 text-rose-200",
    panel: "border-rose-400/18 bg-rose-500/6",
  },
  today: {
    label: "امروز",
    badge: "border border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
    panel: "border-cyan-400/18 bg-cyan-500/6",
  },
  upcoming: {
    label: "پیش‌رو",
    badge: "border border-white/12 bg-white/6 text-neutral-200",
    panel: "border-white/10 bg-white/4",
  },
  done: {
    label: "انجام‌شده",
    badge: "border border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
    panel: "border-emerald-400/18 bg-emerald-500/6",
  },
};

function createChecklist(items: string[]) {
  return items.map((text) => ({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    text,
    done: false,
  }));
}

function getTaskStatus(task: Task, today: string): LearningStatus {
  if (task.done) return "done";
  if (task.date < today) return "overdue";
  if (task.date === today) return "today";
  return "upcoming";
}

function getChecklistStats(task: Task) {
  const total = task.checklist.length;
  const completed = task.checklist.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}

function getTimeValue(time?: string) {
  return time ? Number(time.replace(":", "")) : Number.MAX_SAFE_INTEGER;
}

function compareTasks(a: Task, b: Task, today: string, sortMode: SortMode) {
  const statusRank: Record<LearningStatus, number> = {
    overdue: 0,
    today: 1,
    upcoming: 2,
    done: 3,
  };

  if (sortMode === "priority") {
    const statusDelta = statusRank[getTaskStatus(a, today)] - statusRank[getTaskStatus(b, today)];
    if (statusDelta !== 0) return statusDelta;

    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const timeDelta = getTimeValue(a.time) - getTimeValue(b.time);
    if (timeDelta !== 0) return timeDelta;
    return a.title.localeCompare(b.title, "fa");
  }

  if (sortMode === "date-desc") {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return getTimeValue(a.time) - getTimeValue(b.time);
  }

  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return getTimeValue(a.time) - getTimeValue(b.time);
}

function formatTaskTime(time?: string) {
  return time ? formatPersianNumber(time) : "بدون ساعت";
}

function isInNextSevenDays(date: string, today: string) {
  const diff = fromDateKey(date).getTime() - fromDateKey(today).getTime();
  const diffInDays = Math.round(diff / 86_400_000);
  return diffInDays >= 0 && diffInDays <= 6;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="border-white/10 bg-white/4">
      <div className="flex items-start justify-between gap-3 text-right">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-neutral-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-sm text-neutral-500">{hint}</p>
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({
  title,
  description,
  count,
  icon: Icon,
}: {
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4 text-right">
      <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-end gap-2">
          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs text-neutral-400">
            {formatPersianNumber(count)} مورد
          </span>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className="text-sm leading-7 text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

function EmptySection({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-5 py-7 text-right">
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      <p className="mt-2 text-sm leading-7 text-neutral-500">{description}</p>
    </div>
  );
}

function LearningTaskCard({
  task,
  today,
  onEdit,
  onToggleDone,
  onSelectCategory,
}: {
  task: Task;
  today: string;
  onEdit: (task: Task) => void;
  onToggleDone: (taskId: string) => void;
  onSelectCategory: (category: string) => void;
}) {
  const status = getTaskStatus(task, today);
  const checklist = getChecklistStats(task);
  const style = statusStyles[status];
  const previewChecklist = task.checklist.slice(0, 3);

  return (
    <Card className={`overflow-hidden border transition duration-200 hover:border-white/20 hover:bg-white/6 ${style.panel}`}>
      <div className="space-y-4 text-right">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {task.time && (
                <span dir="ltr" className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-neutral-300">
                  {formatTaskTime(task.time)}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}>{style.label}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-400 transition hover:bg-white/10 hover:text-white"
                >
                  ویرایش
                </button>
                <div className="space-y-1">
                  <h3 className={`text-lg font-semibold ${task.done ? "text-neutral-500 line-through" : "text-white"}`}>
                    {task.title}
                  </h3>
                  {task.description && <p className="text-sm leading-7 text-neutral-400">{task.description}</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-neutral-500">
                <span>{formatDayHeading(task.date)}</span>
                {task.category && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(task.category)}
                    className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {task.category}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-1">
            <Checkbox checked={task.done} onChange={() => onToggleDone(task.id)} />
          </div>
        </div>

        {checklist.total > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-neutral-400">
                {formatPersianNumber(checklist.completed)} / {formatPersianNumber(checklist.total)} مرحله
              </span>
              <span className="text-neutral-500">پیشرفت چک‌لیست</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-white" style={{ width: `${checklist.percent}%` }} />
            </div>
          </div>
        )}

        {(previewChecklist.length > 0 || task.tags.length > 0) && (
          <div className="space-y-3">
            {previewChecklist.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2">
                {previewChecklist.map((item) => (
                  <span
                    key={item.id}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      item.done ? "bg-white/8 text-neutral-500 line-through" : "bg-black/25 text-neutral-300"
                    }`}
                  >
                    {item.text}
                  </span>
                ))}
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2">
                {task.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-xs text-neutral-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function LearningPage() {
  const { learningTasks, loadFromStorage, addTask, updateTask, deleteTask, toggleTaskDone } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaults, setTaskDefaults] = useState<Partial<LearningTaskDraft> | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const today = todayKey();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const categories = useMemo(
    () => Array.from(new Set(learningTasks.map((task) => task.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa")),
    [learningTasks]
  );

  const stats = useMemo(() => {
    const total = learningTasks.length;
    const completed = learningTasks.filter((task) => task.done).length;
    const focusCount = learningTasks.filter((task) => {
      const status = getTaskStatus(task, today);
      return status === "overdue" || status === "today";
    }).length;
    const upcoming = learningTasks.filter((task) => getTaskStatus(task, today) === "upcoming").length;
    const thisWeek = learningTasks.filter((task) => isInNextSevenDays(task.date, today)).length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, focusCount, upcoming, thisWeek, completionRate };
  }, [learningTasks, today]);

  const focusTask = useMemo(() => {
    return [...learningTasks]
      .filter((task) => !task.done)
      .sort((a, b) => compareTasks(a, b, today, "priority"))[0] ?? null;
  }, [learningTasks, today]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...learningTasks]
      .filter((task) => {
        const status = getTaskStatus(task, today);
        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "focus"
              ? status === "today" || status === "overdue"
              : statusFilter === "upcoming"
                ? status === "upcoming"
                : status === "done";

        const matchesCategory = categoryFilter === "all" ? true : task.category === categoryFilter;

        const searchable = `${task.title} ${task.description} ${task.category} ${task.tags.join(" ")}`.toLowerCase();
        const matchesSearch = query ? searchable.includes(query) : true;

        return matchesStatus && matchesCategory && matchesSearch;
      })
      .sort((a, b) => compareTasks(a, b, today, sortMode));
  }, [learningTasks, today, search, statusFilter, categoryFilter, sortMode]);

  const focusTasks = useMemo(
    () => filteredTasks.filter((task) => {
      const status = getTaskStatus(task, today);
      return status === "today" || status === "overdue";
    }),
    [filteredTasks, today]
  );
  const upcomingTasks = useMemo(
    () => filteredTasks.filter((task) => getTaskStatus(task, today) === "upcoming"),
    [filteredTasks, today]
  );
  const completedTasks = useMemo(
    () => filteredTasks.filter((task) => getTaskStatus(task, today) === "done"),
    [filteredTasks, today]
  );

  const insightItems = useMemo(() => {
    const items: string[] = [];

    if (focusTasks.some((task) => getTaskStatus(task, today) === "overdue")) {
      items.push("اول از همه آیتم‌های عقب‌افتاده را جمع کن تا برنامه یادگیریت دوباره روی ریل بیفتد.");
    }

    if (stats.completionRate >= 70 && stats.total > 0) {
      items.push("نرخ انجام فعلی خوب است؛ می‌توانی روی آیتم‌های عمیق‌تر و تمرینی‌تر تمرکز کنی.");
    }

    if (stats.thisWeek < 3) {
      items.push("برای هفت روز آینده چند جلسه کوتاه مرور یا تمرین اضافه کن تا پیوستگی حفظ شود.");
    }

    if (categories.length >= 3) {
      items.push("تنوع موضوعی خوبی داری؛ فقط مراقب باش تعداد موضوعات همزمان بیش از حد نشود.");
    }

    if (items.length === 0) {
      items.push("سیستم یادگیری مرتب است؛ کافی است هر آیتم را با خروجی روشن و چک‌لیست مشخص نگه داری.");
    }

    return items.slice(0, 3);
  }, [focusTasks, stats, categories, today]);

  const templates = useMemo(
    () => [
      {
        name: "مطالعه عمیق",
        description: "مطالعه + یادداشت‌برداری + یک تمرین کوچک",
        draft: {
          title: "مطالعه عمیق یک موضوع",
          description: "روی یک موضوع متمرکز شو، نکات کلیدی را استخراج کن و در پایان یک خروجی کوتاه ثبت کن.",
          category: "یادگیری عمیق",
          tags: ["study", "focus"],
          date: today,
          checklist: createChecklist(["منبع اصلی را مرور کن", "نکات کلیدی را خلاصه کن", "یک مثال یا تمرین اجرا کن"]),
        } satisfies LearningTaskDraft,
      },
      {
        name: "تمرین عملی",
        description: "از یادگیری مستقیم به اجرای واقعی برس",
        draft: {
          title: "تمرین عملی و پیاده‌سازی",
          description: "یک مسئله واقعی یا نمونه کوچک انتخاب کن و آموخته‌ها را در کد یا پروژه اجرا کن.",
          category: "تمرین",
          tags: ["practice", "build"],
          date: today,
          checklist: createChecklist(["هدف تمرین را مشخص کن", "پیاده‌سازی را انجام بده", "نتیجه را مرور و اصلاح کن"]),
        } satisfies LearningTaskDraft,
      },
      {
        name: "مرور و تثبیت",
        description: "برای جلوگیری از فراموشی و جمع‌بندی سریع",
        draft: {
          title: "مرور و تثبیت یادگیری",
          description: "مطالب قبلی را مرور کن و فاصله‌های دانشی را پیدا کن تا دوباره روی آن‌ها کار شود.",
          category: "مرور",
          tags: ["review", "retention"],
          date: today,
          checklist: createChecklist(["یادداشت‌ها را مرور کن", "نکات فراموش‌شده را علامت بزن", "یک جمع‌بندی کوتاه بنویس"]),
        } satisfies LearningTaskDraft,
      },
    ],
    [today]
  );

  const handleAdd = (task: LearningTaskDraft) => {
    addTask(task);
  };

  const handleEdit = (task: LearningTaskDraft) => {
    if (editingTask) updateTask(editingTask.id, task);
  };

  const handleDelete = () => {
    if (!editingTask) return;
    deleteTask(editingTask.id);
    closeModal();
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTaskDefaults(null);
    setModalOpen(true);
  };

  const openTemplateModal = (draft: LearningTaskDraft) => {
    setEditingTask(null);
    setTaskDefaults(draft);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskDefaults(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setTaskDefaults(null);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28rem),radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_24rem),#050505] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6 xl:p-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-0">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.15fr)_260px]">
              <div className="space-y-5 text-right">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-neutral-300">
                  <Sparkles className="h-4 w-4" />
                  فضای حرفه‌ای برنامه‌ریزی یادگیری
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Learning Workspace</h1>
                  <p className="max-w-2xl text-sm leading-8 text-neutral-300 sm:text-base">
                    این صفحه برای مدیریت یادگیری به یک داشبورد واقعی تبدیل شده: تمرکز امروز، صف موضوعات بعدی، پیشرفت چک‌لیست‌ها،
                    جستجو، فیلتر، قالب‌های آماده و دید سریع روی وضعیت کلی.
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                  >
                    <Plus className="h-4 w-4" />
                    افزودن آیتم جدید
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("focus")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Target className="h-4 w-4" />
                    نمایش تمرکز امروز
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[26px] border border-white/10 bg-black/30 p-4 text-right">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-3 text-cyan-200">
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500">فوکوس بعدی</p>
                      {focusTask ? (
                        <>
                          <p className="text-sm font-semibold text-white">{focusTask.title}</p>
                          <p className="text-xs text-neutral-400">{formatDayHeading(focusTask.date)}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-white">همه‌چیز مرتب است</p>
                          <p className="text-xs text-neutral-400">برای ادامه، یک آیتم تازه تعریف کن.</p>
                        </>
                      )}
                    </div>
                  </div>
                  {focusTask && (
                    <button
                      type="button"
                      onClick={() => openEditModal(focusTask)}
                      className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                    >
                      باز کردن آیتم
                    </button>
                  )}
                </div>

                <div className="rounded-[26px] border border-white/10 bg-black/30 p-4 text-right">
                  <p className="text-xs font-medium text-neutral-500">سلامت مسیر یادگیری</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{formatPersianNumber(stats.completionRate)}٪</p>
                  <p className="mt-2 text-sm leading-7 text-neutral-400">نرخ انجام فعلی از کل آیتم‌های ثبت‌شده بر اساس وضعیت انجام‌شده‌ها.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/4 text-right">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-neutral-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">چه چیزهایی این صفحه را کاربردی‌تر کرده؟</p>
                  <p className="mt-1 text-sm leading-7 text-neutral-500">فیلتر وضعیت، جستجوی سریع، قالب آماده، گروه‌بندی هوشمند و پیشرفت مرحله‌ای.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm leading-7 text-neutral-400">
                <p>• آیتم‌های امروز و عقب‌افتاده جدا شده‌اند تا سریع‌تر روی مهم‌ترین‌ها تمرکز کنی.</p>
                <p>• برای ساخت آیتم‌های تکرارشونده، قالب‌های آماده در دسترس است.</p>
                <p>• هر کارت حالا وضعیت، زمان، تاریخ، دسته‌بندی، برچسب و درصد پیشرفت را یکجا نشان می‌دهد.</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="کل آیتم‌ها"
            value={formatPersianNumber(stats.total)}
            hint="همه موضوعات ثبت‌شده"
            icon={BookOpen}
          />
          <StatCard
            label="تمرکز فوری"
            value={formatPersianNumber(stats.focusCount)}
            hint="امروز یا عقب‌افتاده"
            icon={CircleDashed}
          />
          <StatCard
            label="انجام‌شده‌ها"
            value={formatPersianNumber(stats.completed)}
            hint="آیتم‌های بسته‌شده"
            icon={CheckCircle2}
          />
          <StatCard
            label="هفته جاری"
            value={formatPersianNumber(stats.thisWeek)}
            hint="جلسه‌های برنامه‌ریزی‌شده"
            icon={CalendarDays}
          />
        </section>

        <Card className="border-white/10 bg-white/4">
          <div className="space-y-4 text-right">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:min-w-[360px] xl:flex-1">
                <div className="relative">
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو در عنوان، توضیح، دسته‌بندی یا برچسب‌ها"
                    className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pr-11 pl-4 text-sm text-right text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setSortMode("priority");
                    setCategoryFilter("all");
                  }}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  پاک‌سازی فیلترها
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-neutral-500">
                <span>{formatPersianNumber(filteredTasks.length)} نتیجه</span>
                <Filter className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap justify-end gap-2">
                {[
                  { key: "all", label: "همه" },
                  { key: "focus", label: "تمرکز امروز" },
                  { key: "upcoming", label: "پیش‌رو" },
                  { key: "completed", label: "انجام‌شده" },
                ].map((option) => {
                  const active = statusFilter === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setStatusFilter(option.key as StatusFilter)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-white text-black"
                          : "border border-white/10 bg-black/20 text-neutral-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                {[
                  { key: "priority", label: "اولویت هوشمند" },
                  { key: "date-asc", label: "قدیمی‌ترها اول" },
                  { key: "date-desc", label: "جدیدترها اول" },
                ].map((option) => {
                  const active = sortMode === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSortMode(option.key as SortMode)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        active
                          ? "border border-cyan-400/30 bg-cyan-500/12 text-cyan-100"
                          : "border border-white/10 bg-black/20 text-neutral-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      categoryFilter === "all"
                        ? "border border-violet-400/30 bg-violet-500/12 text-violet-100"
                        : "border border-white/10 bg-black/20 text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    همه دسته‌ها
                  </button>
                  {categories.map((category) => {
                    const active = categoryFilter === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setCategoryFilter(category)}
                        className={`rounded-full px-3 py-1.5 text-sm transition ${
                          active
                            ? "border border-violet-400/30 bg-violet-500/12 text-violet-100"
                            : "border border-white/10 bg-black/20 text-neutral-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-5">
            {filteredTasks.length === 0 ? (
              <Card className="border-dashed border-white/10 bg-white/4 py-12 text-center">
                <div className="mx-auto max-w-md space-y-3 text-right">
                  <p className="text-lg font-semibold text-white">برای این فیلتر نتیجه‌ای پیدا نشد.</p>
                  <p className="text-sm leading-7 text-neutral-500">
                    فیلترها را سبک‌تر کن یا یک آیتم جدید بساز تا مسیر یادگیری‌ات دوباره فعال شود.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {(statusFilter === "all" || statusFilter === "focus") && (
                  <Card className="border-white/10 bg-white/4">
                    <SectionHeader
                      title="فوکوس امروز"
                      description="مهم‌ترین آیتم‌هایی که باید همین حالا روی آن‌ها تمرکز کنی."
                      count={focusTasks.length}
                      icon={Target}
                    />
                    <div className="space-y-3">
                      {focusTasks.length > 0 ? (
                        focusTasks.map((task) => (
                          <LearningTaskCard
                            key={task.id}
                            task={task}
                            today={today}
                            onEdit={openEditModal}
                            onToggleDone={toggleTaskDone}
                            onSelectCategory={setCategoryFilter}
                          />
                        ))
                      ) : (
                        <EmptySection
                          title="برای امروز مورد فوری نداری."
                          description="این یعنی یا همه‌چیز مرتب است یا بهتر است برای امروز یک جلسه یادگیری کوتاه تعریف کنی."
                        />
                      )}
                    </div>
                  </Card>
                )}

                {(statusFilter === "all" || statusFilter === "upcoming") && (
                  <Card className="border-white/10 bg-white/4">
                    <SectionHeader
                      title="صف موضوعات بعدی"
                      description="آیتم‌هایی که برای روزهای آینده برنامه‌ریزی شده‌اند و منتظر اجرا هستند."
                      count={upcomingTasks.length}
                      icon={Clock3}
                    />
                    <div className="space-y-3">
                      {upcomingTasks.length > 0 ? (
                        upcomingTasks.map((task) => (
                          <LearningTaskCard
                            key={task.id}
                            task={task}
                            today={today}
                            onEdit={openEditModal}
                            onToggleDone={toggleTaskDone}
                            onSelectCategory={setCategoryFilter}
                          />
                        ))
                      ) : (
                        <EmptySection
                          title="صف آینده خالی است."
                          description="چند موضوع برای روزهای بعدی ثبت کن تا یادگیریت فقط به امروز وابسته نباشد."
                        />
                      )}
                    </div>
                  </Card>
                )}

                {(statusFilter === "all" || statusFilter === "completed") && (
                  <Card className="border-white/10 bg-white/4">
                    <SectionHeader
                      title="آرشیو انجام‌شده‌ها"
                      description="مروری سریع روی آیتم‌هایی که بسته شده‌اند تا حس پیشرفت حفظ شود."
                      count={completedTasks.length}
                      icon={CheckCircle2}
                    />
                    <div className="space-y-3">
                      {completedTasks.length > 0 ? (
                        completedTasks.map((task) => (
                          <LearningTaskCard
                            key={task.id}
                            task={task}
                            today={today}
                            onEdit={openEditModal}
                            onToggleDone={toggleTaskDone}
                            onSelectCategory={setCategoryFilter}
                          />
                        ))
                      ) : (
                        <EmptySection
                          title="هنوز آیتم انجام‌شده‌ای نداری."
                          description="وقتی اولین آیتم را کامل کنی، آرشیو اینجا شکل می‌گیرد و دید خوبی از پیشرفت می‌دهد."
                        />
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}
          </main>

          <aside className="space-y-5">
            <Card className="border-white/10 bg-white/4 text-right">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">قالب‌های آماده</h2>
                  <p className="mt-1 text-sm leading-7 text-neutral-500">برای ساخت سریع‌تر آیتم‌های حرفه‌ای یادگیری.</p>
                </div>
              </div>
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => openTemplateModal(template.draft)}
                    className="w-full rounded-3xl border border-white/10 bg-black/25 p-4 text-right transition hover:border-white/20 hover:bg-white/6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Plus className="mt-1 h-4 w-4 text-neutral-500" />
                      <div>
                        <p className="text-sm font-semibold text-white">{template.name}</p>
                        <p className="mt-1 text-sm leading-7 text-neutral-500">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border-white/10 bg-white/4 text-right">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">پیشنهادهای بهبود</h2>
                  <p className="mt-1 text-sm leading-7 text-neutral-500">بر اساس وضعیت فعلی صفحه و آیتم‌ها.</p>
                </div>
              </div>
              <div className="space-y-3">
                {insightItems.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3 text-sm leading-7 text-neutral-300">
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-white/10 bg-white/4 text-right">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-neutral-300">
                  <PencilLine className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">چرا این نسخه کارآمدتر است؟</h2>
                  <p className="mt-1 text-sm leading-7 text-neutral-500">تمرکز بیشتر و اصطکاک کمتر برای مدیریت مسیر یادگیری.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm leading-7 text-neutral-400">
                <p>• آیتم‌ها فقط لیست نشده‌اند؛ حالا بر اساس اولویت و زمان دسته‌بندی می‌شوند.</p>
                <p>• ثبت آیتم جدید سریع‌تر شده و می‌توانی از قالب‌های آماده شروع کنی.</p>
                <p>• چک‌لیست هر موضوع، درصد پیشرفت واقعی را جلوی چشم نگه می‌دارد.</p>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={editingTask ? handleEdit : handleAdd}
        onDelete={editingTask ? handleDelete : undefined}
        task={editingTask}
        taskDefaults={taskDefaults}
        title={editingTask ? "ویرایش آیتم یادگیری" : "ایجاد آیتم یادگیری"}
      />
    </div>
  );
}
