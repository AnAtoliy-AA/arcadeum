// Unified wrapper around expo-secure-store with a localStorage fallback on web and an in-memory fallback when localStorage is unavailable.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface SecureStoreLike {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
}

function createNativeStore(): SecureStoreLike {
  return {
    async setItemAsync(k, v) {
      await SecureStore.setItemAsync(k, v);
    },
    async getItemAsync(k) {
      return SecureStore.getItemAsync(k);
    },
    async deleteItemAsync(k) {
      await SecureStore.deleteItemAsync(k);
    },
  };
}

function createBrowserStore(): SecureStoreLike | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    // Ensure storage is writable (may throw in private mode/quota situations)
    const probeKey = '__secure_store_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return {
      async setItemAsync(k, v) {
        window.localStorage.setItem(k, v);
      },
      async getItemAsync(k) {
        const value = window.localStorage.getItem(k);
        return value ?? null;
      },
      async deleteItemAsync(k) {
        window.localStorage.removeItem(k);
      },
    };
  } catch {
    return null;
  }
}

function createMemoryStore(): SecureStoreLike {
  const memory = new Map<string, string>();
  return {
    async setItemAsync(k, v) {
      memory.set(k, v);
    },
    async getItemAsync(k) {
      return memory.get(k) ?? null;
    },
    async deleteItemAsync(k) {
      memory.delete(k);
    },
  };
}

function resolveSecureStore(): SecureStoreLike {
  if (Platform.OS !== 'web') {
    return createNativeStore();
  }

  const browser = createBrowserStore();
  if (browser) return browser;

  return createMemoryStore();
}

export const SecureStoreShim: SecureStoreLike = resolveSecureStore();
