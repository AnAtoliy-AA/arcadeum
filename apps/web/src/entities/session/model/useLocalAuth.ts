"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchProfile,
  loginLocal,
  registerLocal,
  type LoginResponse,
} from "@/entities/session/api/authApi";
import {
  type SessionTokensValue,
  type SessionTokensSnapshot,
} from "@/entities/session/model/useSessionTokens";

const EMAIL_STORAGE_KEY = "web_auth_email";

type LocalAuthMode = "login" | "register";

type LocalAuthState = {
  mode: LocalAuthMode;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  email: string | null;
  username: string | null;
  displayName: string | null;
};

export type UseLocalAuthResult = LocalAuthState & {
  register: (params: { email: string; password: string; username: string }) => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  toggleMode: () => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setMode: (mode: LocalAuthMode) => void;
};

function readStoredEmail(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const value = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    return value ?? null;
  } catch {
    return null;
  }
}

function persistEmail(value: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (value) {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function mergeSnapshot(
  session: SessionTokensValue,
  response: LoginResponse,
  provider: "local" | "oauth",
  fallbackEmail?: string | null,
): Promise<SessionTokensSnapshot> {
  return session.setTokens({
    provider,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt ?? null,
    refreshToken: response.refreshToken ?? null,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt ?? null,
    tokenType: "Bearer",
    userId: response.user?.id ?? null,
    email: response.user?.email ?? fallbackEmail ?? null,
    username: response.user?.username ?? null,
    displayName:
      response.user?.displayName ??
      response.user?.username ??
      response.user?.email ??
      null,
  });
}

export function useLocalAuth(session: SessionTokensValue): UseLocalAuthResult {
  const [state, setState] = useState<LocalAuthState>(() => ({
    mode: "login",
    loading: false,
    error: null,
    accessToken: null,
    email: typeof window === "undefined" ? null : readStoredEmail(),
    username: null,
    displayName: null,
  }));
  const hasCheckedOnceRef = useRef(false);

  const setMode = useCallback((mode: LocalAuthMode) => {
    setState((current) => ({
      ...current,
      mode,
      error: null,
    }));
  }, []);

  const toggleMode = useCallback(() => {
    setState((current) => ({
      ...current,
      mode: current.mode === "login" ? "register" : "login",
      error: null,
    }));
  }, []);

  const applySnapshot = useCallback(
    (snapshot: SessionTokensSnapshot) => {
      setState((current) => ({
        ...current,
        loading: false,
        error: null,
        accessToken: snapshot.accessToken,
        email: snapshot.email ?? current.email,
        username: snapshot.username,
        displayName: snapshot.displayName,
      }));
    },
    [],
  );

  const register = useCallback(
    async ({ email, password, username }: { email: string; password: string; username: string }) => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        await registerLocal({
          email: email.trim(),
          password,
          username: username.trim(),
        });
        persistEmail(email.trim());
        setState((current) => ({
          ...current,
          loading: false,
          mode: "login",
          error: null,
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        }));
      }
    },
    [],
  );

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const trimmedEmail = email.trim();
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const response = await loginLocal({ email: trimmedEmail, password });
        const snapshot = await mergeSnapshot(session, response, "local", trimmedEmail);
        persistEmail(trimmedEmail);
        applySnapshot(snapshot);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setState((current) => ({
          ...current,
          loading: false,
          error: message,
        }));
      }
    },
    [applySnapshot, session],
  );

  const logout = useCallback(async () => {
    await session.clearTokens();
    persistEmail(null);
    hasCheckedOnceRef.current = false;
    setState((current) => ({
      ...current,
      accessToken: null,
      email: null,
      username: null,
      displayName: null,
    }));
  }, [session]);

  const checkSession = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const storedEmail = readStoredEmail();
    try {
      const baseSnapshot = session.hydrated ? session.snapshot : await session.reload();
      if (!baseSnapshot.accessToken) {
        setState((current) => ({
          ...current,
          loading: false,
          accessToken: null,
          email: storedEmail,
          username: null,
          displayName: null,
        }));
        return;
      }

      try {
        const profile = await fetchProfile(baseSnapshot.accessToken);
        const merged = await session.setTokens({
          provider: baseSnapshot.provider,
          accessToken: baseSnapshot.accessToken,
          accessTokenExpiresAt: baseSnapshot.accessTokenExpiresAt,
          refreshToken: baseSnapshot.refreshToken,
          refreshTokenExpiresAt: baseSnapshot.refreshTokenExpiresAt,
          tokenType: baseSnapshot.tokenType,
          userId: profile.id ?? baseSnapshot.userId,
          email: profile.email ?? storedEmail ?? baseSnapshot.email,
          username: profile.username ?? baseSnapshot.username,
          displayName:
            profile.displayName ??
            profile.username ??
            profile.email ??
            baseSnapshot.displayName,
        });
        applySnapshot(merged);
      } catch (profileError) {
        try {
          const refreshed = await session.refreshTokens();
          if (!refreshed.accessToken) {
            throw profileError;
          }
          const profile = await fetchProfile(refreshed.accessToken);
          const merged = await session.setTokens({
            provider: refreshed.provider,
            accessToken: refreshed.accessToken,
            accessTokenExpiresAt: refreshed.accessTokenExpiresAt,
            refreshToken: refreshed.refreshToken,
            refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
            tokenType: refreshed.tokenType,
            userId: profile.id ?? refreshed.userId,
            email: profile.email ?? storedEmail ?? refreshed.email,
            username: profile.username ?? refreshed.username,
            displayName:
              profile.displayName ??
              profile.username ??
              profile.email ??
              refreshed.displayName,
          });
          applySnapshot(merged);
        } catch (retryError) {
          await session.clearTokens();
          setState((current) => ({
            ...current,
            loading: false,
            accessToken: null,
            email: storedEmail,
            username: null,
            displayName: null,
            error: retryError instanceof Error ? retryError.message : String(retryError),
          }));
        }
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }, [applySnapshot, session]);

  useEffect(() => {
    if (!session.hydrated) {
      return;
    }

    const snapshot = session.snapshot;
    setState((current) => ({
      ...current,
      accessToken: snapshot.accessToken,
      email: snapshot.email ?? current.email,
      username: snapshot.username,
      displayName: snapshot.displayName,
    }));
  }, [session.hydrated, session.snapshot]);

  useEffect(() => {
    if (!session.hydrated || hasCheckedOnceRef.current) {
      return;
    }
    hasCheckedOnceRef.current = true;
    void checkSession();
  }, [checkSession, session.hydrated]);

  const value: UseLocalAuthResult = useMemo(
    () => ({
      ...state,
      register,
      login,
      toggleMode,
      logout,
      checkSession,
      setMode,
    }),
    [state, register, login, toggleMode, logout, checkSession, setMode],
  );

  return value;
}

