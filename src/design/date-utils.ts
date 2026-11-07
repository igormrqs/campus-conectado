/**
 * Date utilities for Campus Conectado.
 * Strict compliance with CONTRACTS.md: dueAt is a civil ISO date YYYY-MM-DD.
 * Never converts through toISOString() for display, preventing timezone shifts.
 */

const MONTH_NAMES_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

const MONTH_NAMES_FULL = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const WEEKDAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

/** V2 contract stubs; functional worker supplies strict local-calendar behavior. */
export function formatDatePtBR(_iso: string, _style?: 'short' | 'long'): string {
  throw new Error('V2 localized dates pending implementation');
}
export function formatDateInput(_iso: string): string {
  throw new Error('V2 localized dates pending implementation');
}
export function parseDateInput(_text: string): string | null {
  throw new Error('V2 localized dates pending implementation');
}
export function getDateBlock(_iso: string): { day: string; month: string; year: string } {
  throw new Error('V2 localized dates pending implementation');
}

/**
 * Returns today's civil date as YYYY-MM-DD in local time.
 */
export function getTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into [year, month, day] numbers.
 */
export function parseCivilDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m, day: d };
}

/**
 * Adds (or subtracts) days from a YYYY-MM-DD string, returning a new YYYY-MM-DD string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const parsed = parseCivilDate(dateStr);
  if (!parsed) return dateStr;
  const date = new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
  date.setDate(date.getDate() + days);
  return getTodayDateString(date);
}

/**
 * Checks if a task is overdue relative to today.
 * Completed tasks are never overdue.
 */
export function isOverdue(dueAt: string, completed: boolean): boolean {
  if (completed) return false;
  if (!dueAt) return false;
  const today = getTodayDateString();
  return dueAt < today;
}

/**
 * Returns a human-friendly relative label or formatted civil date.
 * Examples: "Hoje", "Amanhã", "Ontem (atrasada)", "14 de nov".
 */
export function formatFriendlyDate(dueAt: string, completed = false): string {
  const parsed = parseCivilDate(dueAt);
  if (!parsed) return dueAt;

  const today = getTodayDateString();
  const tomorrow = addDaysToDateString(today, 1);
  const yesterday = addDaysToDateString(today, -1);

  if (dueAt === today) return 'Hoje';
  if (dueAt === tomorrow) return 'Amanhã';
  if (dueAt === yesterday) {
    return completed ? 'Ontem' : 'Ontem (atrasada)';
  }

  if (dueAt < today && !completed) {
    const monthShort = MONTH_NAMES_SHORT[parsed.month - 1] || '';
    return `${parsed.day} de ${monthShort} (atrasada)`;
  }

  const monthShort = MONTH_NAMES_SHORT[parsed.month - 1] || '';
  return `${parsed.day} de ${monthShort}`;
}

/**
 * Editorial full header date stamp: "Sábado, 7 de novembro".
 */
export function formatEditorialDate(date = new Date()): string {
  const weekday = WEEKDAY_NAMES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_FULL[date.getMonth()];
  return `${weekday}, ${day} de ${month}`;
}

/**
 * Validates whether string is a valid real calendar date YYYY-MM-DD.
 */
export function isValidDateString(dateStr: string): boolean {
  const parsed = parseCivilDate(dateStr);
  if (!parsed) return false;
  const { year, month, day } = parsed;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day, 12, 0, 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
