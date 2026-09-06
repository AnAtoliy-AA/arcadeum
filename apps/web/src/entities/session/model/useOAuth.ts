'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@/shared/hooks/useMutation';

import {
  exchangeOAuthCode,
  loginOAuthSession,
  fetchDiscovery,
  revokeProviderToken,
  logoutSession,
  type LoginResponse,
} from '@/entities/session/api/authApi';
import { type SessionTokensValue } from '@/entities/session/model/useSessionTokens';
import { type SessionTokensSnapshot } from './types';
import { authConfig, resolveAuthRedirectUri } from '@/shared/config/auth';
import { OAUTH } from '@/shared/config/constants';
import {
  redirectToAppleOAuth,
  redirectToDiscordOAuth,
  redirectToGoogleOAuth,
} from './oauth-providers';

interface OAuthDiscovery {
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  revocation_endpoint?: string;
  jwks_uri?: string;
}

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

// Simple discovery cache to replace queryClient.fetchQuery
let discoveryCache: {
  promise: Promise<OAuthDiscovery>;
  timestamp: number;
} | null = null;

async function getCachedDiscovery(issuer: string): Promise<OAuthDiscovery> {
  const now = Date.now();
  if (
    discoveryCache &&
    now - discoveryCache.timestamp < OAUTH.DISCOVERY_CACHE_TIME
  ) {
    return discoveryCache.promise;
  }

  const promise = fetchDiscovery(issuer) as unknown as Promise<OAuthDiscovery>;
  discoveryCache = { promise, timestamp: now };
  return promise;
}

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

// Module-level guard to prevent multiple hook instances from handling the same code simultaneously
const handledCodes = new Set<string>();

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
    role: response.user?.role ?? null,
    xp: response.user?.xp ?? 0,
  });
}

export type UseOAuthResult = OAuthState & {
  startOAuth: (provider?: 'google' | 'apple' | 'discord') => Promise<void>;
  logout: () => Promise<void>;
};

export function useOAuth(session: SessionTokensValue): UseOAuthResult {
  const router = useRouter();
  const [state, setState] = useState<OAuthState>(defaultState);
  const searchParams = useSearchParams();
  const processingRef = useRef(false);
  const providerTokenRef = useRef<string | null>(null);
  const handledCallbackRef = useRef(false);

  // Exchange Code Mutation
  const { mutateAsync: exchangeCodeMutation } = useMutation({
    mutationFn: exchangeOAuthCode,
  });

  // Login Session Mutation
  const { mutateAsync: loginSessionMutation } = useMutation({
    mutationFn: loginOAuthSession,
  });

  const startOAuth = useCallback(
    async (provider: 'google' | 'apple' | 'discord' = 'google') => {
      const setStateHelper = {
        setError: (error: string) => {
          setState((current) => ({ ...current, error }));
        },
        setLoading: (loading: boolean) => {
          setState((current) => ({ ...current, loading }));
        },
        setRedirecting: (redirecting: boolean) => {
          setState((current) => ({ ...current, isRedirecting: redirecting }));
        },
      };

      if (provider === 'apple') {
        return redirectToAppleOAuth(setStateHelper);
      }

      if (provider === 'discord') {
        return redirectToDiscordOAuth(setStateHelper);
      }

      // Default Google OAuth flow
      if (!authConfig.clientId) {
        setStateHelper.setError('OAuth client ID is not configured');
        return;
      }

      return redirectToGoogleOAuth({
        ...setStateHelper,
        clientId: authConfig.clientId,
        issuer: authConfig.issuer,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    const providerToken = providerTokenRef.current;
    providerTokenRef.current = null;
    setState(defaultState);
    clearOAuthSessionState();
    if (providerToken) {
      try {
        const discovery = await getCachedDiscovery(authConfig.issuer);
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
    await logoutSession().catch(() => {});
    await session.clearTokens();
  }, [session]);

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
      let navigatedAway = false;
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

        // Prevent multiple simultaneous exchanges of the same code
        if (handledCodes.has(code)) {
          return;
        }
        handledCodes.add(code);

        const expectedState = readSessionValue(STATE_KEY);
        if (!expectedState || !stateParam || expectedState !== stateParam) {
          throw new Error('OAuth state mismatch. Please try again.');
        }

        const verifier = readSessionValue(CODE_VERIFIER_KEY);
        if (!verifier) {
          throw new Error('Login session expired. Please try again.');
        }
        const redirectUri = resolveAuthRedirectUri();

        const tokenResponse = await exchangeCodeMutation({
          code,
          codeVerifier: verifier,
          redirectUri,
        });
        providerTokenRef.current = tokenResponse.accessToken ?? null;

        // Determine provider from the issuer or state
        const provider = 'google'; // Default to Google for now

        const sessionResponse = await loginSessionMutation({
          provider,
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

        // Navigate home without a hard page reload.
        // SessionRoleSync will recover the session from httpOnly
        // cookies if Zustand tokens aren't available yet.
        clearOAuthSessionState();
        navigatedAway = true;
        router.replace('/');
        router.refresh();
        return;
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
        if (!navigatedAway) {
          clearOAuthSessionState();
        }
        processingRef.current = false;
        if (!navigatedAway) {
          try {
            // Clear URL parameters to prevent the callback from firing again on reload.
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            url.searchParams.delete('error');
            url.searchParams.delete('error_description');
            window.history.replaceState({}, '', url.toString());
          } catch {
            // ignore window history failures
          }
        }
      }
    },
    [session, exchangeCodeMutation, loginSessionMutation, router],
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
