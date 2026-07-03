import { resolveApiBase } from '@/shared/lib/api-base';

import { type UserRole } from '../model/types';

export type AuthUserProfile = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
  equippedGameSkinId?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  accessTokenExpiresAt?: string | Date | null;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: string | Date | null;
  user: AuthUserProfile;
};

type TokenExchangeResponse = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  scope?: string;
  expiresIn?: number;
};

function api(url: string): string {
  const base = resolveApiBase();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const separator = url.startsWith('/') ? '' : '/';
  return `${base}${separator}${url}`;
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

function apiHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...extra,
  };
}

export async function registerLocal(params: {
  email: string;
  password: string;
  username: string;
  referralCode?: string;
}): Promise<AuthUserProfile> {
  const res = await fetch(api('/auth/register'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
  });
  return readJson<AuthUserProfile>(res);
}

export async function checkUsernameAvailable(
  username: string,
): Promise<{ available: boolean }> {
  const res = await fetch(
    api(`/auth/check/username/${encodeURIComponent(username)}`),
  );
  return readJson<{ available: boolean }>(res);
}

export async function checkEmailAvailable(
  email: string,
): Promise<{ available: boolean }> {
  const res = await fetch(
    api(`/auth/check/email/${encodeURIComponent(email)}`),
  );
  return readJson<{ available: boolean }>(res);
}

export async function loginLocal(params: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await fetch(api('/auth/login'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
  });
  return readJson<LoginResponse>(res);
}

export async function exchangeOAuthCode(params: {
  code: string;
  codeVerifier?: string;
  redirectUri?: string;
}): Promise<TokenExchangeResponse> {
  const res = await fetch(api('/auth/token'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
  });
  return readJson<TokenExchangeResponse>(res);
}

export async function loginOAuthSession(params: {
  provider: 'google';
  accessToken?: string;
  idToken?: string;
}): Promise<LoginResponse> {
  const res = await fetch(api('/auth/oauth/login'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
  });
  return readJson<LoginResponse>(res);
}

export async function requestPasswordReset(email: string): Promise<void> {
  // Endpoint is account-enumeration-safe on the BE — it always 204s, even
  // when the email maps to no user. We treat any non-2xx as a generic
  // failure so the UI can show a retry-friendly error instead of leaking
  // server detail.
  const res = await fetch(api('/auth/forgot'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
}

export async function confirmPasswordReset(params: {
  token: string;
  password: string;
}): Promise<void> {
  const res = await fetch(api('/auth/reset'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    // 401 = token invalid/expired; surfaced as a typed error code so the
    // view can render the right copy ("link expired, request a new one")
    // instead of a generic server error.
    if (res.status === 401) {
      throw new Error('TOKEN_INVALID');
    }
    throw new Error(`Request failed (${res.status})`);
  }
}

export async function refreshSession(
  refreshToken: string,
): Promise<LoginResponse> {
  const res = await fetch(api('/auth/refresh'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  });
  return readJson<LoginResponse>(res);
}

export async function refreshSessionFromCookie(): Promise<LoginResponse> {
  const res = await fetch(api('/auth/refresh'), {
    method: 'POST',
    headers: apiHeaders(),
    credentials: 'include',
    body: JSON.stringify({}),
  });
  return readJson<LoginResponse>(res);
}

export async function fetchProfile(
  accessToken?: string,
): Promise<AuthUserProfile> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetch(api('/auth/me'), {
    headers,
    credentials: 'include',
  });
  return readJson<AuthUserProfile>(res);
}

export interface DiscoveryDocument {
  authorization_endpoint?: string;
  token_endpoint?: string;
  revocation_endpoint?: string;
}

export async function fetchDiscovery(
  issuer: string,
): Promise<DiscoveryDocument> {
  const url = `${issuer.replace(/\/?$/, '/')}.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch OAuth discovery document');
  }
  return res.json();
}

export async function revokeProviderToken(
  endpoint: string,
  token: string,
  clientId?: string,
): Promise<void> {
  const params = new URLSearchParams();
  params.set('token', token);
  if (clientId) {
    params.set('client_id', clientId);
  }
  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
}
