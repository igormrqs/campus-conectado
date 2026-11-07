import { formatCalendarDate, isCalendarDate } from './date';
import type { Task } from './types';

export type TaskFilter = 'all' | 'pending' | 'completed';
export type TaskStats = {
  total: number; pending: number; completed: number;
  overdue: number; percentage: number;
};

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareTasks(a: Task, b: Task): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  const byDate = compareText(a.dueAt, b.dueAt);
  return (a.completed ? -byDate : byDate) ||
    compareText(a.createdAt, b.createdAt) || compareText(a.id, b.id);
}

function disciplineKey(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR');
}

export function getTaskStats(tasks: readonly Task[], today?: string): TaskStats {
  const civilToday = isCalendarDate(today) ? today : formatCalendarDate(new Date());
  const completed = tasks.filter(task => task.completed).length;
  return {
    total: tasks.length,
    pending: tasks.length - completed,
    completed,
    overdue: tasks.filter(task => !task.completed && task.dueAt < civilToday).length,
    percentage: tasks.length ? Math.round(completed / tasks.length * 100) : 0,
  };
}

export function selectFocusTasks(tasks: readonly Task[], today?: string, limit = 3): Task[] {
  // Ascending civil dates naturally group overdue, today, then future tasks.
  const pending = selectFilteredTasks(tasks, 'pending', null, today);
  const count = Number.isNaN(limit) ? 3 : Math.max(0, Math.floor(limit));
  return pending.slice(0, count);
}

export function selectFilteredTasks(tasks: readonly Task[], filter: TaskFilter = 'all', discipline?: string | null, _today?: string): Task[] {
  const key = discipline ? disciplineKey(discipline) : '';
  return tasks.filter(task =>
    (filter === 'all' || task.completed === (filter === 'completed')) &&
    (!key || disciplineKey(task.discipline) === key),
  ).sort(compareTasks);
}

export function getTaskDisciplines(tasks: readonly Task[]): string[] {
  const disciplines = new Map<string, string>();
  for (const task of tasks) {
    const label = task.discipline.trim();
    const key = disciplineKey(label);
    if (key && !disciplines.has(key)) disciplines.set(key, label);
  }
  return [...disciplines.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
