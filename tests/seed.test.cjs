const test = require('node:test');
const assert = require('node:assert/strict');

const { createSeed } = require('./.build/src/features/tasks/seed.js');
const { isCalendarDate } = require('./.build/src/features/tasks/date.js');

const FIXED_NOW = new Date(2026, 0, 31, 12, 0, 0);

test('creates 11 plausible activities with unique ids and valid schema', () => {
  const tasks = createSeed(FIXED_NOW);
  assert.equal(tasks.length, 11);
  assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length);

  for (const task of tasks) {
    assert.equal(typeof task.title, 'string');
    assert.ok(task.title.trim());
    assert.ok(task.discipline.trim());
    assert.equal(typeof task.description, 'string');
    assert.equal(isCalendarDate(task.dueAt), true);
    assert.equal(typeof task.completed, 'boolean');
    assert.equal(Number.isNaN(Date.parse(task.createdAt)), false);
  }
});

test('anchors due dates to first access across month boundaries', () => {
  const byTitle = new Map(createSeed(FIXED_NOW).map((task) => [task.title, task]));
  assert.equal(byTitle.get('Revisar árvores binárias').dueAt, '2026-01-31');
  assert.equal(byTitle.get('Entregar DER do projeto').dueAt, '2026-02-01');
  assert.equal(byTitle.get('Resolver lista de integrais').dueAt, '2026-01-30');
  assert.equal(byTitle.get('Estudar protocolos de rede').dueAt, '2026-02-07');
  assert.equal(byTitle.get('Testar navegação offline').dueAt, '2026-02-10');
  assert.equal(byTitle.get('Implementar tabela hash').dueAt, '2026-01-27');
});

test('includes overdue, pending and completed work across the expected disciplines', () => {
  const tasks = createSeed(FIXED_NOW);
  const completed = tasks.filter((task) => task.completed);
  const pending = tasks.filter((task) => !task.completed);
  const overduePending = tasks.filter((task) => !task.completed && task.dueAt < '2026-01-31');

  assert.ok(completed.length >= 3);
  assert.ok(pending.length >= 3);
  assert.ok(overduePending.length >= 1);
  assert.ok(completed.some((task) => task.dueAt < '2026-01-31'));

  const disciplines = new Set(tasks.map((task) => task.discipline));
  for (const expected of [
    'Estruturas de Dados',
    'Banco de Dados',
    'Engenharia de Software',
    'Cálculo',
    'Redes de Computadores',
    'Desenvolvimento Mobile',
  ]) {
    assert.equal(disciplines.has(expected), true, `missing ${expected}`);
  }
});
