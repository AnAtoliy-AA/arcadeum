import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useLocalAuth } from '@/entities/session/model/useLocalAuth';
import { useOAuth } from '@/entities/session/model/useOAuth';
import {
  checkUsernameAvailable,
  checkEmailAvailable,
} from '@/entities/session/api/authApi';
import { sanitizeUsername, scheduleStateUpdate } from '../lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const searchParams = useSearchParams();
  const referralParam =
    searchParams?.get('ref') || searchParams?.get('referral');

  const emailFieldId = useId();
  const passwordFieldId = useId();
  const confirmFieldId = useId();
  const usernameFieldId = useId();
  const referralCodeFieldId = useId();

  const [email, setEmail] = useState(storedEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(storedUsername ?? '');
  const [referralCode, setReferralCode] = useState(referralParam ?? '');

  const [usernameAvailability, setUsernameAvailability] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [emailAvailability, setEmailAvailability] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  const usernameCheckRef = useRef<number>(0);
  const emailCheckRef = useRef<number>(0);

  const isRegisterMode = mode === 'register';

  // Extract referral from URL and auto-toggle to register mode if needed
  useEffect(() => {
    if (referralParam) {
      scheduleStateUpdate(() => setReferralCode(referralParam));
      // Try to force register mode if not currently
      if (mode !== 'register') {
        scheduleStateUpdate(() => toggleMode());
      }
    }
  }, [referralParam, mode, toggleMode]);

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
    scheduleStateUpdate(() => setConfirmPassword(''));
    scheduleStateUpdate(() =>
      setUsername(storedUsername ? sanitizeUsername(storedUsername) : ''),
    );
  }, [isRegisterMode, storedUsername]);

  useEffect(() => {
    if (!localAccessToken) return;
    scheduleStateUpdate(() => setPassword(''));
    scheduleStateUpdate(() => setConfirmPassword(''));
  }, [localAccessToken]);

  // Handlers
  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailAvailability('idle');
  }, []);

  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    [],
  );

  const handleConfirmChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
    },
    [],
  );

  const handleUsernameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUsername(sanitizeUsername(e.target.value));
      setUsernameAvailability('idle');
    },
    [],
  );

  const handleReferralCodeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setReferralCode(e.target.value);
    },
    [],
  );

  const handleUsernameBlur = useCallback(async () => {
    const trimmed = username.trim();
    if (!isRegisterMode || trimmed.length < 3) return;

    const checkId = ++usernameCheckRef.current;
    setUsernameAvailability('checking');

    try {
      const result = await checkUsernameAvailable(trimmed);
      if (checkId !== usernameCheckRef.current) return;
      setUsernameAvailability(result.available ? 'available' : 'taken');
    } catch {
      if (checkId !== usernameCheckRef.current) return;
      setUsernameAvailability('idle');
    }
  }, [username, isRegisterMode]);

  const handleEmailBlur = useCallback(async () => {
    const trimmed = email.trim();
    if (!isRegisterMode || !EMAIL_REGEX.test(trimmed)) return;

    const checkId = ++emailCheckRef.current;
    setEmailAvailability('checking');

    try {
      const result = await checkEmailAvailable(trimmed);
      if (checkId !== emailCheckRef.current) return;
      setEmailAvailability(result.available ? 'available' : 'taken');
    } catch {
      if (checkId !== emailCheckRef.current) return;
      setEmailAvailability('idle');
    }
  }, [email, isRegisterMode]);

  const handleToggleMode = useCallback(() => {
    toggleMode();
    setPassword('');
    setConfirmPassword('');
    setUsername(storedUsername ? sanitizeUsername(storedUsername) : '');
  }, [toggleMode, storedUsername]);

  // Validation
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();
  const isEmailValid = EMAIL_REGEX.test(trimmedEmail);
  const showInvalidEmail = trimmedEmail.length > 0 && !isEmailValid;
  const showPasswordMismatch =
    isRegisterMode &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;
  const showUsernameTooShort =
    isRegisterMode && trimmedUsername.length > 0 && trimmedUsername.length < 3;

  const localSubmitDisabled =
    localLoading ||
    !trimmedEmail ||
    !isEmailValid ||
    !password ||
    (isRegisterMode && (!trimmedUsername || !confirmPassword)) ||
    showPasswordMismatch ||
    showUsernameTooShort ||
    (isRegisterMode && usernameAvailability === 'taken') ||
    (isRegisterMode && emailAvailability === 'taken');

  const handleLocalSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (localSubmitDisabled) return;
      if (isRegisterMode) {
        await registerLocal({
          email: trimmedEmail,
          password,
          username: trimmedUsername,
          referralCode: referralCode.trim() || undefined,
        });
        return;
      }
      await loginLocal({ email: trimmedEmail, password });
    },
    [
      isRegisterMode,
      localSubmitDisabled,
      registerLocal,
      loginLocal,
      trimmedEmail,
      password,
      trimmedUsername,
      referralCode,
    ],
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
    if (provider === 'oauth') {
      await logoutOAuth();
      await logoutLocal();
      return;
    }
    if (provider === 'local') {
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
    referralCode,

    // Field IDs
    emailFieldId,
    passwordFieldId,
    confirmFieldId,
    usernameFieldId,
    referralCodeFieldId,

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
    showInvalidEmail,
    isEmailValid,
    usernameAvailability,
    emailAvailability,

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
    handleReferralCodeChange,
    handleUsernameBlur,
    handleEmailBlur,
    handleToggleMode,
    handleLocalSubmit,
    handleStartOAuth,
    handleOAuthLogout,
    handleSignOut,
    logoutLocal,
  };
}
