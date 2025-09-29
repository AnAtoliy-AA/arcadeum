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

let exported: SecureStoreLike = createMemoryStore();
try {
  // Attempt indirect dynamic access without eval/require; if a global named expoSecureStore is injected we use it.
  const loader = new Function(
    "return typeof expoSecureStore !== 'undefined' ? expoSecureStore : undefined;",
  );
  const maybe = loader() as SecureStoreLike | undefined;
  if (maybe && typeof maybe.setItemAsync === 'function') exported = maybe;
} catch {
  // ignore and keep memory fallback
}
export const SecureStoreShim: SecureStoreLike = exported;
