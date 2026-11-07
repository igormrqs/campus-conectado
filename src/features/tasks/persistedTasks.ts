import { isCalendarDate } from './date';
import { TaskDataError } from './errors';
import type { Task } from './types';

export const TASKS_STORAGE_KEY = 'campus-conectado/tasks/v1';
export const TASKS_SCHEMA_VERSION = 1;

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

type PersistedEnvelope = {
  version: number;
  tasks: Task[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function corrupt(message: string, cause?: unknown): TaskDataError {
  return new TaskDataError(message, cause);
}

function readRequiredText(
  source: Record<string, unknown>,
  field: string,
): string {
  const value = source[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw corrupt(`Atividade salva inválida: campo "${field}" ausente.`);
  }
  return value;
}

function readTask(value: unknown): Task {
  if (!isRecord(value)) {
    throw corrupt('Atividade salva inválida: o item não é um objeto.');
  }

  const id = readRequiredText(value, 'id');
  const title = readRequiredText(value, 'title');
  const discipline = readRequiredText(value, 'discipline');
  const dueAt = readRequiredText(value, 'dueAt');
  const createdAt = readRequiredText(value, 'createdAt');

  if (typeof value.description !== 'string') {
    throw corrupt('Atividade salva inválida: descrição ausente.');
  }
  if (typeof value.completed !== 'boolean') {
    throw corrupt('Atividade salva inválida: status ausente.');
  }
  if (!isCalendarDate(dueAt)) {
    throw corrupt('Atividade salva inválida: data de entrega fora do calendário.');
  }
  if (
    !ISO_TIMESTAMP_PATTERN.test(createdAt) ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    throw corrupt('Atividade salva inválida: data de criação incorreta.');
  }

  return {
    id,
    title,
    discipline,
    description: value.description,
    dueAt,
    completed: value.completed,
    createdAt,
  };
}

/** Serializes the complete collection. The envelope allows future migrations. */
export function encodeTasks(tasks: readonly Task[]): string {
  const envelope: PersistedEnvelope = {
    version: TASKS_SCHEMA_VERSION,
    tasks: [...tasks],
  };
  return JSON.stringify(envelope);
}

/**
 * Parses persisted JSON without repairing or discarding anything. Any malformed
 * entry rejects the whole payload so hydration never overwrites user data.
 */
export function decodeTasks(raw: string): Task[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw corrupt('Os dados locais estão corrompidos e não foram alterados.', error);
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== TASKS_SCHEMA_VERSION ||
    !Array.isArray(parsed.tasks)
  ) {
    throw corrupt('Os dados locais não seguem o formato esperado.');
  }

  const tasks = parsed.tasks.map(readTask);
  const ids = new Set<string>();
  for (const task of tasks) {
    if (ids.has(task.id)) {
      throw corrupt(`Os dados locais contêm um identificador repetido: "${task.id}".`);
    }
    ids.add(task.id);
  }

  return tasks;
}
