import { useCallback, useState } from 'react';
import { loginLocal, registerLocal, me, resolveApiBase } from '../api/authApi';
import { SecureStoreShim } from '@/lib/secureStore';
import { useSessionTokens } from '@/stores/sessionTokens';

interface LocalAuthState {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  username?: string | null;
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
    username: null,
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
    refreshTokens: refreshSessionTokens,
  } = useSessionTokens();

  const toggleMode = useCallback(() => {
    setState(s => ({ ...s, mode: s.mode === 'login' ? 'register' : 'login', error: null }));
  }, []);

  const register = useCallback(async (email: string, password: string, username: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      await registerLocal(email.trim(), password, username.trim());
      // Auto-switch to login mode after success
      setState(s => ({ ...s, mode: 'login', loading: false }));
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const normalizedEmail = email.trim();
      const resp = await loginLocal(normalizedEmail, password);
      const snapshot = await persistSessionTokens({
        provider: 'local',
        accessToken: resp.accessToken,
        accessTokenExpiresAt: resp.accessTokenExpiresAt ?? null,
        refreshToken: resp.refreshToken ?? null,
        tokenType: 'Bearer',
        refreshTokenExpiresAt: resp.refreshTokenExpiresAt ?? null,
        userId: resp.user?.id ?? null,
        email: resp.user?.email ?? normalizedEmail,
        username: resp.user?.username ?? null,
      });
      await persist(EMAIL_KEY, resp.user?.email ?? normalizedEmail);
      setState(s => ({
        ...s,
        accessToken: snapshot.accessToken,
        refreshToken: snapshot.refreshToken,
        email: snapshot.email ?? normalizedEmail,
        username: snapshot.username,
        loading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const apiHint = resolveApiBase();
      setState(s => ({
        ...s,
        loading: false,
        error: `${message}\nCheck that the backend at ${apiHint} is running and accessible from the web app.`,
      }));
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
          const profile = await me(token);
          const updatedSnapshot = await persistSessionTokens({
            userId: profile.id ?? null,
            email: profile.email ?? email ?? null,
            username: profile.username ?? null,
          });
          setState(s => ({
            ...s,
            accessToken: token,
            refreshToken: snapshot.refreshToken,
            email: updatedSnapshot.email ?? email,
            username:
              updatedSnapshot.username ?? snapshot.username ?? profile.username ?? null,
            loading: false,
          }));
          return;
        } catch {
          try {
            const refreshedSnapshot = await refreshSessionTokens();
            const refreshedToken = refreshedSnapshot.accessToken;
            if (refreshedToken) {
              const profile = await me(refreshedToken);
              const updatedSnapshot = await persistSessionTokens({
                userId: profile.id ?? null,
                email: profile.email ?? email ?? null,
                username: profile.username ?? null,
              });
              setState(s => ({
                ...s,
                accessToken: refreshedToken,
                refreshToken: refreshedSnapshot.refreshToken,
                email: updatedSnapshot.email ?? email,
                username:
                  updatedSnapshot.username ?? refreshedSnapshot.username ?? profile.username ?? null,
                loading: false,
              }));
              return;
            }
            await clearSessionTokens();
          } catch {
            await clearSessionTokens();
          }
        }
      }
      setState(s => ({ ...s, accessToken: null, refreshToken: null, email, username: null, loading: false }));
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, [
    sessionHydrated,
    sessionTokens,
    reloadSessionTokens,
    clearSessionTokens,
    persistSessionTokens,
    refreshSessionTokens,
  ]);

  const logout = useCallback(async () => {
    await clearSessionTokens();
    await persist(EMAIL_KEY, null);
    setState(s => ({ ...s, accessToken: null, refreshToken: null, email: null, username: null }));
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
