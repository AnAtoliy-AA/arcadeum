import { authorize, AuthorizeResult, revoke } from 'react-native-app-auth';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import { platform } from '@/constants/platform';
import { authConfig } from '../config/authConfig';

function validateConfig() {
  const missing: string[] = [];
  if (!authConfig.clientId) missing.push('clientId');
  if (!authConfig.redirectUrl) missing.push('redirectUrl');
  if (!authConfig.issuer) missing.push('issuer');
  if (missing.length) {
    throw new Error(
  `Missing OAuth config for ${platform.os}. Missing: ${missing.join(', ')}. Check your .env and app.config.ts.`
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
  } catch (e: any) {
    const message = e?.message || String(e);
    console.error(`[${platform.os}] OAuth authorize failed:`, message);
    throw e;
  }
}

export async function logoutOAuth(params: { accessToken?: string; refreshToken?: string }) {
  const { accessToken, refreshToken } = params;

  try {
    if (platform.isWeb) {
      if (!accessToken) return; // nothing to revoke client-side
      const discovery = await AuthSession.fetchDiscoveryAsync(authConfig.issuer);
      if (discovery.revocationEndpoint) {
        await AuthSession.revokeAsync({ token: accessToken, clientId: authConfig.clientId! }, discovery);
      }
      return;
    }

    // Native (Android/iOS) — revoke access and refresh tokens if present
    if (accessToken) {
      await revoke(authConfig as any, { tokenToRevoke: accessToken, sendClientId: true });
    }
    if (refreshToken) {
      await revoke(authConfig as any, { tokenToRevoke: refreshToken, sendClientId: true });
    }
  } catch (e: any) {
    const message = e?.message || String(e);
    console.warn(`[${platform.os}] OAuth revoke failed:`, message);
  }
}

// ----- Local Auth (email/password) API helpers -----

export interface AuthUserProfile {
  id: string;
  email: string;
  username: string;
}

interface RegisterResponse extends AuthUserProfile {
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string | Date;
  user: AuthUserProfile;
}

type MeResponse = AuthUserProfile;

function apiBase(): string {
  const extra = (Constants as any)?.expoConfig?.extra as Record<string, any> | undefined;
  const raw = (extra?.API_BASE_URL as string | undefined) || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const normalized = raw.replace(/\/$/, '');

  if (platform.isWeb) {
    return normalized;
  }

  return resolveDeviceAwareBase(normalized);
}

function resolveDeviceAwareBase(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    if (!isLocalHost(parsed.hostname)) {
      return urlString;
    }

    const overrideHost = pickHostOverride();
    if (overrideHost) {
      parsed.hostname = overrideHost;
      return parsed.toString().replace(/\/$/, '');
    }

    const hostOverride = deriveDevServerHost();
    if (hostOverride) {
      parsed.hostname = hostOverride;
      return parsed.toString().replace(/\/$/, '');
    }

    if (platform.isAndroid) {
      parsed.hostname = '10.0.2.2';
      return parsed.toString().replace(/\/$/, '');
    }
  } catch {
    // Swallow parse errors and fall through to original urlString
  }
  return urlString;
}

export function resolveApiBase(): string {
  return apiBase();
}

function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1';
}

function deriveDevServerHost(): string | undefined {
  const expoConfig = Constants as any;
  const expoGo = expoConfig?.expoGoConfig ?? {};
  const manifest = expoConfig?.manifest ?? {};
  const manifest2 = expoConfig?.manifest2 ?? {};

  const candidates: (string | undefined)[] = [
    expoGo.debuggerHost,
    expoGo.hostUri,
    expoGo.url,
    expoConfig?.expoConfig?.hostUri,
    manifest.debuggerHost,
    manifest.hostUri,
    manifest2?.extra?.expoGo?.developer?.host,
  ];

  for (const candidate of candidates) {
    const host = extractRemoteHost(candidate);
    if (host && !isLocalHost(host)) {
      return host;
    }
  }

  return undefined;
}

function pickHostOverride(): string | undefined {
  const extra = (Constants as any)?.expoConfig?.extra as Record<string, unknown> | undefined;
  const envValue = process.env.EXPO_PUBLIC_ANDROID_DEV_HOST as string | undefined;
  const extraValue = (extra?.ANDROID_DEV_HOST as string | undefined) ?? (extra?.androidDevHost as string | undefined);

  const host = extractRemoteHost(envValue ?? extraValue);
  if (host && !isLocalHost(host)) {
    return host;
  }
  return undefined;
}

function extractRemoteHost(candidate?: string): string | undefined {
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate.includes('://') ? candidate : `http://${candidate}`);
    return url.hostname;
  } catch {
    const withoutScheme = candidate.replace(/^[a-zA-Z]+:\/\//, '');
    const host = withoutScheme.split(':')[0]?.split('/')[0]?.trim();
    return host || undefined;
  }
}

export async function registerLocal(email: string, password: string, username: string): Promise<RegisterResponse> {
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

export async function loginLocal(email: string, password: string): Promise<LoginResponse> {
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

export async function me(accessToken: string): Promise<MeResponse> {
  const res = await fetch(`${apiBase()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json() as Promise<MeResponse>;
}
