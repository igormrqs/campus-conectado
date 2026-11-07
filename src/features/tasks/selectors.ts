import type { Task } from './types';

/** V2 public signatures. Functional worker replaces these contract stubs. */
export type TaskFilter = 'all' | 'pending' | 'completed';
export type TaskStats = {
  total: number; pending: number; completed: number;
  overdue: number; percentage: number;
};
export function getTaskStats(_tasks: readonly Task[], _today?: string): TaskStats {
  throw new Error('V2 task selectors pending implementation');
}
export function selectFocusTasks(_tasks: readonly Task[], _today?: string, _limit?: number): Task[] {
  throw new Error('V2 task selectors pending implementation');
}
export function selectFilteredTasks(_tasks: readonly Task[], _filter?: TaskFilter, _discipline?: string | null, _today?: string): Task[] {
  throw new Error('V2 task selectors pending implementation');
}
export function getTaskDisciplines(_tasks: readonly Task[]): string[] {
  throw new Error('V2 task selectors pending implementation');
}
