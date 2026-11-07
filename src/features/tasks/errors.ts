import type { TaskFieldErrors } from './types';

/** Mutation rejected because the complete input is not valid. */
export class TaskValidationError extends Error {
  readonly fieldErrors: TaskFieldErrors;

  constructor(fieldErrors: TaskFieldErrors) {
    super('Revise os campos destacados antes de salvar.');
    this.name = 'TaskValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/** A mutation referenced an id that does not exist. */
export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Nenhuma atividade encontrada para o identificador "${id}".`);
    this.name = 'TaskNotFoundError';
  }
}

/** Storage failed while reading or writing. Nothing was silently replaced. */
export class TaskStorageError extends Error {
  readonly operation: 'read' | 'write';
  readonly cause?: unknown;

  constructor(
    message: string,
    operation: 'read' | 'write',
    cause?: unknown,
  ) {
    super(message);
    this.name = 'TaskStorageError';
    this.operation = operation;
    this.cause = cause;
  }
}

/** Persisted JSON exists but does not match the frozen task schema. */
export class TaskDataError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'TaskDataError';
    this.cause = cause;
  }
}

/** Demo reset is intentionally unavailable outside development builds. */
export class ResetNotAllowedError extends Error {
  constructor() {
    super('O reset da demonstração está disponível apenas em desenvolvimento.');
    this.name = 'ResetNotAllowedError';
  }
}

/** Mutations are blocked until a successful hydration, so corrupt data survives. */
export class TaskStorageUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskStorageUnavailableError';
  }
}
