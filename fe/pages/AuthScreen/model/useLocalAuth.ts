import { useCallback, useState } from 'react';
import { loginLocal, registerLocal, me } from '../api/authApi';
import { SecureStoreShim } from './secureStore';

interface LocalAuthState {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  loading: boolean;
  error: string | null;
  mode: 'login' | 'register';
}

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
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
      await persist(ACCESS_TOKEN_KEY, resp.accessToken);
      if (resp.refreshToken) await persist(REFRESH_TOKEN_KEY, resp.refreshToken);
      await persist(EMAIL_KEY, email);
      setState(s => ({
        ...s,
        accessToken: resp.accessToken,
        refreshToken: resp.refreshToken || null,
        email,
        loading: false,
      }));
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, []);

  const checkSession = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const token = await SecureStoreShim.getItemAsync(ACCESS_TOKEN_KEY);
      const email = await SecureStoreShim.getItemAsync(EMAIL_KEY);
      if (token) {
        try {
          await me(token);
          setState(s => ({ ...s, accessToken: token, email, loading: false }));
          return;
        } catch {
          // invalid token -> clear
          await persist(ACCESS_TOKEN_KEY, null);
        }
      }
      setState(s => ({ ...s, loading: false }));
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    await persist(ACCESS_TOKEN_KEY, null);
    await persist(REFRESH_TOKEN_KEY, null);
    await persist(EMAIL_KEY, null);
    setState(s => ({ ...s, accessToken: null, refreshToken: null, email: null }));
  }, []);

  return {
    ...state,
    register,
    login,
    logout,
    toggleMode,
    checkSession,
  };
}
