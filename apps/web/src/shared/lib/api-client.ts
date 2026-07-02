import { CLIENT_TIMEOUT, SSR_TIMEOUT } from '../config/app-config';
import { resolveApiUrl } from './api-base';
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

async function deriveSigningKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function signAnonymousId(id: string): Promise<string> {
  const secret =
    typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_ANON_SECRET ?? '')
      : '';
  if (!secret) return '';
  const key = await deriveSigningKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(id),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getAnonymousIdWithSignature(): Promise<{
  id: string;
  signature: string;
} | null> {
  if (typeof window === 'undefined') return null;

  let id = localStorage.getItem(ANONYMOUS_ID_KEY);

  if (!id) {
    id = `anon_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }

  const signature = await signAnonymousId(id);
  return { id, signature };
}

export function getAnonymousId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ANONYMOUS_ID_KEY);
}

export interface ApiClientOptions extends RequestInit {
  token?: string;
  data?: unknown;
  timeout?: number;
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

    if (cacheKey && inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const result = await this.performFetch<T>(url, {
          method,
          token,
          data,
          headers: customHeaders,
          timeout,
          signal: customSignal,
          ...fetchOptions,
        });
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
  ): Promise<T> {
    const {
      token,
      data,
      headers: customHeaders,
      timeout,
      signal: customSignal,
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...customHeaders,
    };

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const anon = await getAnonymousIdWithSignature();
    if (anon) {
      (headers as Record<string, string>)['x-anonymous-id'] = anon.id;
      if (anon.signature) {
        (headers as Record<string, string>)['x-anonymous-signature'] =
          anon.signature;
      }
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
      cache: 'no-cache', // Use no-cache instead of no-store to allow bfcache while still revalidating
      signal: customSignal || controller.signal,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const isDev = process.env.NODE_ENV === 'development';
    let attempts = 0;
    const maxAttempts = isDev ? 2 : 1;

    while (attempts < maxAttempts) {
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
        attempts++;
        const networkError = error as NetworkError;
        const isConnectionError =
          error instanceof Error &&
          (networkError.message.includes('ECONNREFUSED') ||
            networkError.code === 'ECONNREFUSED' ||
            (networkError.cause instanceof Error &&
              networkError.cause.message.includes('ECONNREFUSED')) ||
            networkError.cause?.code === 'ECONNREFUSED');

        if (isConnectionError && attempts < maxAttempts) {
          if (isDev) {
            console.warn(
              `[apiClient] Connection refused to ${url}. Attempt ${attempts}/${maxAttempts}. (Cause: ${
                networkError.cause?.message || networkError.message
              }) Retrying in 2s...`,
            );
          }
          // Wait a bit before retrying to give the backend time to wake up
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        if (isDev && attempts === maxAttempts && isConnectionError) {
          console.error(
            `[apiClient] Final attempt failed. Connection refused to ${url}. Please ensure the backend is running and reachable.`,
          );
        }

        clearTimeout(id);
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
