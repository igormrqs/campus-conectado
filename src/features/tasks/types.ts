/** Frozen public contract v1. Dates are local calendar dates, never UTC conversions. */
export type Task = {
  id: string;
  title: string;
  discipline: string;
  description: string;
  dueAt: string; // YYYY-MM-DD (ISO calendar date)
  completed: boolean;
  createdAt: string; // ISO timestamp
};

export type TaskInput = Pick<Task, 'title' | 'discipline' | 'description' | 'dueAt'>;
export type TaskFieldErrors = Partial<Record<keyof TaskInput, string>>;

export type TasksContextValue = {
  tasks: Task[];
  isHydrated: boolean;
  /** Hydration/storage failure, shown by UI with a retry action. */
  error: string | null;
  retryHydration(): Promise<void>;
  addTask(input: TaskInput): Promise<void>;
  updateTask(id: string, patch: Partial<TaskInput>): Promise<void>;
  deleteTask(id: string): Promise<void>;
  toggleTask(id: string): Promise<void>;
  resetDemo(): Promise<void>;
};
