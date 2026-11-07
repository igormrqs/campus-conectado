const test = require('node:test');
const assert = require('node:assert/strict');
const { getTaskStats, selectFocusTasks, selectFilteredTasks, getTaskDisciplines } = require('./.build/src/features/tasks/selectors.js');
const today = '2026-11-07';
const task = (id, dueAt, completed = false, discipline = 'Matemática', createdAt = '2026-11-01T12:00:00.000Z') => ({ id, title: id, dueAt, completed, discipline, createdAt, description: '' });
const ids = tasks => tasks.map(t => t.id);

test('focus contains only pending tasks, ordered overdue, today and future, with default limit', () => {
  const tasks = [task('future', '2026-11-10'), task('done', '2026-10-01', true), task('today', today), task('late', '2026-11-02'), task('later', '2026-12-01')];
  assert.deepEqual(ids(selectFocusTasks(tasks, today)), ['late', 'today', 'future']);
  assert.deepEqual(ids(selectFocusTasks(tasks, today, 10)), ['late', 'today', 'future', 'later']);
  assert.deepEqual(selectFocusTasks(tasks, today, 0), []);
  assert.deepEqual(selectFocusTasks(tasks, today, -1), []);
  const afterCompletion = tasks.map(t => t.id === 'late' ? { ...t, completed: true } : t);
  assert.deepEqual(ids(selectFocusTasks(afterCompletion, today)), ['today', 'future', 'later']);
});

test('ties use creation date then id regardless of input order', () => {
  const tasks = [task('z', today), task('b', today, false, 'Matemática', '2026-11-02T12:00:00.000Z'), task('a', today)];
  assert.deepEqual(ids(selectFocusTasks(tasks, today)), ['a', 'z', 'b']);
  assert.deepEqual(ids(selectFocusTasks([...tasks].reverse(), today)), ['a', 'z', 'b']);
});

test('stats reflect the received collection and exclude completed from overdue', () => {
  const tasks = [task('late', '2026-11-01'), task('today', today), task('done', '2026-10-01', true)];
  assert.deepEqual(getTaskStats(tasks, today), { total: 3, pending: 2, completed: 1, overdue: 1, percentage: 33 });
  assert.equal(getTaskStats(tasks, '2026-11-08').overdue, 2);
  assert.deepEqual(getTaskStats([], today), { total: 0, pending: 0, completed: 0, overdue: 0, percentage: 0 });
  assert.deepEqual(selectFocusTasks([], today), []);
  const done = tasks.map(t => ({ ...t, completed: true }));
  assert.deepEqual(getTaskStats(done, today), { total: 3, pending: 0, completed: 3, overdue: 0, percentage: 100 });
  assert.deepEqual(selectFocusTasks(done, today), []);
});

test('status and discipline filters combine, while counters can use the discipline subset', () => {
  const tasks = [task('done-old', '2026-10-01', true), task('other', today, false, 'Física'), task('new', '2026-11-09', true, ' matemática '), task('pending', today)];
  assert.deepEqual(ids(selectFilteredTasks(tasks, 'all', ' MATEMÁTICA ', today)), ['pending', 'new', 'done-old']);
  assert.deepEqual(ids(selectFilteredTasks(tasks, 'completed', 'matemática', today)), ['new', 'done-old']);
  assert.deepEqual(ids(selectFilteredTasks(tasks, 'pending', ' matemática ', today)), ['pending']);
  assert.deepEqual(selectFilteredTasks(tasks, 'all', 'Inexistente', today), []);
  assert.deepEqual(getTaskStats(selectFilteredTasks(tasks, 'all', 'matemática', today), today), { total: 3, pending: 1, completed: 2, overdue: 0, percentage: 67 });
  assert.equal(selectFilteredTasks(tasks).length, 4);
});

test('disciplines deduplicate case and external spaces and sort in Portuguese', () => {
  const tasks = [' Zoologia ', 'matemática', 'MATEMÁTICA ', 'Álgebra', 'Física'].map((d, i) => task(String(i), today, false, d));
  assert.deepEqual(getTaskDisciplines(tasks), ['Álgebra', 'Física', 'matemática', 'Zoologia']);
  assert.deepEqual(getTaskDisciplines([]), []);
});

test('selectors never mutate the input array or its tasks', () => {
  const tasks = Object.freeze([Object.freeze(task('b', today)), Object.freeze(task('a', '2026-11-01', true))]);
  const before = JSON.stringify(tasks);
  for (const select of [t => getTaskStats(t, today), t => selectFocusTasks(t, today), t => selectFilteredTasks(t), getTaskDisciplines]) select(tasks);
  assert.equal(JSON.stringify(tasks), before);
  assert.notEqual(selectFilteredTasks(tasks), tasks);
});
