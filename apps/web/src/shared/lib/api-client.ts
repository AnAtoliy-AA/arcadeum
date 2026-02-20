import { resolveApiUrl } from './api-base';
import { HttpStatus } from './http-status';

export function getAnonymousId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('aico_anon_id');
  if (!id) {
    id = `anon_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('aico_anon_id', id);
  }
  return id;
}
export interface ApiClientOptions extends RequestInit {
  token?: string;
  data?: unknown;
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

export const apiClient = {
  async fetch<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const { token, data, headers: customHeaders, ...fetchOptions } = options;
    const url = resolveApiUrl(path);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const anonId = getAnonymousId();
    if (anonId) {
      (headers as Record<string, string>)['x-anonymous-id'] = anonId;
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      cache: 'no-store', // Disable caching to ensure fresh data
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

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
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
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

  delete<T>(path: string, options?: ApiClientOptions) {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  },
};
