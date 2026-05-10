import type { PlanningTask } from "@/types/planning";

export interface JalaliDateParts {
  year: number;
  month: number;
  day: number;
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const JALALI_MONTHS_SHORT = ["فرو", "ارد", "خرد", "تیر", "مرد", "شهر", "مهر", "آبا", "آذر", "دی", "بهم", "اسف"];
export const PERSIAN_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const PERSIAN_WEEKDAYS_BY_JS_DAY = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function formatPersianNumber(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function div(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}

function gregorianToJalali(gregorianYear: number, gregorianMonth: number, gregorianDay: number): JalaliDateParts {
  const gregorianDayOfMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy = gregorianYear;
  let jy = 0;

  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    gy -= 621;
  }

  const gy2 = gregorianMonth > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gregorianDay +
    gregorianDayOfMonth[gregorianMonth - 1];

  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  const month = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const day = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return { year: jy, month, day };
}

function jalaliToGregorian(jalaliYear: number, jalaliMonth: number, jalaliDay: number) {
  let jy = jalaliYear;
  let gy = 0;

  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }

  let days =
    365 * jy +
    div(jy, 33) * 8 +
    div((jy % 33) + 3, 4) +
    78 +
    jalaliDay +
    (jalaliMonth < 7 ? (jalaliMonth - 1) * 31 : (jalaliMonth - 7) * 30 + 186);

  gy += 400 * div(days, 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days += 1;
  }

  gy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const monthDays = [0, 31, isGregorianLeapYear(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;

  while (gm <= 12 && gd > monthDays[gm]) {
    gd -= monthDays[gm];
    gm += 1;
  }

  return { year: gy, month: gm, day: gd };
}

function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysBetween(startDateKey: string, endDateKey: string): number {
  const start = fromDateKey(startDateKey);
  const end = fromDateKey(endDateKey);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const fallback = new Date();
  return new Date(year || fallback.getFullYear(), (month || fallback.getMonth() + 1) - 1, day || fallback.getDate());
}

export function jalaliToDateKey(year: number, month: number, day: number): string {
  const gregorian = jalaliToGregorian(year, month, day);
  return toDateKey(new Date(gregorian.year, gregorian.month - 1, gregorian.day));
}

export function getJalaliDateParts(dateKey: string): JalaliDateParts {
  const date = fromDateKey(dateKey);
  return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function getJalaliMonthLength(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return daysBetween(jalaliToDateKey(year, 1, 1), jalaliToDateKey(year + 1, 1, 1)) === 366 ? 30 : 29;
}

export function addJalaliMonths(year: number, month: number, amount: number): JalaliDateParts {
  const totalMonths = year * 12 + month - 1 + amount;
  const nextYear = div(totalMonths, 12);
  const nextMonth = ((totalMonths % 12) + 12) % 12 + 1;

  return { year: nextYear, month: nextMonth, day: 1 };
}

export function addDays(dateKey: string, amount: number): string {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function getWeekDays(dateKey: string): string[] {
  const selected = fromDateKey(dateKey);
  const saturdayOffset = -((selected.getDay() + 1) % 7);
  const saturday = new Date(selected);
  saturday.setDate(selected.getDate() + saturdayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(saturday);
    date.setDate(saturday.getDate() + index);
    return toDateKey(date);
  });
}

export function getMonthGrid(year: number, month: number) {
  const firstDayKey = jalaliToDateKey(year, month, 1);
  const firstDay = fromDateKey(firstDayKey);
  const gridStart = addDays(firstDayKey, -((firstDay.getDay() + 1) % 7));

  return Array.from({ length: 42 }, (_, index) => {
    const dateKey = addDays(gridStart, index);
    const parts = getJalaliDateParts(dateKey);

    return {
      dateKey,
      dayNumber: parts.day,
      isCurrentMonth: parts.year === year && parts.month === month,
    };
  });
}

export function formatDayHeading(dateKey: string): string {
  const parts = getJalaliDateParts(dateKey);
  return `${formatWeekday(dateKey)}، ${formatPersianNumber(parts.day)} ${JALALI_MONTHS[parts.month - 1]} ${formatPersianNumber(parts.year)}`;
}

export function formatShortDate(dateKey: string): string {
  const parts = getJalaliDateParts(dateKey);
  return `${formatPersianNumber(parts.day)} ${JALALI_MONTHS_SHORT[parts.month - 1]}`;
}

export function formatMonthHeading(year: number, month: number): string {
  return `${JALALI_MONTHS[month - 1]} ${formatPersianNumber(year)}`;
}

export function formatWeekday(dateKey: string): string {
  return PERSIAN_WEEKDAYS_BY_JS_DAY[fromDateKey(dateKey).getDay()];
}

export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (startTime && endTime) return formatPersianNumber(`${startTime}–${endTime}`);
  if (startTime) return formatPersianNumber(startTime);
  return "بدون زمان";
}

export function timeToMinutes(time?: string): number | null {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime((timeToMinutes(time) ?? 0) + minutes);
}

export function normalizeTaskTimes(startTime?: string, endTime?: string): [string | undefined, string | undefined] {
  const start = startTime || undefined;
  const end = endTime || undefined;
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (!start) return [undefined, undefined];
  if (!end || endMinutes === null || (startMinutes !== null && endMinutes <= startMinutes)) {
    return [start, addMinutesToTime(start, 60)];
  }

  return [start, end];
}

export function comparePlanningTasks(a: PlanningTask, b: PlanningTask): number {
  const aMinutes = timeToMinutes(a.startTime) ?? Number.MAX_SAFE_INTEGER;
  const bMinutes = timeToMinutes(b.startTime) ?? Number.MAX_SAFE_INTEGER;

  if (aMinutes !== bMinutes) return aMinutes - bMinutes;
  return a.createdAt.localeCompare(b.createdAt);
}
