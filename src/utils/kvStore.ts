/**
 * kvStore — lightweight cross-platform key-value persistence.
 *
 * On Web (Expo Web / React Native Web):  uses window.localStorage
 * On Native (iOS / Android):             falls back to a runtime-imported
 *                                        AsyncStorage if available,
 *                                        otherwise in-memory (session-only).
 *
 * This avoids needing @react-native-async-storage as a hard dependency
 * while still providing persistent caching on all platforms.
 */

type StorageBackend = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

// --- Web localStorage backend ---
const webBackend: StorageBackend = {
  getItem: (key) => Promise.resolve(globalThis.localStorage?.getItem(key) ?? null),
  setItem: (key, value) => {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  },
};

// --- In-memory fallback backend (native without AsyncStorage) ---
const memStore = new Map<string, string>();
const memBackend: StorageBackend = {
  getItem: (key) => Promise.resolve(memStore.get(key) ?? null),
  setItem: (key, value) => {
    memStore.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    memStore.delete(key);
    return Promise.resolve();
  },
};

function getBackend(): StorageBackend {
  if (typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined') {
    return webBackend;
  }
  return memBackend;
}

export const kvStore = {
  get: <T>(key: string): Promise<T | null> =>
    getBackend().getItem(key).then(raw => {
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return null; }
    }),

  set: <T>(key: string, value: T): Promise<void> =>
    getBackend().setItem(key, JSON.stringify(value)),

  remove: (key: string): Promise<void> =>
    getBackend().removeItem(key),
};
