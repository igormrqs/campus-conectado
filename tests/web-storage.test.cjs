const test = require('node:test');
const assert = require('node:assert/strict');

const { appStorage } = require('./.build/src/features/tasks/storage.web.js');

function withLocalStorage(value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value,
  });
  return () => {
    if (previous) {
      Object.defineProperty(globalThis, 'localStorage', previous);
    } else {
      delete globalThis.localStorage;
    }
  };
}

test('web adapter exposes the async key-value contract over localStorage', async () => {
  const values = new Map();
  const restore = withLocalStorage({
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  });

  try {
    assert.equal(await appStorage.getItem('missing'), null);
    await appStorage.setItem('campus-conectado/tasks/v1', '{"version":1,"tasks":[]}');
    assert.equal(
      await appStorage.getItem('campus-conectado/tasks/v1'),
      '{"version":1,"tasks":[]}',
    );
    await appStorage.setItem('campus-conectado/tasks/v1', '{"version":1,"tasks":[]}');
    assert.equal(values.size, 1);
  } finally {
    restore();
  }
});

test('web adapter rejects clearly when localStorage is unavailable', async () => {
  const restore = withLocalStorage(undefined);

  try {
    await assert.rejects(
      appStorage.getItem('any-key'),
      /Armazenamento local do navegador/,
    );
    await assert.rejects(
      appStorage.setItem('any-key', 'value'),
      /Armazenamento local do navegador/,
    );
  } finally {
    restore();
  }
});
