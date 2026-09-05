'use client';

import { type OAuthProvider } from '@/features/auth/hooks/useAuthForm';
import { resolveAuthRedirectUri } from '@/shared/config/auth';
import { OAUTH } from '@/shared/config/constants';

const CODE_VERIFIER_KEY = 'oauth_code_verifier';
const STATE_KEY = 'oauth_state';

function storeSessionValue(key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const storage = window.sessionStorage;
    if (!storage) return;
    if (value) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

function generateRandomString(length: number): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto?.getRandomValues
  ) {
    globalThis.crypto.getRandomValues(randomValues);
  } else {
    throw new Error(
      'Cryptographically secure random number generation is not available',
    );
  }
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    '',
  );
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function createCodeChallenge(verifier: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('PKCE requires window.crypto.subtle support');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export interface OAuthRedirectParams {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  setRedirecting: (redirecting: boolean) => void;
}

export async function redirectToAppleOAuth(
  params: OAuthRedirectParams,
): Promise<void> {
  const { setError, setLoading, setRedirecting } = params;
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  if (!clientId) {
    setError('Apple OAuth client ID is not configured');
    return;
  }

  const redirectUri = resolveAuthRedirectUri();
  if (!redirectUri) {
    setError('Unable to resolve redirect URI');
    return;
  }

  try {
    setLoading(true);
    setRedirecting(true);

    const url = new URL('https://appleid.apple.com/auth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code id_token');
    url.searchParams.set('scope', 'name email');
    url.searchParams.set('response_mode', 'form_post');

    window.location.assign(url.toString());
  } catch (error) {
    setLoading(false);
    setRedirecting(false);
    setError(error instanceof Error ? error.message : String(error));
  }
}

export async function redirectToDiscordOAuth(
  params: OAuthRedirectParams,
): Promise<void> {
  const { setError, setLoading, setRedirecting } = params;
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  if (!clientId) {
    setError('Discord OAuth client ID is not configured');
    return;
  }

  const redirectUri = resolveAuthRedirectUri();
  if (!redirectUri) {
    setError('Unable to resolve redirect URI');
    return;
  }

  try {
    setLoading(true);
    setRedirecting(true);

    const stateParam = generateRandomString(OAUTH.STATE_LENGTH);
    storeSessionValue(STATE_KEY, stateParam);

    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify email');
    url.searchParams.set('state', stateParam);

    window.location.assign(url.toString());
  } catch (error) {
    setLoading(false);
    setRedirecting(false);
    setError(error instanceof Error ? error.message : String(error));
  }
}

export async function redirectToGoogleOAuth(
  params: OAuthRedirectParams & { clientId: string; issuer: string },
): Promise<void> {
  const { setError, setLoading, setRedirecting, clientId, issuer } = params;

  const redirectUri = resolveAuthRedirectUri();
  if (!redirectUri) {
    setError('Unable to resolve redirect URI');
    return;
  }

  try {
    setLoading(true);
    setRedirecting(true);

    // Fetch discovery document
    const url = `${issuer.replace(/\/?$/, '')}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch OAuth discovery document');
    }
    const discovery = (await res.json()) as { authorization_endpoint?: string };

    const authEndpoint =
      discovery.authorization_endpoint ??
      `${issuer.replace(/\/?$/, '')}/o/oauth2/v2/auth`;
    const verifier = generateRandomString(OAUTH.VERIFIER_LENGTH);
    const challenge = await createCodeChallenge(verifier);
    const stateParam = generateRandomString(OAUTH.STATE_LENGTH);

    storeSessionValue(CODE_VERIFIER_KEY, verifier);
    storeSessionValue(STATE_KEY, stateParam);

    const authUrl = new URL(authEndpoint);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', stateParam);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.assign(authUrl.toString());
  } catch (error) {
    setLoading(false);
    setRedirecting(false);
    setError(error instanceof Error ? error.message : String(error));
  }
}
