import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import { emitGlobalError } from '@/lib/globalErrorHandler';

export interface FetchWithRefreshOptions {
  accessToken?: string | null;
  refreshTokens?: () => Promise<SessionTokensSnapshot>;
}

async function performFetch(
  url: string,
  init: RequestInit,
  accessToken?: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(url, { ...init, headers });
}

export async function fetchWithRefresh(
  url: string,
  init: RequestInit = {},
  options: FetchWithRefreshOptions = {},
): Promise<Response> {
  const { accessToken, refreshTokens } = options;
  const firstResponse = await performFetch(url, init, accessToken ?? undefined);

  if (firstResponse.status !== 401 || !refreshTokens) {
    if (!firstResponse.ok) {
      notifyResponseError(firstResponse);
    }
    return firstResponse;
  }

  try {
    const refreshed = await refreshTokens();
    const nextToken = refreshed.accessToken;
    if (!nextToken || nextToken === accessToken) {
      if (!firstResponse.ok) {
        notifyResponseError(firstResponse);
      }
      return firstResponse;
    }
    const retryResponse = await performFetch(url, init, nextToken);
    if (!retryResponse.ok) {
      notifyResponseError(retryResponse);
    }
    return retryResponse;
  } catch {
    if (!firstResponse.ok) {
      notifyResponseError(firstResponse);
    }
    return firstResponse;
  }
}

function notifyResponseError(response: Response) {
  const clone = response.clone();
  void (async () => {
    const message = await extractErrorMessage(clone);
    const fallback = `Request failed (${response.status})`;
    emitGlobalError(message ?? fallback);
  })();
}

async function extractErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const raw = await response.text();
    const trimmed = raw.trim();
    if (!trimmed) {
      return undefined;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        const candidates = [
          parsed?.message,
          parsed?.error,
          parsed?.detail,
          parsed?.title,
        ];
        for (const candidate of candidates) {
          if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate.trim();
          }
          if (Array.isArray(candidate)) {
            const joined = candidate
              .map((item) => (typeof item === 'string' ? item.trim() : ''))
              .filter(Boolean)
              .join(', ');
            if (joined.length > 0) {
              return joined;
            }
          }
        }
      } catch {
        // fall back to the raw text if JSON parsing fails
      }
    }

    return trimmed;
  } catch {
    return undefined;
  }
}
