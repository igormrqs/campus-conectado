/**
 * Date utilities for Campus Conectado.
 * Strict compliance with CONTRACTS.md: dueAt is a civil ISO date YYYY-MM-DD.
 * Never converts through toISOString() for display, preventing timezone shifts.
 */

import { formatCalendarDate, isCalendarDate } from '../features/tasks/date';

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

export function formatDatePtBR(iso: string, style: 'short' | 'long' = 'short'): string {
  const parsed = parseCivilDate(iso);
  if (!parsed) return 'Data inválida';
  const { day, month } = parsed;
  const year = iso.slice(0, 4);
  return style === 'long'
    ? `${day} de ${MONTH_NAMES_FULL[month - 1]} de ${year}`
    : `${String(day).padStart(2, '0')} ${MONTH_NAMES_SHORT[month - 1]} ${year}`;
}
export function formatDateInput(iso: string): string {
  if (!isCalendarDate(iso)) return '';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}
export function parseDateInput(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  return isCalendarDate(iso) ? iso : null;
}
export function getDateBlock(iso: string): { day: string; month: string; year: string } {
  const parsed = parseCivilDate(iso);
  if (!parsed) return { day: '—', month: '—', year: '—' };
  return { day: iso.slice(8, 10), month: MONTH_NAMES_SHORT[parsed.month - 1], year: iso.slice(0, 4) };
}

/**
 * Returns today's civil date as YYYY-MM-DD in local time.
 */
export function getTodayDateString(d = new Date()): string {
  return formatCalendarDate(d);
}

/**
 * Parses YYYY-MM-DD into [year, month, day] numbers.
 */
export function parseCivilDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!isCalendarDate(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Adds (or subtracts) days from a YYYY-MM-DD string, returning a new YYYY-MM-DD string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const parsed = parseCivilDate(dateStr);
  if (!parsed || !Number.isInteger(days)) return dateStr;
  // setFullYear avoids Date's implicit 1900 offset for years 0001–0099.
  const date = new Date(0);
  date.setHours(12, 0, 0, 0);
  date.setFullYear(parsed.year, parsed.month - 1, parsed.day);
  date.setDate(date.getDate() + days);
  const result = getTodayDateString(date);
  return isCalendarDate(result) ? result : dateStr;
}

/**
 * Checks if a task is overdue relative to today.
 * Completed tasks are never overdue.
 */
export function isOverdue(dueAt: string, completed: boolean): boolean {
  if (completed) return false;
  if (!isCalendarDate(dueAt)) return false;
  const today = getTodayDateString();
  return dueAt < today;
}

/**
 * Returns a human-friendly relative label or formatted civil date.
 * Examples: "Hoje", "Amanhã", "Ontem (atrasada)", "14 de nov".
 */
export function formatFriendlyDate(dueAt: string, completed = false): string {
  const parsed = parseCivilDate(dueAt);
  if (!parsed) return 'Data inválida';

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
  return isCalendarDate(dateStr);
}
