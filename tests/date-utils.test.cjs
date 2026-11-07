const test = require('node:test');
const assert = require('node:assert/strict');
const dates = require('./.build/src/design/date-utils.js');
const { isCalendarDate, formatCalendarDate } = require('./.build/src/features/tasks/date.js');
const { validateTaskInput } = require('./.build/src/features/tasks/validation.js');

test('calendar helpers agree on invalid dates and Gregorian leap years', () => {
  for (const value of ['2026-02-29', '1900-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '2026-01-00', '0000-01-01', '2026-1-01', '2026-01-01T00:00:00Z', '']) {
    assert.equal(isCalendarDate(value), false, value);
    assert.equal(dates.isValidDateString(value), false, value);
    assert.equal(dates.parseCivilDate(value), null, value);
    assert.equal(dates.formatDateInput(value), '');
    assert.equal(dates.formatDatePtBR(value), 'Data inválida');
    assert.equal(dates.formatFriendlyDate(value), 'Data inválida');
    assert.deepEqual(dates.getDateBlock(value), { day: '—', month: '—', year: '—' });
    assert.equal(dates.isOverdue(value, false), false);
    assert.equal(dates.addDaysToDateString(value, 1), value);
  }
  for (const value of ['2024-02-29', '2000-02-29', '0004-02-29', '0001-01-01', '0099-12-31', '9999-12-31']) {
    assert.equal(dates.isValidDateString(value), true, value);
  }
});

test('pt-BR formatting and input parsing round trip without UTC or year offset', () => {
  for (const iso of ['2026-11-07', '2024-02-29', '0001-01-01', '0099-12-31']) {
    assert.equal(dates.parseDateInput(dates.formatDateInput(iso)), iso);
  }
  assert.equal(dates.formatDateInput('2026-11-07'), '07/11/2026');
  assert.equal(dates.formatDatePtBR('2026-11-07'), '07 nov 2026');
  assert.equal(dates.formatDatePtBR('2026-11-07', 'long'), '7 de novembro de 2026');
  assert.equal(dates.formatDatePtBR('0001-01-01', 'long'), '1 de janeiro de 0001');
  assert.deepEqual(dates.getDateBlock('2026-11-07'), { day: '07', month: 'nov', year: '2026' });
  assert.equal(dates.parseDateInput(' 07/11/2026 '), '2026-11-07');
  for (const text of ['31/04/2026', '29/02/1900', '1/01/2026', '2026-11-07', '00/11/2026', '01/01/0000']) assert.equal(dates.parseDateInput(text), null, text);
});

test('calendar arithmetic preserves early years and crosses month/year/leap boundaries', () => {
  assert.equal(dates.addDaysToDateString('0001-01-01', 1), '0001-01-02');
  assert.equal(dates.addDaysToDateString('0099-12-31', 1), '0100-01-01');
  assert.equal(dates.addDaysToDateString('0004-02-28', 1), '0004-02-29');
  assert.equal(dates.addDaysToDateString('1900-02-28', 1), '1900-03-01');
  assert.equal(dates.addDaysToDateString('2026-01-01', -1), '2025-12-31');
  assert.equal(dates.addDaysToDateString('2026-11-07', NaN), '2026-11-07');
  assert.equal(dates.addDaysToDateString('0001-01-01', -1), '0001-01-01');
  const local = new Date(0);
  local.setFullYear(1, 0, 1);
  local.setHours(23, 59, 0, 0);
  assert.equal(formatCalendarDate(local), '0001-01-01');
  assert.equal(dates.getTodayDateString(local), '0001-01-01');
});

test('legacy relative labels and completed overdue behavior stay compatible', () => {
  const today = dates.getTodayDateString();
  const yesterday = dates.addDaysToDateString(today, -1);
  assert.equal(dates.formatFriendlyDate(today), 'Hoje');
  assert.equal(dates.formatFriendlyDate(dates.addDaysToDateString(today, 1)), 'Amanhã');
  assert.equal(dates.formatFriendlyDate(yesterday), 'Ontem (atrasada)');
  assert.equal(dates.formatFriendlyDate(yesterday, true), 'Ontem');
  assert.equal(dates.isOverdue(yesterday, true), false);
  assert.equal(dates.isOverdue(yesterday, false), true);
});

test('validation copy does not expose storage date format and accepts early years', () => {
  const input = { title: 'Atividade', discipline: 'História', description: '', dueAt: '2026-02-30' };
  assert.equal(validateTaskInput(input).dueAt, 'Informe uma data de entrega válida.');
  assert.deepEqual(validateTaskInput({ ...input, dueAt: '0001-01-01' }), {});
});
