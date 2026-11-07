import type { PropsWithChildren } from 'react';
import type { TasksContextValue, TaskInput, TaskFieldErrors } from './types';
export type { Task, TaskInput, TaskFieldErrors, TasksContextValue } from './types';

/** Skeleton only. Worker A replaces implementation, preserving public exports. */
export function TasksProvider({ children }: PropsWithChildren) { return children; }
export function useTasks(): TasksContextValue {
  throw new Error('TasksProvider implementation pending Worker A');
}
export function validateTaskInput(_input: TaskInput): TaskFieldErrors {
  throw new Error('Validation implementation pending Worker A');
}
