import Storage from 'expo-sqlite/kv-store';
import type { KeyValueStore } from './repository';

/**
 * Native/default storage. Metro resolves `storage.web.ts` first on web so the
 * SQLite WASM worker is not pulled into the browser bundle.
 */
export const appStorage: KeyValueStore = Storage;
