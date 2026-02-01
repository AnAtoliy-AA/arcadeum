'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  exchangeOAuthCode,
  loginOAuthSession,
  fetchDiscovery,
  revokeProviderToken,
  type LoginResponse,
} from '@/entities/session/api/authApi';
import {
  type SessionTokensValue,
  type SessionTokensSnapshot,
} from '@/entities/session/model/useSessionTokens';
import { authConfig, resolveAuthRedirectUri } from '@/shared/config/auth';
import { OAUTH } from '@/shared/config/constants';

const CODE_VERIFIER_KEY = 'oauth_code_verifier';
const STATE_KEY = 'oauth_state';

type OAuthState = {
  loading: boolean;
  isRedirecting: boolean;
  error: string | null;
  authorizationCode: string | null;
  providerAccessToken: string | null;
};

const defaultState: OAuthState = {
  loading: false,
  isRedirecting: false,
  error: null,
  authorizationCode: null,
  providerAccessToken: null,
};

function storeSessionValue(key: string, value: string | null) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const storage = window.sessionStorage;
    if (!storage) {
      return;
    }
    if (value) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

function readSessionValue(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const storage = window.sessionStorage;
    if (!storage) {
      return null;
    }
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function clearOAuthSessionState() {
  storeSessionValue(CODE_VERIFIER_KEY, null);
  storeSessionValue(STATE_KEY, null);
}

function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateRandomString(length: number): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < length; i += 1) {
      randomValues[i] = Math.floor(Math.random() * charset.length);
    }
  }
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
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

async function applySessionResponse(
  session: SessionTokensValue,
  response: LoginResponse,
  provider: 'oauth',
): Promise<SessionTokensSnapshot> {
  return session.setTokens({
    provider,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt ?? null,
    refreshToken: response.refreshToken ?? null,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
    tokenType: 'Bearer',
    userId: response.user?.id ?? null,
    email: response.user?.email ?? null,
    username: response.user?.username ?? null,
    displayName:
      response.user?.displayName ??
      response.user?.username ??
      response.user?.email ??
      null,
  });
}

// removed local revokeProviderToken

export type UseOAuthResult = OAuthState & {
  startOAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

export function useOAuth(session: SessionTokensValue): UseOAuthResult {
  const [state, setState] = useState<OAuthState>(defaultState);
  const router = useRouter();
  const searchParams = useSearchParams();
  const processingRef = useRef(false);
  const providerTokenRef = useRef<string | null>(null);
  const handledCallbackRef = useRef(false);

  const queryClient = useQueryClient();

  // Exchange Code Mutation
  const { mutateAsync: exchangeCodeMutation } = useMutation({
    mutationFn: exchangeOAuthCode,
  });

  // Login Session Mutation
  const { mutateAsync: loginSessionMutation } = useMutation({
    mutationFn: loginOAuthSession,
  });

  const startOAuth = useCallback(async () => {
    if (!authConfig.clientId) {
      setState((current) => ({
        ...current,
        error: 'OAuth client ID is not configured',
      }));
      return;
    }

    const redirectUri = resolveAuthRedirectUri();
    if (!redirectUri) {
      setState((current) => ({
        ...current,
        error: 'Unable to resolve redirect URI',
      }));
      return;
    }

    try {
      setState((current) => ({
        ...current,
        loading: true,
        isRedirecting: true,
        error: null,
      }));

      // Use queryClient to fetch discovery document with caching
      const discovery = await queryClient.fetchQuery({
        queryKey: ['oauth-discovery', authConfig.issuer],
        queryFn: () => fetchDiscovery(authConfig.issuer),
        staleTime: OAUTH.DISCOVERY_CACHE_TIME,
      });

      const authEndpoint =
        discovery.authorization_endpoint ??
        `${authConfig.issuer.replace(/\/?$/, '')}/o/oauth2/v2/auth`;
      const verifier = generateRandomString(OAUTH.VERIFIER_LENGTH);
      const challenge = await createCodeChallenge(verifier);
      const stateParam = generateRandomString(OAUTH.STATE_LENGTH);
      storeSessionValue(CODE_VERIFIER_KEY, verifier);
      storeSessionValue(STATE_KEY, stateParam);

      const url = new URL(authEndpoint);
      url.searchParams.set('client_id', authConfig.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', authConfig.scopes.join(' '));
      url.searchParams.set('state', stateParam);
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');

      window.location.assign(url.toString());
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        isRedirecting: false,
        error: error instanceof Error ? error.message : String(error),
      }));
      clearOAuthSessionState();
    }
  }, [queryClient]);

  const logout = useCallback(async () => {
    const providerToken = providerTokenRef.current;
    providerTokenRef.current = null;
    setState(defaultState);
    clearOAuthSessionState();
    if (providerToken) {
      // Attempt to revoke using discovery endpoint if available
      try {
        const discovery = await queryClient.fetchQuery({
          queryKey: ['oauth-discovery', authConfig.issuer],
          queryFn: () => fetchDiscovery(authConfig.issuer),
          staleTime: OAUTH.DISCOVERY_CACHE_TIME,
        });
        if (discovery.revocation_endpoint) {
          await revokeProviderToken(
            discovery.revocation_endpoint,
            providerToken,
            authConfig.clientId,
          );
        }
      } catch {
        // Ignore errors during logout
      }
    }
    await session.clearTokens();
  }, [session, queryClient]);

  const handleCallback = useCallback(
    async ({
      code,
      error,
      stateParam,
    }: {
      code?: string | null;
      error?: string | null;
      stateParam?: string | null;
    }) => {
      if (processingRef.current) {
        return;
      }
      processingRef.current = true;
      try {
        if (error) {
          setState((current) => ({
            ...current,
            loading: false,
            isRedirecting: false,
            error,
          }));
          return;
        }

        if (!code) {
          return;
        }

        const expectedState = readSessionValue(STATE_KEY);
        if (expectedState && stateParam && expectedState !== stateParam) {
          throw new Error('OAuth state mismatch. Please try again.');
        }

        const verifier = readSessionValue(CODE_VERIFIER_KEY) ?? undefined;
        const redirectUri = resolveAuthRedirectUri();

        const tokenResponse = await exchangeCodeMutation({
          code,
          codeVerifier: verifier,
          redirectUri,
        });
        providerTokenRef.current = tokenResponse.accessToken ?? null;

        const sessionResponse = await loginSessionMutation({
          provider: 'google',
          accessToken: tokenResponse.accessToken,
          idToken: tokenResponse.idToken,
        });

        const snapshot = await applySessionResponse(
          session,
          sessionResponse,
          'oauth',
        );

        setState((current) => ({
          ...current,
          loading: false,
          isRedirecting: false,
          error: null,
          authorizationCode: code,
          providerAccessToken: tokenResponse.accessToken ?? null,
        }));

        if (snapshot.email) {
          // persist email alongside local auth convenience store
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('web_auth_email', snapshot.email);
            } catch {
              // ignore
            }
          }
        }
      } catch (callbackError) {
        setState((current) => ({
          ...current,
          loading: false,
          isRedirecting: false,
          error:
            callbackError instanceof Error
              ? callbackError.message
              : String(callbackError),
        }));
        await session.clearTokens();
      } finally {
        clearOAuthSessionState();
        processingRef.current = false;
        try {
          router.replace('/auth', { scroll: false });
        } catch {
          // ignore router replace failures
        }
      }
    },
    [router, session, exchangeCodeMutation, loginSessionMutation],
  );

  const paramsKey = searchParams?.toString();

  useEffect(() => {
    if (handledCallbackRef.current) {
      return;
    }
    const code = searchParams?.get('code');
    const error = searchParams?.get('error');
    const stateParam = searchParams?.get('state');
    if (!code && !error) {
      return;
    }
    handledCallbackRef.current = true;
    void handleCallback({ code, error, stateParam });
  }, [handleCallback, paramsKey, searchParams]);

  const value: UseOAuthResult = useMemo(
    () => ({
      ...state,
      startOAuth,
      logout,
    }),
    [state, startOAuth, logout],
  );

  return value;
}
