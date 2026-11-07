const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isCalendarDate,
  formatCalendarDate,
  addCalendarDays,
} = require('./.build/src/features/tasks/date.js');
const {
  normalizeTaskInput,
  validateTaskInput,
} = require('./.build/src/features/tasks/validation.js');

const validInput = {
  title: 'Entregar DER do projeto',
  discipline: 'Banco de Dados',
  description: 'Revisar cardinalidades.',
  dueAt: '2026-11-08',
};

test('accepts a complete input and returns no field errors', () => {
  assert.deepEqual(validateTaskInput(validInput), {});
});

test('requires title, discipline and due date while description stays optional', () => {
  const errors = validateTaskInput({
    title: '   ',
    discipline: '',
    description: '',
    dueAt: '',
  });

  assert.ok(errors.title);
  assert.ok(errors.discipline);
  assert.ok(errors.dueAt);
  assert.equal(errors.description, undefined);
});

test('normalizes surrounding whitespace but keeps inner description lines', () => {
  assert.deepEqual(
    normalizeTaskInput({
      title: '  Apresentar Campus Conectado ',
      discipline: ' Desenvolvimento Mobile  ',
      description: '  Linha um\nLinha dois  ',
      dueAt: ' 2026-11-08 ',
    }),
    {
      title: 'Apresentar Campus Conectado',
      discipline: 'Desenvolvimento Mobile',
      description: 'Linha um\nLinha dois',
      dueAt: '2026-11-08',
    },
  );
});

test('validates real calendar dates including leap years and rejects impossible days', () => {
  assert.equal(isCalendarDate('2026-11-07'), true);
  assert.equal(isCalendarDate('2024-02-29'), true);
  assert.equal(isCalendarDate('2026-02-29'), false);
  assert.equal(isCalendarDate('2026-04-31'), false);
  assert.equal(isCalendarDate('2026-13-01'), false);
  assert.equal(isCalendarDate('2026-00-10'), false);
  assert.equal(isCalendarDate('07/11/2026'), false);
  assert.equal(isCalendarDate('2026-1-07'), false);
  assert.equal(isCalendarDate(20261107), false);
});

test('formats local calendar dates without UTC conversion and shifts across months', () => {
  const local = new Date(2026, 0, 31, 23, 30, 0);
  assert.equal(formatCalendarDate(local), '2026-01-31');
  assert.equal(formatCalendarDate(addCalendarDays(local, 1)), '2026-02-01');
  assert.equal(formatCalendarDate(addCalendarDays(local, -31)), '2025-12-31');
});
