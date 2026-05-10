"use client";

import { addDays, formatShortDate, formatWeekday, getWeekDays, todayKey } from "@/lib/planning";

interface DaySelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function DaySelector({ selectedDate, onSelectDate }: DaySelectorProps) {
  const days = getWeekDays(selectedDate);
  const today = todayKey();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/3 p-3" dir="rtl">
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const selected = date === selectedDate;
          const current = date === today;

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`rounded-2xl border px-2 py-3 text-center transition ${
                selected
                  ? "border-white bg-white text-black shadow-lg shadow-white/10"
                  : "border-white/10 bg-black/20 text-neutral-400 hover:border-white/20 hover:bg-white/6 hover:text-white"
              }`}
            >
              <span className="block text-[11px] font-medium tracking-wide">{formatWeekday(date)}</span>
              <span className="mt-1 block text-sm font-semibold">{formatShortDate(date)}</span>
              {current && <span className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${selected ? "bg-black" : "bg-white"}`} />}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <button type="button" onClick={() => onSelectDate(addDays(selectedDate, -7))} className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white">
          هفته قبل
        </button>
        <button type="button" onClick={() => onSelectDate(addDays(selectedDate, 7))} className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white">
          هفته بعد
        </button>
      </div>
    </section>
  );
}
