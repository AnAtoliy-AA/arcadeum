import { ChangeEvent, FormEvent, useCallback, useEffect, useId, useState } from "react";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { useLocalAuth } from "@/entities/session/model/useLocalAuth";
import { useOAuth } from "@/entities/session/model/useOAuth";
import { sanitizeUsername, scheduleStateUpdate } from "../lib/utils";

export function useAuthForm() {
  const session = useSessionTokens();
  const sessionSnapshot = session.snapshot;

  const {
    mode,
    loading: localLoading,
    error: localError,
    accessToken: localAccessToken,
    email: storedEmail,
    username: storedUsername,
    displayName: storedDisplayName,
    register: registerLocal,
    login: loginLocal,
    toggleMode,
    logout: logoutLocal,
  } = useLocalAuth(session);

  const {
    loading: oauthLoading,
    isRedirecting,
    error: oauthError,
    authorizationCode,
    providerAccessToken,
    startOAuth,
    logout: logoutOAuth,
  } = useOAuth(session);

  const emailFieldId = useId();
  const passwordFieldId = useId();
  const confirmFieldId = useId();
  const usernameFieldId = useId();

  const [email, setEmail] = useState(storedEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(storedUsername ?? "");

  const isRegisterMode = mode === "register";

  // Sync stored values
  useEffect(() => {
    if (!storedEmail) return;
    scheduleStateUpdate(() => setEmail(storedEmail));
  }, [storedEmail]);

  useEffect(() => {
    if (!storedUsername) return;
    scheduleStateUpdate(() => setUsername(sanitizeUsername(storedUsername)));
  }, [storedUsername]);

  useEffect(() => {
    if (isRegisterMode) return;
    scheduleStateUpdate(() => setConfirmPassword(""));
    scheduleStateUpdate(() => setUsername(storedUsername ? sanitizeUsername(storedUsername) : ""));
  }, [isRegisterMode, storedUsername]);

  useEffect(() => {
    if (!localAccessToken) return;
    scheduleStateUpdate(() => setPassword(""));
    scheduleStateUpdate(() => setConfirmPassword(""));
  }, [localAccessToken]);

  // Handlers
  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleConfirmChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }, []);

  const handleUsernameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUsername(sanitizeUsername(e.target.value));
  }, []);

  const handleToggleMode = useCallback(() => {
    toggleMode();
    setPassword("");
    setConfirmPassword("");
    setUsername(storedUsername ? sanitizeUsername(storedUsername) : "");
  }, [toggleMode, storedUsername]);

  // Validation
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();
  const showPasswordMismatch =
    isRegisterMode && confirmPassword.length > 0 && password !== confirmPassword;
  const showUsernameTooShort =
    isRegisterMode && trimmedUsername.length > 0 && trimmedUsername.length < 3;

  const localSubmitDisabled =
    localLoading ||
    !trimmedEmail ||
    !password ||
    (isRegisterMode && (!trimmedUsername || !confirmPassword)) ||
    showPasswordMismatch ||
    showUsernameTooShort;

  const handleLocalSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (localSubmitDisabled) return;
      if (isRegisterMode) {
        await registerLocal({ email: trimmedEmail, password, username: trimmedUsername });
        return;
      }
      await loginLocal({ email: trimmedEmail, password });
    },
    [isRegisterMode, localSubmitDisabled, registerLocal, loginLocal, trimmedEmail, password, trimmedUsername],
  );

  const handleStartOAuth = useCallback(() => {
    void startOAuth();
  }, [startOAuth]);

  const handleOAuthLogout = useCallback(async () => {
    await logoutOAuth();
    await logoutLocal();
  }, [logoutOAuth, logoutLocal]);

  const handleSignOut = useCallback(async () => {
    const provider = sessionSnapshot.provider;
    if (provider === "oauth") {
      await logoutOAuth();
      await logoutLocal();
      return;
    }
    if (provider === "local") {
      await logoutLocal();
      return;
    }
    await session.clearTokens();
  }, [logoutLocal, logoutOAuth, session, sessionSnapshot.provider]);

  return {
    // Session
    session,
    sessionSnapshot,
    isSessionHydrating: !session.hydrated,
    hasSession: Boolean(sessionSnapshot.accessToken),

    // Mode
    isRegisterMode,

    // Form state
    email,
    password,
    confirmPassword,
    username,

    // Field IDs
    emailFieldId,
    passwordFieldId,
    confirmFieldId,
    usernameFieldId,

    // Local auth state
    localLoading,
    localError,
    localAccessToken,
    storedEmail,
    storedUsername,
    storedDisplayName,
    localSubmitDisabled,
    showPasswordMismatch,
    showUsernameTooShort,

    // OAuth state
    oauthLoading,
    isRedirecting,
    oauthError,
    authorizationCode,
    providerAccessToken,

    // Handlers
    handleEmailChange,
    handlePasswordChange,
    handleConfirmChange,
    handleUsernameChange,
    handleToggleMode,
    handleLocalSubmit,
    handleStartOAuth,
    handleOAuthLogout,
    handleSignOut,
    logoutLocal,
  };
}
