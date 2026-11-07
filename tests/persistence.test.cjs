const test = require('node:test');
const assert = require('node:assert/strict');

const {
  TASKS_STORAGE_KEY,
  TASKS_SCHEMA_VERSION,
  decodeTasks,
  encodeTasks,
} = require('./.build/src/features/tasks/persistedTasks.js');
const { createSeed } = require('./.build/src/features/tasks/seed.js');

const FIXED_NOW = new Date(2026, 10, 7, 12, 0, 0);

function envelope(tasks) {
  return JSON.stringify({ version: TASKS_SCHEMA_VERSION, tasks });
}

function validTask(overrides = {}) {
  return { ...createSeed(FIXED_NOW)[0], ...overrides };
}

test('round-trips the complete collection in a versioned envelope', () => {
  const tasks = createSeed(FIXED_NOW);
  assert.deepEqual(decodeTasks(encodeTasks(tasks)), tasks);
  assert.equal(TASKS_STORAGE_KEY, 'campus-conectado/tasks/v1');
});

test('keeps an empty array as a valid persisted state', () => {
  assert.deepEqual(decodeTasks(envelope([])), []);
});

test('rejects malformed JSON without attempting to repair it', () => {
  assert.throws(() => decodeTasks('{not json'), /corrompidos/);
});

test('rejects unknown schema versions and non-array payloads', () => {
  assert.throws(
    () => decodeTasks(JSON.stringify({ version: 99, tasks: [] })),
    /formato esperado/,
  );
  assert.throws(
    () => decodeTasks(JSON.stringify({ version: 1, tasks: {} })),
    /formato esperado/,
  );
  assert.throws(() => decodeTasks('[]'), /formato esperado/);
});

test('rejects duplicate identifiers instead of silently dropping a task', () => {
  const duplicated = validTask();
  assert.throws(() => decodeTasks(envelope([duplicated, duplicated])), /repetido/);
});

test('rejects impossible dates, missing fields and wrong completion types', () => {
  assert.throws(
    () => decodeTasks(envelope([validTask({ dueAt: '2026-02-30' })])),
    /calendário/,
  );
  assert.throws(
    () => decodeTasks(envelope([validTask({ completed: 'yes' })])),
    /status/,
  );
  assert.throws(
    () => decodeTasks(envelope([validTask({ description: undefined })])),
    /descrição/,
  );
  const { title, ...withoutTitle } = validTask();
  assert.throws(() => decodeTasks(envelope([withoutTitle])), /title/);
});

test('rejects non-ISO createdAt timestamps', () => {
  assert.throws(
    () => decodeTasks(envelope([validTask({ createdAt: 'ontem' })])),
    /criação/,
  );
  assert.throws(
    () => decodeTasks(envelope([validTask({ createdAt: '2026-11-07' })])),
    /criação/,
  );
});
