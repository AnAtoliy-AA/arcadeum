import { useEffect, useRef, useState } from 'react';
import { AuthorizeResult } from 'react-native-app-auth';
import { loginOAuthSession, loginWithOAuth, logoutOAuth } from '../api/authApi';
import { Platform } from 'react-native';
import { resolveApiBase } from '@/lib/apiBase';
import { authConfig } from '../config/authConfig';
import { useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { useSessionTokens } from '@/stores/sessionTokens';
import type { LoginResponse } from '../api/authApi';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthorizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    state?: string;
  }>();
  const navState = useRootNavigationState();
  const isReady = !!navState?.key;
  const processedRef = useRef(false);
  const {
    tokens: sessionTokens,
    hydrated: sessionHydrated,
    setTokens: persistTokens,
    clearTokens: clearStoredTokens,
  } = useSessionTokens();

  type ExtendedAuthorizeResult = AuthorizeResult & {
    refreshToken?: string;
    idToken?: string;
  };

  interface TokenExchangeResponse {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    scope?: string;
    expiresIn?: number;
    message?: string; // backend error shape
    error?: string; // possible provider error passthrough
    refreshTokenExpiresAt?: string;
  }

  const login = async () => {
    try {
      const result = await loginWithOAuth();
      const extended = result as ExtendedAuthorizeResult;
      if (!extended.accessToken && !extended.idToken) {
        throw new Error('OAuth provider did not return usable tokens');
      }

      const session = await loginOAuthSession({
        provider: 'google',
        accessToken: extended.accessToken,
        idToken: extended.idToken,
      });

      await persistTokens({
        provider: 'oauth',
        accessToken: session.accessToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt ?? null,
        refreshToken: session.refreshToken ?? null,
        tokenType: 'Bearer',
        refreshTokenExpiresAt: session.refreshTokenExpiresAt ?? null,
        userId: session.user?.id ?? null,
        email: session.user?.email ?? null,
        username: session.user?.username ?? null,
        displayName:
          session.user?.displayName ??
          session.user?.username ??
          session.user?.email ??
          null,
      });

      setAuthState(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const logout = async () => {
    const tokens = authState
      ? {
          accessToken: authState.accessToken,
          refreshToken: (authState as ExtendedAuthorizeResult).refreshToken,
        }
      : { accessToken: undefined, refreshToken: undefined };
    await logoutOAuth(tokens);
    await clearStoredTokens();
    setAuthState(null);
  };

  // Handle web redirect result coming back to /auth via /auth/callback
  useEffect(() => {
    if (!isReady || Platform.OS !== 'web' || processedRef.current) return;
    const codeFromParams = params?.code ? String(params.code) : undefined;
    const errorFromParams = params?.error ? String(params.error) : undefined;
    const codeFromSearch =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('code') || undefined
        : undefined;

    if (errorFromParams) {
      setError(errorFromParams);
      processedRef.current = true;
      if (typeof window !== 'undefined') {
        const url = window.location.pathname;
        window.history.replaceState({}, '', url);
      }
      return;
    }

    const code = codeFromParams || codeFromSearch;
    if (code && !authState) {
      (async () => {
        try {
          const codeVerifier =
            typeof window !== 'undefined'
              ? sessionStorage.getItem('oauth_code_verifier') || undefined
              : undefined;
          const apiBase = resolveApiBase();
          const payload = JSON.stringify({
            code,
            codeVerifier,
            redirectUri: authConfig.redirectUrl,
          });
          const controller = new AbortController();
          const fetchAuthToken = async () => {
            return fetchWithRefresh(
              `${apiBase}/auth/token`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                signal: controller.signal,
              },
              {
                suppressErrorToast: true,
              },
            );
          };
          let resp = await fetchAuthToken();
          if (resp.status === 401) {
            controller.abort();

            const MAX_ATTEMPTS = 3;
            let attempt = 1;
            let lastError: Error | null = null;

            while (attempt <= MAX_ATTEMPTS) {
              try {
                resp = await fetch(`${apiBase}/auth/token`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: payload,
                });

                if (resp.ok || resp.status !== 401) {
                  lastError = null;
                  break;
                }
              } catch (fetchErr) {
                lastError =
                  fetchErr instanceof Error
                    ? fetchErr
                    : new Error(String(fetchErr));
              }

              attempt += 1;
            }

            if (!resp.ok && resp.status === 401) {
              const finalError =
                lastError ??
                new Error(
                  'Unable to complete authentication. Please try again later.',
                );
              throw finalError;
            }
          }
          let json: TokenExchangeResponse = {};
          try {
            json = (await resp.json()) as TokenExchangeResponse;
          } catch {
            // leave json as empty object; will trigger generic error if needed
          }
          if (!resp.ok) {
            const msg = json.message || json.error || 'Token exchange failed';
            throw new Error(msg);
          }
          const expiration = json.expiresIn
            ? new Date(Date.now() + (json.expiresIn ?? 0) * 1000).toISOString()
            : undefined;
          const baseResult: Partial<ExtendedAuthorizeResult> = {
            accessToken: json.accessToken || '',
            tokenType: json.tokenType || 'Bearer',
            scopes: json.scope ? json.scope.split(' ') : authConfig.scopes,
            tokenAdditionalParameters: { authorizationCode: code },
          };
          if (expiration) baseResult.accessTokenExpirationDate = expiration;
          if (json.refreshToken) baseResult.refreshToken = json.refreshToken;
          if (json.idToken) baseResult.idToken = json.idToken;
          const authorizeResult = baseResult as ExtendedAuthorizeResult;

          if (!authorizeResult.accessToken && !authorizeResult.idToken) {
            throw new Error('OAuth provider did not return usable tokens');
          }

          const session: LoginResponse = await loginOAuthSession({
            provider: 'google',
            accessToken: authorizeResult.accessToken,
            idToken: authorizeResult.idToken ?? json.idToken,
          });

          await persistTokens({
            provider: 'oauth',
            accessToken: session.accessToken,
            accessTokenExpiresAt: session.accessTokenExpiresAt ?? null,
            refreshToken: session.refreshToken ?? null,
            tokenType: 'Bearer',
            refreshTokenExpiresAt: session.refreshTokenExpiresAt ?? null,
            userId: session.user?.id ?? null,
            email: session.user?.email ?? null,
            username: session.user?.username ?? null,
            displayName:
              session.user?.displayName ??
              session.user?.username ??
              session.user?.email ??
              null,
          });
          setAuthState(authorizeResult as AuthorizeResult);
          setError(null);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError(String(err));
          }
        } finally {
          processedRef.current = true;
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem('oauth_code_verifier');
              sessionStorage.removeItem('oauth_state');
            } catch {}
            const url = window.location.pathname; // strip query params
            window.history.replaceState({}, '', url);
          }
        }
      })();
    }
  }, [isReady, params, authState, persistTokens]);

  return {
    authState,
    error,
    login,
    logout,
    sessionTokens,
    sessionHydrated,
  };
}
