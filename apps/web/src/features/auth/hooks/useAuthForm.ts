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

export type OAuthProvider = 'google' | 'apple' | 'discord';

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = [
  'google',
  'apple',
  'discord',
] as const;

// Providers other than Google still require BE wiring; render disabled buttons
// with a "Coming soon" tooltip until the backend endpoints land.
// TODO ARC-XXX wire apple/discord oauth
const ENABLED_OAUTH_PROVIDERS: ReadonlySet<OAuthProvider> = new Set(['google']);

export function isOAuthProviderEnabled(provider: OAuthProvider): boolean {
  return ENABLED_OAUTH_PROVIDERS.has(provider);
}

export type UseAuthFormResult = ReturnType<typeof useAuthForm>;

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
  const usernameFieldId = useId();
  const referralCodeFieldId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  const [usernameAvailability, setUsernameAvailability] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [emailAvailability, setEmailAvailability] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  const usernameCheckRef = useRef<number>(0);
  const emailCheckRef = useRef<number>(0);

  const isRegisterMode = mode === 'register';

  const referralAppliedRef = useRef(false);

  // Extract referral from URL and auto-toggle to register mode if needed
  useEffect(() => {
    if (referralParam && !referralAppliedRef.current) {
      referralAppliedRef.current = true;
      scheduleStateUpdate(() => {
        setReferralCode(referralParam);
        // Try to force register mode if not currently
        if (mode !== 'register') {
          toggleMode();
        }
      });
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
    scheduleStateUpdate(() =>
      setUsername(storedUsername ? sanitizeUsername(storedUsername) : ''),
    );
  }, [isRegisterMode, storedUsername]);

  useEffect(() => {
    if (!localAccessToken) return;
    scheduleStateUpdate(() => setPassword(''));
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
    setUsername(storedUsername ? sanitizeUsername(storedUsername) : '');
  }, [toggleMode, storedUsername]);

  // Validation
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();
  const isEmailValid = EMAIL_REGEX.test(trimmedEmail);
  const showInvalidEmail = trimmedEmail.length > 0 && !isEmailValid;
  const showUsernameTooShort =
    isRegisterMode && trimmedUsername.length > 0 && trimmedUsername.length < 3;

  const localSubmitDisabled =
    localLoading ||
    !trimmedEmail ||
    !isEmailValid ||
    !password ||
    (isRegisterMode && !trimmedUsername) ||
    showUsernameTooShort ||
    (isRegisterMode && usernameAvailability === 'taken') ||
    (isRegisterMode && emailAvailability === 'taken');

  const handleLocalSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (localSubmitDisabled) return;
      if (isRegisterMode) {
        // TODO ARC-XXX move referral capture to onboarding
        await registerLocal({
          email: trimmedEmail,
          password,
          username: trimmedUsername,
          referralCode: referralCode.trim() || undefined,
        });
        return;
      }
      // TODO ARC-XXX honor rememberMe in BE refresh-token TTL
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

  const handleStartOAuth = useCallback(
    (provider: OAuthProvider = 'google') => {
      if (!isOAuthProviderEnabled(provider)) {
        return;
      }
      // TODO ARC-XXX route to per-provider OAuth endpoint when apple/discord land
      void startOAuth();
    },
    [startOAuth],
  );

  const requestMagicLink = useCallback(async (emailValue: string) => {
    const trimmed = emailValue.trim();
    if (!EMAIL_REGEX.test(trimmed)) return;
    // TODO ARC-XXX wire POST /auth/magic-link; BE returns 200 for both existing
    // and unknown emails to prevent account enumeration.
    setMagicLinkEmail(trimmed);
    setMagicLinkSent(true);
  }, []);

  const resetMagicLink = useCallback(() => {
    setMagicLinkSent(false);
    setMagicLinkEmail('');
  }, []);

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
    username,
    referralCode,
    rememberMe,
    setRememberMe,
    magicLinkSent,
    magicLinkEmail,

    // Field IDs
    emailFieldId,
    passwordFieldId,
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
    requestMagicLink,
    resetMagicLink,
  };
}
