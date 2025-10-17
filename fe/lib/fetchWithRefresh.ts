import type { SessionTokensSnapshot } from '@/stores/sessionTokens';

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
    return firstResponse;
  }

  try {
    const refreshed = await refreshTokens();
    const nextToken = refreshed.accessToken;
    if (!nextToken || nextToken === accessToken) {
      return firstResponse;
    }
    return await performFetch(url, init, nextToken);
  } catch {
    return firstResponse;
  }
}
