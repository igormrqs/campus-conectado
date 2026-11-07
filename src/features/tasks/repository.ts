import { createSeed } from './seed';
import {
  TaskDataError,
  ResetNotAllowedError,
  TaskNotFoundError,
  TaskStorageError,
  TaskStorageUnavailableError,
  TaskValidationError,
} from './errors';
import {
  TASKS_STORAGE_KEY,
  decodeTasks,
  encodeTasks,
} from './persistedTasks';
import type { Task, TaskInput } from './types';
import {
  hasFieldErrors,
  normalizeTaskInput,
  validateTaskInput,
} from './validation';

/** Minimal surface used by the repository; backed by expo-sqlite/kv-store in the app. */
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export type TaskRepositoryOptions = {
  now?: () => Date;
  createId?: () => string;
  isDevelopment?: () => boolean;
  storageKey?: string;
};

export type TasksStoreSnapshot = {
  tasks: Task[];
  isHydrated: boolean;
  error: string | null;
};

declare const __DEV__: boolean | undefined;

let fallbackIdCounter = 0;

function defaultCreateId(): string {
  const cryptoObject = (
    globalThis as {
      crypto?: { randomUUID?: () => string };
    }
  ).crypto;

  if (cryptoObject && typeof cryptoObject.randomUUID === 'function') {
    return cryptoObject.randomUUID();
  }

  fallbackIdCounter += 1;
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `task-${time}-${fallbackIdCounter.toString(36)}-${random}`;
}

function defaultIsDevelopment(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__ === true;
}

function readableError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Não foi possível acessar os dados locais.';
}

function assertValidInput(input: TaskInput): void {
  const errors = validateTaskInput(input);
  if (hasFieldErrors(errors)) throw new TaskValidationError(errors);
}

/**
 * Owns the in-memory collection and the single storage key.
 *
 * Every operation is appended to one promise chain. That makes concurrent
 * create/update/toggle calls read-modify-write against the latest committed
 * collection instead of racing and losing an update.
 */
export class TaskRepository {
  private readonly storage: KeyValueStore;
  private readonly storageKey: string;
  private readonly now: () => Date;
  private readonly createId: () => string;
  private readonly isDevelopment: () => boolean;

  private tasks: Task[] = [];
  private hydrated = false;
  private error: string | null = null;
  private snapshot: TasksStoreSnapshot = {
    tasks: [],
    isHydrated: false,
    error: null,
  };

  private readonly listeners = new Set<() => void>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(storage: KeyValueStore, options: TaskRepositoryOptions = {}) {
    this.storage = storage;
    this.storageKey = options.storageKey ?? TASKS_STORAGE_KEY;
    this.now = options.now ?? (() => new Date());
    this.createId = options.createId ?? defaultCreateId;
    this.isDevelopment = options.isDevelopment ?? defaultIsDevelopment;
  }

  getSnapshot = (): TasksStoreSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** First hydration seeds only when the key is absent. Empty arrays are valid. */
  hydrate = (force = false): Promise<void> => {
    return this.enqueue(() => this.hydrateLocked(force));
  };

  retryHydration = (): Promise<void> => this.hydrate(true);

  addTask = (input: TaskInput): Promise<void> => {
    return this.enqueue(async () => {
      await this.ensureReadyForMutation();

      const normalized = normalizeTaskInput(input);
      assertValidInput(normalized);

      const task: Task = {
        id: this.nextId(),
        ...normalized,
        completed: false,
        createdAt: this.now().toISOString(),
      };
      const next = [...this.tasks, task];
      await this.persist(next);
      this.tasks = next;
      this.emit();
    });
  };

  updateTask = (id: string, patch: Partial<TaskInput>): Promise<void> => {
    return this.enqueue(async () => {
      await this.ensureReadyForMutation();

      const index = this.tasks.findIndex((task) => task.id === id);
      if (index === -1) throw new TaskNotFoundError(id);

      const current = this.tasks[index];
      const normalized = normalizeTaskInput({
        title: patch?.title ?? current.title,
        discipline: patch?.discipline ?? current.discipline,
        description: patch?.description ?? current.description,
        dueAt: patch?.dueAt ?? current.dueAt,
      });
      assertValidInput(normalized);

      const updated: Task = { ...current, ...normalized };
      const next = this.tasks.slice();
      next[index] = updated;
      await this.persist(next);
      this.tasks = next;
      this.emit();
    });
  };

  deleteTask = (id: string): Promise<void> => {
    return this.enqueue(async () => {
      await this.ensureReadyForMutation();

      if (!this.tasks.some((task) => task.id === id)) {
        throw new TaskNotFoundError(id);
      }
      const next = this.tasks.filter((task) => task.id !== id);
      await this.persist(next);
      this.tasks = next;
      this.emit();
    });
  };

  toggleTask = (id: string): Promise<void> => {
    return this.enqueue(async () => {
      await this.ensureReadyForMutation();

      const index = this.tasks.findIndex((task) => task.id === id);
      if (index === -1) throw new TaskNotFoundError(id);

      const next = this.tasks.slice();
      next[index] = { ...next[index], completed: !next[index].completed };
      await this.persist(next);
      this.tasks = next;
      this.emit();
    });
  };

  resetDemo = (): Promise<void> => {
    return this.enqueue(async () => {
      if (!this.isDevelopment()) throw new ResetNotAllowedError();

      const seeded = createSeed(this.now());
      await this.persist(seeded);
      this.tasks = seeded;
      this.hydrated = true;
      this.error = null;
      this.emit();
    });
  };

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async hydrateLocked(force: boolean): Promise<void> {
    if (this.hydrated && !force && this.error === null) return;
    // A failed read is never followed by an automatic seed. Only the explicit
    // retryHydration()/resetDemo() paths may try again.
    if (this.hydrated && !force && this.error !== null) return;

    if (force) {
      this.error = null;
      this.hydrated = false;
      this.emit();
    }

    try {
      let raw: string | null;
      try {
        raw = await this.storage.getItem(this.storageKey);
      } catch (error) {
        throw new TaskStorageError(
          'Não foi possível ler as atividades salvas.',
          'read',
          error,
        );
      }

      if (raw === null) {
        const seeded = createSeed(this.now());
        await this.persist(seeded);
        this.tasks = seeded;
      } else {
        this.tasks = decodeTasks(raw);
      }
      this.error = null;
    } catch (error) {
      this.error = readableError(error);
    } finally {
      this.hydrated = true;
      this.emit();
    }
  }

  private async ensureReadyForMutation(): Promise<void> {
    if (!this.hydrated) {
      await this.hydrateLocked(false);
    }
    if (this.error !== null) {
      throw new TaskStorageUnavailableError(this.error);
    }
  }

  private async persist(tasks: readonly Task[]): Promise<void> {
    try {
      await this.storage.setItem(this.storageKey, encodeTasks(tasks));
    } catch (error) {
      throw new TaskStorageError(
        'Não foi possível salvar as alterações.',
        'write',
        error,
      );
    }
  }

  private nextId(): string {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const id = this.createId();
      if (id && !this.tasks.some((task) => task.id === id)) return id;
    }
    throw new TaskDataError('Não foi possível gerar um identificador único.');
  }

  private emit(): void {
    this.snapshot = {
      tasks: this.tasks,
      isHydrated: this.hydrated,
      error: this.error,
    };
    for (const listener of [...this.listeners]) {
      try {
        listener();
      } catch {
        // A broken observer must not take down persistence or other listeners.
      }
    }
  }
}

export function createTaskRepository(
  storage: KeyValueStore,
  options: TaskRepositoryOptions = {},
): TaskRepository {
  return new TaskRepository(storage, options);
}
