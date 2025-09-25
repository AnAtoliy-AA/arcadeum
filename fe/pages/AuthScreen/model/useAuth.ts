import { useEffect, useRef, useState } from 'react';
import { AuthorizeResult } from 'react-native-app-auth';
import { loginWithOAuth, logoutOAuth } from '../api/authApi';
import { Platform } from 'react-native';
import { authConfig } from '../config/authConfig';
import { useLocalSearchParams, useRootNavigationState } from 'expo-router';
import Constants from 'expo-constants';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthorizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ code?: string; error?: string; state?: string }>();
  const navState = useRootNavigationState();
  const isReady = !!navState?.key;
  const processedRef = useRef(false);

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
    error?: string;   // possible provider error passthrough
  }

  const login = async () => {
    try {
      const result = await loginWithOAuth();
      setAuthState(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const logout = async () => {
    const tokens = authState
      ? { accessToken: authState.accessToken, refreshToken: (authState as ExtendedAuthorizeResult).refreshToken }
      : { accessToken: undefined, refreshToken: undefined };
    await logoutOAuth(tokens);
    setAuthState(null);
  };

  // Handle web redirect result coming back to /auth via /auth/callback
  useEffect(() => {
    if (!isReady || Platform.OS !== 'web' || processedRef.current) return;
    const codeFromParams = params?.code ? String(params.code) : undefined;
    const errorFromParams = params?.error ? String(params.error) : undefined;
    const codeFromSearch = typeof window !== 'undefined'
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
          const codeVerifier = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_code_verifier') || undefined : undefined;
          const maybeExtra = (Constants.expoConfig as any)?.extra as Record<string, unknown> | undefined;
          const apiBaseRaw = (maybeExtra?.API_BASE_URL as string | undefined) || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
          const apiBase = apiBaseRaw.replace(/\/$/, '');
          const resp = await fetch(`${apiBase}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, codeVerifier, redirectUri: authConfig.redirectUrl }),
          });
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
  }, [isReady, params, authState]);

  return {
    authState,
    error,
    login,
    logout,
  };
}
