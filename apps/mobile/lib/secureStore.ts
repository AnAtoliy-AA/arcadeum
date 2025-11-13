// Unified wrapper around expo-secure-store with an in-memory fallback for web / unsupported platforms.
export interface SecureStoreLike {
  setItemAsync(key: string, value: string): Promise<void>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<void>;
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

function resolveSecureStore(): SecureStoreLike {
  try {
    // Attempt indirect dynamic access without eval/require; if a global named expoSecureStore is injected we use it.
    const loader = new Function(
      "return typeof expoSecureStore !== 'undefined' ? expoSecureStore : undefined;",
    );
    const maybe = loader() as SecureStoreLike | undefined;
    if (maybe && typeof maybe.setItemAsync === 'function') {
      return maybe;
    }
  } catch {
    // ignore and fall through to other strategies
  }

  const browser = createBrowserStore();
  if (browser) return browser;

  return createMemoryStore();
}

export const SecureStoreShim: SecureStoreLike = resolveSecureStore();
