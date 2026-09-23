/**
 * kvStore — lightweight cross-platform key-value persistence.
 *
 * Works safely across:
 *   - React Native (iOS / Android) via AsyncStorage
 *   - Web via window.localStorage
 *   - Node.js / CLI testing via in-memory Map fallback
 */

const memStore = new Map<string, string>();

async function getStorageItem(key: string): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage?.getItem) {
      return await AsyncStorage.getItem(key);
    }
  } catch {
    // fallback to memStore
  }
  return memStore.get(key) ?? null;
}

async function setStorageItem(key: string, value: string): Promise<void> {
  memStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage?.setItem) {
      await AsyncStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

async function removeStorageItem(key: string): Promise<void> {
  memStore.delete(key);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage?.removeItem) {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export const kvStore = {
  get: async <T>(key: string): Promise<T | null> => {
    const raw = await getStorageItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    await setStorageItem(key, JSON.stringify(value));
  },

  remove: async (key: string): Promise<void> => {
    await removeStorageItem(key);
  },
};
