import { useCallback, useState } from 'react';
import { loginLocal, registerLocal, me, type AuthUserProfile } from '../api/authApi';
import { resolveApiBase } from '@/lib/apiBase';
import { SecureStoreShim } from '@/lib/secureStore';
import { useSessionTokens, type SessionTokensSnapshot } from '@/stores/sessionTokens';

interface LocalAuthState {
  accessToken: string | null;
  refreshToken?: string | null;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
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
    displayName: null,
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

  const applyProfileSnapshot = useCallback(
    async (profile: AuthUserProfile, snapshot: SessionTokensSnapshot, fallbackEmail: string | null) => {
      const emailValue = profile.email ?? fallbackEmail ?? null;
      await persist(EMAIL_KEY, emailValue);
      const mergedSnapshot = await persistSessionTokens({
        provider: snapshot.provider ?? null,
        accessToken: snapshot.accessToken ?? null,
        accessTokenExpiresAt: snapshot.accessTokenExpiresAt ?? null,
        refreshToken: snapshot.refreshToken ?? null,
        refreshTokenExpiresAt: snapshot.refreshTokenExpiresAt ?? null,
        tokenType: snapshot.tokenType ?? null,
        userId: profile.id ?? snapshot.userId ?? null,
        email: emailValue,
        username: profile.username ?? snapshot.username ?? null,
        displayName: profile.displayName ?? snapshot.displayName ?? null,
      });
      setState(s => ({
        ...s,
        accessToken: mergedSnapshot.accessToken,
        refreshToken: mergedSnapshot.refreshToken,
        email: mergedSnapshot.email ?? emailValue,
        username: mergedSnapshot.username ?? profile.username ?? null,
        displayName: mergedSnapshot.displayName ?? profile.displayName ?? null,
        loading: false,
        error: null,
      }));
    },
    [persistSessionTokens],
  );

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
        displayName: resp.user?.displayName ?? resp.user?.username ?? null,
      });
      await persist(EMAIL_KEY, resp.user?.email ?? normalizedEmail);
      setState(s => ({
        ...s,
        accessToken: snapshot.accessToken,
        refreshToken: snapshot.refreshToken,
        email: snapshot.email ?? normalizedEmail,
        username: snapshot.username,
        displayName: snapshot.displayName ?? resp.user?.displayName ?? resp.user?.username ?? null,
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
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const storedEmail = await SecureStoreShim.getItemAsync(EMAIL_KEY);
      const baseSnapshot = sessionHydrated ? sessionTokens : await reloadSessionTokens();
      const token = baseSnapshot.accessToken;

      if (!token) {
        setState(s => ({
          ...s,
          accessToken: null,
          refreshToken: null,
          email: storedEmail,
          username: null,
          displayName: null,
          loading: false,
        }));
        return;
      }

      try {
        const profile = await me(token, { refreshTokens: refreshSessionTokens });
        const latestSnapshot = sessionTokens.accessToken ? sessionTokens : await reloadSessionTokens();
        const snapshotForProfile = latestSnapshot.accessToken ? latestSnapshot : baseSnapshot;
        await applyProfileSnapshot(profile, snapshotForProfile, storedEmail);
        return;
      } catch {
        try {
          const refreshedSnapshot = await refreshSessionTokens();
          const refreshedToken = refreshedSnapshot.accessToken;
          if (refreshedToken) {
            const profile = await me(refreshedToken);
            await applyProfileSnapshot(profile, refreshedSnapshot, storedEmail);
            return;
          }
        } catch {
          // fall through to clear
        }
        await clearSessionTokens();
        setState(s => ({
          ...s,
          accessToken: null,
          refreshToken: null,
          email: storedEmail,
          username: null,
          displayName: null,
          loading: false,
        }));
      }
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, [
    sessionHydrated,
    sessionTokens,
    reloadSessionTokens,
    clearSessionTokens,
    refreshSessionTokens,
    applyProfileSnapshot,
  ]);

  const logout = useCallback(async () => {
    await clearSessionTokens();
    await persist(EMAIL_KEY, null);
    setState(s => ({ ...s, accessToken: null, refreshToken: null, email: null, username: null, displayName: null }));
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
