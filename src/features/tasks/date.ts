/**
 * Calendar-date helpers for the frozen data contract.
 *
 * `dueAt` is a civil date (`YYYY-MM-DD`) and must never go through
 * `Date#toISOString()`, which would shift the day in non-UTC time zones.
 */

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/** True only for a syntactically valid, real calendar date in `YYYY-MM-DD`. */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const maxDay =
    month === 2 && isLeapYear(year) ? 29 : DAYS_PER_MONTH[month - 1];
  return day <= maxDay;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Formats a Date using its local calendar fields. */
export function formatCalendarDate(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Returns a new Date shifted by whole local calendar days. */
export function addCalendarDays(date: Date, days: number): Date {
  const shifted = new Date(date.getTime());
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}
