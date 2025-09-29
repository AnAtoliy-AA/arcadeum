import { useCallback, useState } from 'react';
import { loginLocal, registerLocal, me } from '../api/authApi';
import { SecureStoreShim } from '@/lib/secureStore';
import { useSessionTokens } from '@/stores/sessionTokens';

interface LocalAuthState {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  loading: boolean;
  error: string | null;
  mode: 'login' | 'register';
}

const EMAIL_KEY = 'auth_email';

async function persist(key: string, value: string | null) {
  try {
    if (value) await SecureStoreShim.setItemAsync(key, value);
    else await SecureStoreShim.deleteItemAsync(key);
  } catch {}
}

export function useLocalAuth() {
  const [state, setState] = useState<LocalAuthState>({
    accessToken: null,
    refreshToken: null,
    email: null,
    loading: false,
    error: null,
    mode: 'login',
  });

  const {
    tokens: sessionTokens,
    hydrated: sessionHydrated,
    setTokens: persistSessionTokens,
    clearTokens: clearSessionTokens,
    reload: reloadSessionTokens,
  } = useSessionTokens();

  const toggleMode = useCallback(() => {
    setState(s => ({ ...s, mode: s.mode === 'login' ? 'register' : 'login', error: null }));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      await registerLocal(email, password);
      // Auto-switch to login mode after success
      setState(s => ({ ...s, mode: 'login', loading: false }));
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const resp = await loginLocal(email, password);
      const snapshot = await persistSessionTokens({
        provider: 'local',
        accessToken: resp.accessToken,
        refreshToken: resp.refreshToken ?? null,
        tokenType: 'Bearer',
        refreshTokenExpiresAt: resp.refreshTokenExpiresAt ?? null,
      });
      await persist(EMAIL_KEY, email);
      setState(s => ({
        ...s,
        accessToken: snapshot.accessToken,
        refreshToken: snapshot.refreshToken,
        email,
        loading: false,
      }));
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, [persistSessionTokens]);

  const checkSession = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const email = await SecureStoreShim.getItemAsync(EMAIL_KEY);
      const snapshot = sessionHydrated ? sessionTokens : await reloadSessionTokens();
      const token = snapshot.accessToken;
      if (token) {
        try {
          await me(token);
          setState(s => ({
            ...s,
            accessToken: token,
            refreshToken: snapshot.refreshToken,
            email,
            loading: false,
          }));
          return;
        } catch {
          await clearSessionTokens();
        }
      }
      setState(s => ({ ...s, accessToken: null, refreshToken: null, email, loading: false }));
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, [sessionHydrated, sessionTokens, reloadSessionTokens, clearSessionTokens]);

  const logout = useCallback(async () => {
    await clearSessionTokens();
    await persist(EMAIL_KEY, null);
    setState(s => ({ ...s, accessToken: null, refreshToken: null, email: null }));
  }, [clearSessionTokens]);

  return {
    ...state,
    register,
    login,
    logout,
    toggleMode,
    checkSession,
  };
}
