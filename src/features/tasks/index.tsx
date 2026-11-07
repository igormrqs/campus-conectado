import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import {
  createTaskRepository,
  type TaskRepository,
  type TasksStoreSnapshot,
} from './repository';
import { appStorage } from './storage';
import type { TasksContextValue, TaskFieldErrors, TaskInput } from './types';
import { validateTaskInput as validateTaskInputFields } from './validation';

export type { Task, TaskInput, TaskFieldErrors, TasksContextValue } from './types';
export { getTaskStats, selectFocusTasks, selectFilteredTasks, getTaskDisciplines } from './selectors';
export type { TaskFilter, TaskStats } from './selectors';
export { useTaskToday } from './use-task-today';

let defaultRepository: TaskRepository | null = null;

/** One repository owns the storage key for the entire app. */
function getDefaultRepository(): TaskRepository {
  if (defaultRepository === null) {
    defaultRepository = createTaskRepository(appStorage);
  }
  return defaultRepository;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: PropsWithChildren) {
  const repository = getDefaultRepository();
  const [snapshot, setSnapshot] = useState<TasksStoreSnapshot>(() =>
    repository.getSnapshot(),
  );

  useEffect(() => {
    setSnapshot(repository.getSnapshot());
    const unsubscribe = repository.subscribe(() => {
      setSnapshot(repository.getSnapshot());
    });

    void repository.hydrate().catch(() => {
      // hydrate() records failures in `error`; the UI exposes retryHydration().
    });

    return unsubscribe;
  }, [repository]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks: snapshot.tasks,
      isHydrated: snapshot.isHydrated,
      error: snapshot.error,
      retryHydration: repository.retryHydration,
      addTask: repository.addTask,
      updateTask: repository.updateTask,
      deleteTask: repository.deleteTask,
      toggleTask: repository.toggleTask,
      resetDemo: repository.resetDemo,
    }),
    [repository, snapshot],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const value = useContext(TasksContext);
  if (value === null) {
    throw new Error('useTasks deve ser usado dentro de <TasksProvider>.');
  }
  return value;
}

/** Frozen contract validator; the implementation lives in validation.ts. */
export function validateTaskInput(input: TaskInput): TaskFieldErrors {
  return validateTaskInputFields(input);
}
