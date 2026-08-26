import { CLIENT_TIMEOUT, SSR_TIMEOUT } from '../config/app-config';
import { resolveApiFallbackUrl, resolveApiUrl } from './api-base';
import { HttpStatus } from './http-status';

function defaultTimeout(): number {
  return typeof window === 'undefined' ? SSR_TIMEOUT : CLIENT_TIMEOUT;
}

interface NetworkError extends Error {
  code?: string;
  cause?: {
    code?: string;
    message?: string;
  };
}

const ANONYMOUS_ID_KEY = 'arcadeum_anon_id';
const ANON_ID_REGEX = /^anon_[0-9a-f-]{4,64}$/;

export async function getOrCreateAnonymousId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  let id = localStorage.getItem(ANONYMOUS_ID_KEY);

  if (!id || !ANON_ID_REGEX.test(id)) {
    const randomBytes = new Uint8Array(8);
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(randomBytes);
    } else if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto?.getRandomValues
    ) {
      globalThis.crypto.getRandomValues(randomBytes);
    } else {
      throw new Error(
        'Cryptographically secure random number generation is not available',
      );
    }
    const randomPart = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
    id = `anon_${randomPart}`;
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }

  return id;
}

export function getAnonymousId() {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (id && ANON_ID_REGEX.test(id)) {
    return id;
  }
  return null;
}

export interface ApiClientOptions extends Omit<RequestInit, 'cache'> {
  token?: string;
  data?: unknown;
  timeout?: number;
  cache?: RequestCache;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const inFlightRequests = new Map<string, Promise<unknown>>();

interface SsrCacheEntry {
  value: unknown;
  expiresAt: number;
}

const SSR_CACHE_TTL_MS = 60_000;
const SSR_CACHE_MAX_ENTRIES = 200;

function ssrResponseCache(): Map<string, SsrCacheEntry> {
  const store = globalThis as typeof globalThis & {
    __arcadeumSsrResponseCache?: Map<string, SsrCacheEntry>;
  };
  store.__arcadeumSsrResponseCache ??= new Map();
  return store.__arcadeumSsrResponseCache;
}

function readSsrCache(key: string): unknown | undefined {
  const cache = ssrResponseCache();
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function writeSsrCache(key: string, value: unknown): void {
  const cache = ssrResponseCache();
  if (cache.size >= SSR_CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(key, { value, expiresAt: Date.now() + SSR_CACHE_TTL_MS });
}

export const apiClient = {
  async fetch<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const {
      method = 'GET',
      token,
      data,
      headers: customHeaders,
      timeout = defaultTimeout(),
      signal: customSignal,
      ...fetchOptions
    } = options;
    const url = resolveApiUrl(path);

    // Only deduplicate GET requests
    const isGet = method.toUpperCase() === 'GET';
    const cacheKey = isGet ? `${method}:${url}:${token || ''}` : null;

    // Server-side responses are memoized briefly so static prerendering
    // (every page × locale during `next build`) doesn't hammer the API
    // and trip its rate limiter (429 ThrottlerException).
    const ssrKey =
      typeof window === 'undefined' && cacheKey && options.cache !== 'no-store'
        ? `ssr:${cacheKey}`
        : null;

    if (ssrKey) {
      const cached = readSsrCache(ssrKey);
      if (cached !== undefined) return cached as T;
    }

    if (cacheKey && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const result = await this.performFetch<T>(
          url,
          {
            method,
            token,
            data,
            headers: customHeaders,
            timeout,
            signal: customSignal,
            ...fetchOptions,
          },
          path,
        );
        if (ssrKey) writeSsrCache(ssrKey, result);
        return result;
      } finally {
        if (cacheKey) inFlightRequests.delete(cacheKey);
      }
    })();

    if (cacheKey) {
      inFlightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  },

  async performFetch<T>(
    url: string,
    options: ApiClientOptions = {},
    path?: string,
  ): Promise<T> {
    const {
      token,
      data,
      headers: customHeaders,
      timeout,
      signal: customSignal,
      ...fetchOptions
    } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...customHeaders,
    };

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const anonId = await getOrCreateAnonymousId();
    if (anonId) {
      (headers as Record<string, string>)['x-anonymous-id'] = anonId;
    }

    const isDev = process.env.NODE_ENV === 'development';
    const isServer = typeof window === 'undefined';
    let attempts = 0;
    // The server retries once so build-time prerendering survives transient
    // API hiccups (rate limits, cold starts); browsers fail fast instead.
    const maxAttempts = isDev || isServer ? 2 : 1;

    while (attempts < maxAttempts) {
      attempts++;

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const config: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: 'include',
        cache: options.cache ?? 'no-cache',
        signal: customSignal || controller.signal,
        ...(typeof window === 'undefined' ? { next: { revalidate: 60 } } : {}),
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          let errorMessage = 'An error occurred while fetching data.';
          let errorData;

          try {
            errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Ignore JSON parse error
          }

          if (
            response.status === HttpStatus.TOO_MANY_REQUESTS &&
            attempts < maxAttempts
          ) {
            clearTimeout(id);
            const retryAfterSec = Number(response.headers.get('retry-after'));
            const delayMs =
              Number.isFinite(retryAfterSec) && retryAfterSec > 0
                ? Math.min(retryAfterSec * 1000, 5000)
                : 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          throw new ApiError(errorMessage, response.status, errorData);
        }

        // Handle 204 No Content
        if (response.status === HttpStatus.NO_CONTENT) {
          clearTimeout(id);
          return {} as T;
        }

        try {
          const result = await response.json();
          clearTimeout(id);
          return result;
        } catch {
          clearTimeout(id);
          return {} as T;
        }
      } catch (error) {
        const networkError = error as NetworkError;
        const isConnectionError =
          error instanceof Error &&
          (networkError.message.includes('ECONNREFUSED') ||
            networkError.code === 'ECONNREFUSED' ||
            (networkError.cause instanceof Error &&
              networkError.cause.message.includes('ECONNREFUSED')) ||
            networkError.cause?.code === 'ECONNREFUSED' ||
            networkError.message.includes('fetch failed') ||
            networkError.code === 'ENOTFOUND' ||
            networkError.cause?.code === 'ENOTFOUND');

        if (isConnectionError && attempts < maxAttempts) {
          if (isDev) {
            console.warn(
              `[apiClient] Connection refused to ${url}. Attempt ${attempts}/${maxAttempts}. (Cause: ${
                networkError.cause?.message || networkError.message
              }) Retrying in 2s...`,
            );
          }
          // Wait a bit before retrying to give the backend time to wake up
          clearTimeout(id);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        if (isDev && attempts === maxAttempts && isConnectionError) {
          console.error(
            `[apiClient] Final attempt failed. Connection refused to ${url}. Please ensure the backend is running and reachable.`,
          );
        }

        // Production fallback: try backup instance on network/timeout errors
        clearTimeout(id);
        const isClient = typeof window !== 'undefined';
        if (isClient && isConnectionError) {
          const fallbackUrl = resolveApiFallbackUrl(path ?? '');
          if (fallbackUrl && fallbackUrl !== url) {
            try {
              console.warn(
                `[apiClient] Primary ${url} unreachable, trying fallback ${fallbackUrl}`,
              );
              const fallbackResult = await this.performFetch<T>(
                fallbackUrl,
                options,
              );
              return fallbackResult;
            } catch {
              // Fallback also failed, fall through to throw original error
            }
          }
        }

        if (error instanceof Error && error.name === 'AbortError') {
          // If the external (caller-provided) signal was aborted, propagate
          // the AbortError so callers can distinguish cancellation from timeout.
          if (customSignal?.aborted) throw error;
          throw new ApiError(
            'Request timed out',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        throw error;
      }
    }
    throw new Error('Unexpected end of request loop');
  },

  get<T>(path: string, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, data?: unknown, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'POST', data });
  },

  put<T>(path: string, data?: unknown, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'PUT', data });
  },

  patch<T>(path: string, data?: unknown, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'PATCH', data });
  },

  delete<T>(path: string, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  },
};
