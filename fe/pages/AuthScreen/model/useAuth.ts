import { useEffect, useRef, useState } from 'react';
import { AuthorizeResult } from 'react-native-app-auth';
import { loginWithOAuth } from '../api/authApi';
import { Platform } from 'react-native';
import { authConfig } from '../config/authConfig';
import { useLocalSearchParams, useRootNavigationState } from 'expo-router';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthorizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ code?: string; error?: string; state?: string }>();
  const navState = useRootNavigationState();
  const isReady = !!navState?.key;
  const processedRef = useRef(false);

  const login = async () => {
    try {
      const result = await loginWithOAuth();
      setAuthState(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const logout = () => {
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
      const pseudo: any = {
        accessToken: '',
        tokenType: 'Bearer',
        scopes: authConfig.scopes,
        tokenAdditionalParameters: { authorizationCode: code },
      };
      setAuthState(pseudo as AuthorizeResult);
      setError(null);
      processedRef.current = true;
      if (typeof window !== 'undefined') {
        const url = window.location.pathname;
        window.history.replaceState({}, '', url);
      }
    }
  }, [isReady, params, authState]);

  return {
    authState,
    error,
    login,
    logout,
  };
}
