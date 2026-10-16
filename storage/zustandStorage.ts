import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const memory: Record<string, string> = {};

const ssrSafeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return memory[name] ?? null;
    return AsyncStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      memory[name] = value;
      return;
    }
    return AsyncStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') {
      delete memory[name];
      return;
    }
    return AsyncStorage.removeItem(name);
  },
};

const debounceStateStorage = (storage: StateStorage, debounceMs: number): StateStorage => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: { name: string; value: string } | null = null;

  return {
    getItem: (name) => storage.getItem(name),
    setItem: (name, value) => {
      pending = { name, value };
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const next = pending;
        pending = null;
        timer = null;
        if (next) void storage.setItem(next.name, next.value);
      }, debounceMs);
    },
    removeItem: (name) => {
      if (timer) clearTimeout(timer);
      pending = null;
      return storage.removeItem(name);
    },
  };
};

export const zustandJsonStorage = (options?: { debounceMs?: number }) => {
  const storage = options?.debounceMs
    ? debounceStateStorage(ssrSafeStorage, options.debounceMs)
    : ssrSafeStorage;
  return createJSONStorage(() => storage);
};
