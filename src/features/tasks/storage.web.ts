import type { KeyValueStore } from './repository';

type BrowserStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const globalWithStorage = globalThis as typeof globalThis & {
  localStorage?: BrowserStorage;
};

function browserStorage(): BrowserStorage {
  if (!globalWithStorage.localStorage) {
    throw new Error('Armazenamento local do navegador indisponível.');
  }
  return globalWithStorage.localStorage;
}

/**
 * Web-only adapter. It keeps the same async KeyValueStore contract as
 * expo-sqlite/kv-store without requiring WASM, a worker or COOP/COEP headers.
 * Data remains local to the browser profile.
 */
export const appStorage: KeyValueStore = {
  async getItem(key: string): Promise<string | null> {
    return browserStorage().getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    browserStorage().setItem(key, value);
  },
};
