const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createTaskRepository,
} = require('./.build/src/features/tasks/repository.js');
const {
  TASKS_STORAGE_KEY,
  decodeTasks,
  encodeTasks,
} = require('./.build/src/features/tasks/persistedTasks.js');
const { createSeed } = require('./.build/src/features/tasks/seed.js');
const { InMemoryStore } = require('./support/in-memory-store.cjs');

const FIXED_NOW = new Date(2026, 10, 7, 12, 0, 0);
const validInput = {
  title: 'Apresentar Campus Conectado',
  discipline: 'Desenvolvimento Mobile',
  description: 'Demonstração de cinco minutos.',
  dueAt: '2026-11-08',
};

function repoFor(store, overrides = {}) {
  let nextId = 0;
  return createTaskRepository(store, {
    now: () => FIXED_NOW,
    createId: () => `test-${++nextId}`,
    isDevelopment: () => true,
    ...overrides,
  });
}

test('hydrates by seeding exactly once and reopens without rewriting', async () => {
  const store = new InMemoryStore();
  const repo = repoFor(store);

  await repo.hydrate();

  const snapshot = repo.getSnapshot();
  assert.equal(snapshot.isHydrated, true);
  assert.equal(snapshot.error, null);
  assert.equal(snapshot.tasks.length, 11);
  assert.equal(store.writeCount, 1);
  assert.deepEqual(decodeTasks(store.read(TASKS_STORAGE_KEY)), snapshot.tasks);

  const reopened = repoFor(store, { now: () => new Date(2026, 11, 1, 9, 0, 0) });
  await reopened.hydrate();

  assert.equal(store.writeCount, 1);
  assert.deepEqual(
    reopened.getSnapshot().tasks.map((task) => task.id),
    snapshot.tasks.map((task) => task.id),
  );
});

test('accepts an empty stored array and never seeds over it', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, encodeTasks([]));
  const repo = repoFor(store);

  await repo.hydrate();

  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.equal(repo.getSnapshot().error, null);
  assert.equal(store.writeCount, 0);

  await repo.addTask(validInput);
  assert.equal(store.writeCount, 1);
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY)).length, 1);
});

test('keeps corrupt data untouched, blocks mutations and recovers only on retry', async () => {
  const store = new InMemoryStore();
  const corruptPayload = '{"version":1,"tasks":[{"broken":true}]}';
  store.write(TASKS_STORAGE_KEY, corruptPayload);
  const repo = repoFor(store);

  await repo.hydrate();

  assert.equal(repo.getSnapshot().isHydrated, true);
  assert.ok(repo.getSnapshot().error);
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.equal(store.read(TASKS_STORAGE_KEY), corruptPayload);
  assert.equal(store.writeCount, 0);

  await assert.rejects(
    repo.addTask(validInput),
    (error) => error.name === 'TaskStorageUnavailableError',
  );
  assert.equal(store.read(TASKS_STORAGE_KEY), corruptPayload);
  assert.equal(store.writeCount, 0);

  store.write(TASKS_STORAGE_KEY, encodeTasks(createSeed(FIXED_NOW)));
  await repo.retryHydration();

  assert.equal(repo.getSnapshot().error, null);
  assert.equal(repo.getSnapshot().tasks.length, 11);
});

test('does not turn a read error into a new seed', async () => {
  const store = new InMemoryStore();
  store.failRead = true;
  const repo = repoFor(store);

  await repo.hydrate();

  assert.ok(repo.getSnapshot().error);
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.equal(store.readCount, 1);
  assert.equal(store.writeCount, 0);

  store.failRead = false;
  await repo.hydrate(); // a normal hydration attempt must not retry automatically

  assert.equal(store.readCount, 1);
  assert.equal(store.writeCount, 0);
  assert.ok(repo.getSnapshot().error);

  await repo.retryHydration();

  assert.equal(store.readCount, 2);
  assert.equal(store.writeCount, 1);
  assert.equal(repo.getSnapshot().tasks.length, 11);
  assert.equal(repo.getSnapshot().error, null);
});

test('surfaces a seed write failure and recovers through explicit retry', async () => {
  const store = new InMemoryStore();
  store.failWrite = true;
  const repo = repoFor(store);

  await repo.hydrate();

  assert.ok(repo.getSnapshot().error);
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.equal(store.read(TASKS_STORAGE_KEY), null);

  store.failWrite = false;
  await repo.retryHydration();

  assert.equal(repo.getSnapshot().error, null);
  assert.equal(repo.getSnapshot().tasks.length, 11);
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY)).length, 11);
});

test('hydrates lazily before a mutation called without an explicit hydrate', async () => {
  const store = new InMemoryStore();
  const repo = repoFor(store);

  await repo.addTask(validInput);

  assert.equal(repo.getSnapshot().tasks.length, 12);
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY)).length, 12);
});

test('performs create, update, toggle and delete with persisted results', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, encodeTasks([]));
  const repo = repoFor(store);
  await repo.hydrate();

  await repo.addTask({
    ...validInput,
    title: '  Apresentar Campus Conectado ',
    discipline: ' Desenvolvimento Mobile ',
  });
  let tasks = repo.getSnapshot().tasks;
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].title, 'Apresentar Campus Conectado');
  assert.equal(tasks[0].discipline, 'Desenvolvimento Mobile');
  assert.equal(tasks[0].completed, false);
  assert.equal(tasks[0].id, 'test-1');
  assert.equal(tasks[0].createdAt, FIXED_NOW.toISOString());
  assert.deepEqual(decodeTasks(store.read(TASKS_STORAGE_KEY)), tasks);

  await repo.updateTask('test-1', {
    description: 'Roteiro atualizado.',
    dueAt: '2026-11-09',
  });
  tasks = repo.getSnapshot().tasks;
  assert.equal(tasks[0].description, 'Roteiro atualizado.');
  assert.equal(tasks[0].dueAt, '2026-11-09');
  assert.equal(tasks[0].createdAt, FIXED_NOW.toISOString());

  const beforeInvalid = store.read(TASKS_STORAGE_KEY);
  await assert.rejects(
    repo.updateTask('test-1', { dueAt: '2026-02-30' }),
    (error) =>
      error.name === 'TaskValidationError' &&
      typeof error.fieldErrors.dueAt === 'string',
  );
  assert.equal(store.read(TASKS_STORAGE_KEY), beforeInvalid);
  assert.equal(repo.getSnapshot().tasks[0].dueAt, '2026-11-09');

  await repo.toggleTask('test-1');
  assert.equal(repo.getSnapshot().tasks[0].completed, true);
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY))[0].completed, true);

  await repo.toggleTask('test-1');
  assert.equal(repo.getSnapshot().tasks[0].completed, false);

  await repo.deleteTask('test-1');
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.deepEqual(decodeTasks(store.read(TASKS_STORAGE_KEY)), []);
});

test('rejects invalid input and unknown identifiers without creating tasks', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, encodeTasks([]));
  const repo = repoFor(store);
  await repo.hydrate();

  await assert.rejects(
    repo.addTask({ ...validInput, title: '   ' }),
    (error) =>
      error.name === 'TaskValidationError' && Boolean(error.fieldErrors.title),
  );
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.equal(store.writeCount, 0);

  for (const operation of [
    () => repo.updateTask('missing', { title: 'Novo título' }),
    () => repo.deleteTask('missing'),
    () => repo.toggleTask('missing'),
  ]) {
    await assert.rejects(
      operation,
      (error) => error.name === 'TaskNotFoundError',
    );
  }
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.equal(store.writeCount, 0);
});

test('keeps memory and storage unchanged when a write fails', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, encodeTasks([]));
  const repo = repoFor(store);
  await repo.hydrate();

  store.failWrite = true;
  await assert.rejects(
    repo.addTask(validInput),
    (error) => error.name === 'TaskStorageError' && error.operation === 'write',
  );
  assert.deepEqual(repo.getSnapshot().tasks, []);
  assert.deepEqual(decodeTasks(store.read(TASKS_STORAGE_KEY)), []);

  store.failWrite = false;
  await repo.addTask(validInput);
  assert.equal(repo.getSnapshot().tasks.length, 1);
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY)).length, 1);
});

test('serializes concurrent writes so no update is lost', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, encodeTasks([]));
  store.readDelayMs = 1;
  store.writeDelayMs = 1;
  const repo = repoFor(store);
  await repo.hydrate();

  await Promise.all(
    Array.from({ length: 24 }, (_, index) =>
      repo.addTask({ ...validInput, title: `Atividade ${index}` }),
    ),
  );

  assert.equal(repo.getSnapshot().tasks.length, 24);
  assert.equal(new Set(repo.getSnapshot().tasks.map((task) => task.id)).size, 24);
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY)).length, 24);

  const targetId = repo.getSnapshot().tasks[0].id;
  await Promise.all([
    repo.updateTask(targetId, { title: 'Título consolidado' }),
    repo.updateTask(targetId, { description: 'Descrição consolidada' }),
    repo.toggleTask(targetId),
  ]);

  const target = repo.getSnapshot().tasks.find((task) => task.id === targetId);
  assert.equal(target.title, 'Título consolidado');
  assert.equal(target.description, 'Descrição consolidada');
  assert.equal(target.completed, true);

  const persisted = decodeTasks(store.read(TASKS_STORAGE_KEY));
  assert.equal(persisted.length, 24);
  assert.equal(
    persisted.find((task) => task.id === targetId).title,
    'Título consolidado',
  );

  const reopened = repoFor(store);
  await reopened.hydrate();
  assert.equal(reopened.getSnapshot().tasks.length, 24);
  assert.equal(
    reopened.getSnapshot().tasks.find((task) => task.id === targetId).completed,
    true,
  );
});

test('resetDemo rejects outside development and does not touch data', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, encodeTasks(createSeed(FIXED_NOW)));
  const repo = repoFor(store, { isDevelopment: () => false });
  await repo.hydrate();
  await repo.deleteTask('seed-01');

  const before = store.read(TASKS_STORAGE_KEY);
  await assert.rejects(
    repo.resetDemo(),
    (error) => error.name === 'ResetNotAllowedError',
  );

  assert.equal(store.read(TASKS_STORAGE_KEY), before);
  assert.equal(repo.getSnapshot().tasks.length, 10);
});

test('resetDemo restores the seed in development, even after corrupt data', async () => {
  const store = new InMemoryStore();
  store.write(TASKS_STORAGE_KEY, 'not-json');
  const repo = repoFor(store, { isDevelopment: () => true });

  await repo.hydrate();
  assert.ok(repo.getSnapshot().error);

  await repo.resetDemo();

  assert.equal(repo.getSnapshot().error, null);
  assert.equal(repo.getSnapshot().tasks.length, 11);
  assert.deepEqual(repo.getSnapshot().tasks.map((task) => task.id), createSeed(FIXED_NOW).map((task) => task.id));
  assert.equal(decodeTasks(store.read(TASKS_STORAGE_KEY)).length, 11);
});
