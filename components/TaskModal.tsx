"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, Clock3, FolderKanban, ListChecks, Tags } from "lucide-react";
import Modal from "./Modal";
import Checkbox from "./Checkbox";
import { Task, ChecklistItem } from "@/types";
import { formatPersianNumber, getJalaliDateParts, getJalaliMonthLength, JALALI_MONTHS, jalaliToDateKey, todayKey } from "@/lib/planning";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "done">) => void;
  onDelete?: () => void;
  task?: Task | null;
  taskDefaults?: Partial<Omit<Task, "id" | "done">> | null;
  title: string;
}

interface TaskFormState {
  title: string;
  description: string;
  category: string;
  tags: string;
  date: string;
  time: string;
}

function todayDateKey(): string {
  return todayKey();
}

function getInitialForm(task?: Task | null, taskDefaults?: Partial<Omit<Task, "id" | "done">> | null): TaskFormState {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      category: task.category,
      tags: task.tags.join(", "),
      date: task.date,
      time: task.time || "",
    };
  }

  return {
    title: taskDefaults?.title ?? "",
    description: taskDefaults?.description ?? "",
    category: taskDefaults?.category ?? "",
    tags: taskDefaults?.tags?.join(", ") ?? "",
    date: taskDefaults?.date ?? todayDateKey(),
    time: taskDefaults?.time ?? "",
  };
}

function TaskModalContent({ onClose, onSave, onDelete, task, taskDefaults }: Omit<TaskModalProps, "isOpen" | "title">) {
  const [formData, setFormData] = useState<TaskFormState>(() => getInitialForm(task, taskDefaults));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => (task ? [...task.checklist] : [...(taskDefaults?.checklist ?? [])]));
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const jalaliDate = getJalaliDateParts(formData.date || todayDateKey());
  const yearOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => jalaliDate.year - 3 + index),
    [jalaliDate.year]
  );
  const dayOptions = useMemo(
    () => Array.from({ length: getJalaliMonthLength(jalaliDate.year, jalaliDate.month) }, (_, index) => index + 1),
    [jalaliDate.month, jalaliDate.year]
  );

  const updateJalaliDate = (nextDate: Partial<typeof jalaliDate>) => {
    const nextYear = nextDate.year ?? jalaliDate.year;
    const nextMonth = nextDate.month ?? jalaliDate.month;
    const nextDay = Math.min(nextDate.day ?? jalaliDate.day, getJalaliMonthLength(nextYear, nextMonth));
    setFormData({ ...formData, date: jalaliToDateKey(nextYear, nextMonth, nextDay) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = formData.title.trim();
    if (!title) return;

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      title,
      description: formData.description.trim(),
      category: formData.category.trim(),
      tags: tagsArray,
      date: formData.date,
      time: formData.time || undefined,
      checklist,
    });
    onClose();
  };

  const addChecklistItem = () => {
    const itemText = newChecklistItem.trim();
    if (!itemText) return;

    setChecklist([
      ...checklist,
      {
        id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        text: itemText,
        done: false,
      },
    ]);
    setNewChecklistItem("");
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  return (
    <div dir="rtl" className="space-y-5">
      <div className="rounded-3xl border border-white/8 bg-white/4 p-4 text-right">
        <p className="text-xs font-medium tracking-[0.16em] text-neutral-500">LEARNING SYSTEM</p>
        <p className="mt-2 text-sm leading-7 text-neutral-300">
          برای هر موضوع، هدف، زمان، دسته‌بندی، برچسب و چک‌لیست ثبت کن تا روند یادگیری‌ات دقیق‌تر و قابل پیگیری‌تر شود.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)]">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-end gap-2 text-xs font-medium text-neutral-400">
                عنوان
                <BookOpen className="h-4 w-4" />
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-right text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                placeholder="مثلاً مرور معماری Next.js یا تمرین الگوریتم"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-right text-xs font-medium text-neutral-400">توضیح</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm leading-7 text-right text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                rows={4}
                placeholder="خروجی مورد انتظار، منبع مطالعه یا نتیجه‌ای که باید به آن برسی را بنویس."
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-end gap-2 text-xs font-medium text-neutral-400">
                برچسب‌ها
                <Tags className="h-4 w-4" />
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-right text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                placeholder="react, backend, interview"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-end gap-2 text-xs font-medium text-neutral-400">
                دسته‌بندی
                <FolderKanban className="h-4 w-4" />
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-right text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
                placeholder="فرانت‌اند، بک‌اند، زبان، مصاحبه"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-end gap-2 text-xs font-medium text-neutral-400">
                تاریخ برنامه‌ریزی
                <CalendarDays className="h-4 w-4" />
              </label>
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

            <div>
              <label className="mb-1.5 flex items-center justify-end gap-2 text-xs font-medium text-neutral-400">
                ساعت شروع
                <Clock3 className="h-4 w-4" />
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/6"
                dir="ltr"
              />
            </div>

            <div className="rounded-3xl border border-white/8 bg-black/30 p-4 text-right">
              <p className="text-xs font-medium text-neutral-500">خلاصه آیتم</p>
              <div className="mt-3 space-y-2 text-sm text-neutral-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white">{formData.title.trim() || "عنوان آیتم"}</span>
                  <span className="text-neutral-500">موضوع</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{formData.category.trim() || "بدون دسته"}</span>
                  <span className="text-neutral-500">دسته‌بندی</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span dir="ltr">{formData.time ? formatPersianNumber(formData.time) : "بدون ساعت"}</span>
                  <span className="text-neutral-500">زمان</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{formatPersianNumber(checklist.length)}</span>
                  <span className="text-neutral-500">تعداد مراحل</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/4 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={addChecklistItem}
              className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              افزودن مرحله
            </button>
            <label className="flex items-center justify-end gap-2 text-xs font-medium text-neutral-400">
              چک‌لیست یادگیری
              <ListChecks className="h-4 w-4" />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addChecklistItem}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              ثبت
            </button>
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="مثلاً یک ویدئو ببین، کد بزن، خلاصه‌نویسی کن"
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-right text-white outline-none transition placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/6"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
            />
          </div>

          <div className="mt-4 space-y-2">
            {checklist.length > 0 ? (
              checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-3"
                >
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="rounded-full px-2 py-1 text-xs text-neutral-500 transition hover:bg-white/10 hover:text-white"
                  >
                    حذف
                  </button>
                  <span className={`flex-1 text-sm text-right ${item.done ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                    {item.text}
                  </span>
                  <Checkbox checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-center text-sm text-neutral-500">
                هنوز مرحله‌ای تعریف نشده است.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-2xl border border-rose-500/20 px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 sm:w-auto"
              >
                حذف آیتم
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white sm:flex-none"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 sm:flex-none"
            >
              {task ? "ذخیره تغییرات" : "ثبت آیتم"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task, taskDefaults, title }: TaskModalProps) {
  const formKey = task?.id ?? [taskDefaults?.title ?? "new", taskDefaults?.category ?? "", taskDefaults?.date ?? todayDateKey()].join("::");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <TaskModalContent
        key={formKey}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        task={task}
        taskDefaults={taskDefaults}
      />
    </Modal>
  );
}
