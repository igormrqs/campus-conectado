import { isCalendarDate } from './date';
import type { TaskFieldErrors, TaskInput } from './types';

const MESSAGES = {
  title: 'Informe o título da atividade.',
  discipline: 'Informe a disciplina.',
  dueAtRequired: 'Escolha uma data de entrega.',
  dueAtInvalid: 'Informe uma data de entrega válida.',
  description: 'A descrição precisa ser um texto.',
} as const;

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Trims user-entered fields without changing line breaks inside a description. */
export function normalizeTaskInput(input: TaskInput): TaskInput {
  return {
    title: asText(input?.title).trim(),
    discipline: asText(input?.discipline).trim(),
    description: asText(input?.description).trim(),
    dueAt: asText(input?.dueAt).trim(),
  };
}

/**
 * Frozen public validator. Returns `{}` for valid input and field messages
 * otherwise. It never throws, even when called with malformed runtime data.
 */
export function validateTaskInput(input: TaskInput): TaskFieldErrors {
  const errors: TaskFieldErrors = {};
  const title = asText(input?.title).trim();
  const discipline = asText(input?.discipline).trim();
  const description = input?.description;
  const dueAt = asText(input?.dueAt).trim();

  if (!title) errors.title = MESSAGES.title;
  if (!discipline) errors.discipline = MESSAGES.discipline;
  if (description !== undefined && typeof description !== 'string') {
    errors.description = MESSAGES.description;
  }
  if (!dueAt) {
    errors.dueAt = MESSAGES.dueAtRequired;
  } else if (!isCalendarDate(dueAt)) {
    errors.dueAt = MESSAGES.dueAtInvalid;
  }

  return errors;
}

export function hasFieldErrors(errors: TaskFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
