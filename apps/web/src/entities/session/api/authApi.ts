import { resolveApiBase } from '@/shared/lib/api-base';

/** Available user roles */
export const USER_ROLES = [
  'free',
  'premium',
  'vip',
  'supporter',
  'moderator',
  'tester',
  'developer',
  'admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type AuthUserProfile = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
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

export async function registerLocal(params: {
  email: string;
  password: string;
  username: string;
}): Promise<AuthUserProfile> {
  const res = await fetch(api('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return readJson<AuthUserProfile>(res);
}

export async function loginLocal(params: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await fetch(api('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return readJson<LoginResponse>(res);
}

export async function refreshSession(
  refreshToken: string,
): Promise<LoginResponse> {
  const res = await fetch(api('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return readJson<LoginResponse>(res);
}

export async function fetchProfile(
  accessToken: string,
): Promise<AuthUserProfile> {
  const res = await fetch(api('/auth/me'), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
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
