import { authorize, AuthorizeResult, revoke } from 'react-native-app-auth';
import * as AuthSession from 'expo-auth-session';
import { platform } from '@/constants/platform';
import { authConfig } from '../config/authConfig';
import {
  fetchWithRefresh,
  type FetchWithRefreshOptions,
} from '@/lib/fetchWithRefresh';
import { resolveApiBase } from '@/lib/apiBase';

function validateConfig() {
  const missing: string[] = [];
  if (!authConfig.clientId) missing.push('clientId');
  if (!authConfig.redirectUrl) missing.push('redirectUrl');
  if (!authConfig.issuer) missing.push('issuer');
  if (missing.length) {
    throw new Error(
      `Missing OAuth config for ${platform.os}. Missing: ${missing.join(', ')}. Check your .env and app.config.ts.`,
    );
  }
}

function logDevConfig(label: string) {
  if (!__DEV__) return;
  // Safe to log in dev; avoid secrets
  // Shows high-level config only
  // Do not log tokens
  console.debug(`${label} OAuth config`, {
    clientId: authConfig.clientId,
    redirectUrl: authConfig.redirectUrl,
    issuer: authConfig.issuer,
    scopes: authConfig.scopes,
  });
}

async function startWebAuth(): Promise<AuthorizeResult> {
  const discovery = await AuthSession.fetchDiscoveryAsync(authConfig.issuer);
  const request = new AuthSession.AuthRequest({
    clientId: authConfig.clientId!,
    redirectUri: authConfig.redirectUrl!,
    scopes: authConfig.scopes,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });
  const authUrl = await request.makeAuthUrlAsync(discovery);
  try {
    sessionStorage.setItem('oauth_code_verifier', request.codeVerifier || '');
    sessionStorage.setItem('oauth_state', request.state || '');
  } catch {}
  window.location.assign(authUrl);
  // Navigation will unload the page; return a pending promise to satisfy typing.
  return new Promise<AuthorizeResult>(() => {});
}

export async function loginWithOAuth(): Promise<AuthorizeResult> {
  validateConfig();

  if (platform.isWeb) {
    logDevConfig('Web');
    return startWebAuth();
  }

  if (platform.isAndroid) logDevConfig('Android');
  if (platform.isIos) logDevConfig('iOS');

  try {
    return await authorize(authConfig);
  } catch (e: unknown) {
    const message = (e as Error)?.message || String(e);
    console.error(`[${platform.os}] OAuth authorize failed:`, message);
    throw e;
  }
}

export async function logoutOAuth(params: {
  accessToken?: string;
  refreshToken?: string;
}) {
  const { accessToken, refreshToken } = params;

  try {
    if (platform.isWeb) {
      if (!accessToken) return; // nothing to revoke client-side
      const discovery = await AuthSession.fetchDiscoveryAsync(
        authConfig.issuer,
      );
      if (discovery.revocationEndpoint) {
        await AuthSession.revokeAsync(
          { token: accessToken, clientId: authConfig.clientId! },
          discovery,
        );
      }
      return;
    }

    // Native (Android/iOS) — revoke access and refresh tokens if present
    if (accessToken) {
      await revoke(authConfig, {
        tokenToRevoke: accessToken,
        sendClientId: true,
      });
    }
    if (refreshToken) {
      await revoke(authConfig, {
        tokenToRevoke: refreshToken,
        sendClientId: true,
      });
    }
  } catch (e: unknown) {
    const message = (e as Error)?.message || String(e);
    console.warn(`[${platform.os}] OAuth revoke failed:`, message);
  }
}

// ----- Local Auth (email/password) API helpers -----

export interface AuthUserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

interface RegisterResponse extends AuthUserProfile {
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt?: string | Date;
  refreshToken?: string;
  refreshTokenExpiresAt?: string | Date;
  user: AuthUserProfile;
}

type MeResponse = AuthUserProfile;

function apiBase(): string {
  return resolveApiBase();
}

export async function registerLocal(
  email: string,
  password: string,
  username: string,
): Promise<RegisterResponse> {
  const res = await fetch(`${apiBase()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Registration failed');
  }
  return res.json() as Promise<RegisterResponse>;
}

export async function loginLocal(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${apiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Login failed');
  }
  return res.json() as Promise<LoginResponse>;
}

export async function loginOAuthSession(params: {
  provider: 'google';
  accessToken?: string;
  idToken?: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${apiBase()}/auth/oauth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'OAuth session exchange failed');
  }
  return res.json() as Promise<LoginResponse>;
}

export async function refreshSession(
  refreshToken: string,
): Promise<LoginResponse> {
  const res = await fetch(`${apiBase()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Refresh failed');
  }
  return res.json() as Promise<LoginResponse>;
}

export async function me(
  accessToken: string,
  options?: FetchWithRefreshOptions,
): Promise<MeResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/auth/me`,
    {},
    {
      accessToken,
      refreshTokens: options?.refreshTokens,
    },
  );
  if (!response.ok) throw new Error('Unauthorized');
  return response.json() as Promise<MeResponse>;
}
