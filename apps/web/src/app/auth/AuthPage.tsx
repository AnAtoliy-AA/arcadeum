"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import styled, { css } from "styled-components";

import { useLanguage, formatMessage } from "@/app/i18n/LanguageProvider";
import {
  useSessionTokens,
  type SessionProviderId,
} from "@/entities/session/model/useSessionTokens";
import { useLocalAuth } from "@/entities/session/model/useLocalAuth";
import { useOAuth } from "@/entities/session/model/useOAuth";
import { appConfig } from "@/shared/config/app-config";
import { DEFAULT_LOCALE, getMessages } from "@/shared/i18n";
import type { AuthMessages, CommonMessages } from "@/shared/i18n/types";

const DEFAULT_TRANSLATIONS = getMessages(DEFAULT_LOCALE);
const DEFAULT_AUTH_COPY: Partial<AuthMessages> = DEFAULT_TRANSLATIONS.auth ?? {};
const DEFAULT_COMMON_COPY: Partial<CommonMessages> = DEFAULT_TRANSLATIONS.common ?? {};

type ProviderCopy = AuthMessages["providers"];

function resolveProviderLabel(
  provider: SessionProviderId | null | undefined,
  copy: ProviderCopy | undefined,
  fallbackCopy: ProviderCopy | undefined,
): string {
  const providerKey: keyof NonNullable<ProviderCopy> = (provider ?? "guest") as keyof NonNullable<ProviderCopy>;
  const preferred = copy?.[providerKey];
  if (preferred) {
    return preferred;
  }
  const fallback = fallbackCopy?.[providerKey];
  if (fallback) {
    return fallback;
  }

  if (providerKey === "oauth") {
    return provider?.toUpperCase() ?? "OAuth";
  }

  if (typeof providerKey === "string" && providerKey.length > 0) {
    return providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
  }

  return "Guest";
}

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return value;
  }
}

function sanitizeUsername(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

function scheduleStateUpdate(action: () => void) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(action);
    return;
  }
  Promise.resolve().then(action).catch(() => {
    // ignore scheduling errors
  });
}

const Page = styled.main`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.background.radialStart}, transparent 55%),
    radial-gradient(circle at bottom right, ${({ theme }) => theme.background.radialEnd}, transparent 55%),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);
`;

const Wrapper = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
`;

const HeroCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: ${({ theme }) => theme.surfaces.hero.background};
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  border-radius: 24px;
  padding: clamp(2.25rem, 5vw, 3.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);
`;

const Badge = styled.span`
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accent};
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 2.8rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.secondary};
`;

const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

const Status = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.panel.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

const StatusHeadline = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const StatusDescription = styled.span`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: flex-start;
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const PrimaryAction = styled(ActionLink)`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }
`;

const SecondaryAction = styled(ActionLink)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  box-shadow: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.accent};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
    }
  }
`;

const HomeLinkIcon = styled.span`
  font-size: 0.95rem;
`;

const ShortcutsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ShortcutLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.accent};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ShortcutIcon = styled.span`
  font-size: 0.9rem;
`;

const PanelsSection = styled.section`
  display: grid;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const PanelCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.panel.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

const PanelHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const PanelBadge = styled.span`
  align-self: flex-start;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accent};
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const PanelSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
    opacity: 0.75;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    transform: none;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
  }
`;

const PrimaryButton = styled.button`
  ${buttonBase}
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }
`;

const SecondaryButton = styled.button`
  ${buttonBase}
  background: ${({ theme }) => theme.buttons.secondary.background};
  border-color: ${({ theme }) => theme.buttons.secondary.border};
  color: ${({ theme }) => theme.buttons.secondary.text};

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const HelperText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.muted};
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: rgba(244, 63, 94, 0.9);
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text.notice};
`;

const SessionCallout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.2rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

const CalloutHeading = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const CalloutDetail = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TokenRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TokenLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const TokenValue = styled.code`
  font-family: var(--font-geist-mono);
  font-size: 0.78rem;
  padding: 0.4rem 0.6rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.accent};
  word-break: break-all;
`;

const SessionDetailList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
`;

const SessionDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
`;

const SessionDetailTerm = styled.dt`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text.muted};
`;

const SessionDetailValue = styled.dd`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.secondary};
  font-family: var(--font-geist-mono);
  word-break: break-all;
`;

const EmptyState = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const DownloadSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  border-radius: 24px;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);
`;

const DownloadTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const DownloadDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const DownloadButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.interactive.download.hoverBorder};
      background: ${({ theme }) => theme.interactive.download.hoverBackground};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const DownloadIcon = styled.span`
  font-size: 0.9rem;
  line-height: 1;
  color: ${({ theme }) => theme.text.accent};
`;

export function AuthPage() {
  const { messages } = useLanguage();
  const { appName, primaryCta, supportCta, downloads } = appConfig;

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

  const authCopy: Partial<AuthMessages> = messages.auth ?? {};
  const commonCopy: Partial<CommonMessages> = messages.common ?? {};
  const commonLabels = commonCopy.labels ?? {};
  const commonActions = commonCopy.actions ?? {};
  const commonPrompts = commonCopy.prompts ?? {};
  const commonStatuses = commonCopy.statuses ?? {};
  const defaultAuth = DEFAULT_AUTH_COPY;
  const defaultCommon = DEFAULT_COMMON_COPY;
  const defaultCommonLabels = defaultCommon.labels ?? {};
  const defaultCommonActions = defaultCommon.actions ?? {};
  const defaultCommonPrompts = defaultCommon.prompts ?? {};
  const defaultCommonStatuses = defaultCommon.statuses ?? {};
  const defaultAuthShortcuts = defaultAuth.shortcuts ?? {};
  const defaultAuthSections = defaultAuth.sections ?? {};
  const defaultAuthProviders = defaultAuth.providers ?? {};
  const defaultAuthStatuses = defaultAuth.statuses ?? {};
  const defaultAuthLocal = defaultAuth.local ?? {};
  const defaultAuthLocalHelper = defaultAuthLocal.helper ?? {};
  const defaultAuthLocalErrors = defaultAuthLocal.errors ?? {};
  const defaultAuthOauth = defaultAuth.oauth ?? {};
  const defaultStatusCard = defaultAuth.statusCard ?? {};
  const defaultStatusDetails = defaultStatusCard.details ?? {};

  const isRegisterMode = mode === "register";

  useEffect(() => {
    if (!storedEmail) {
      return;
    }
    scheduleStateUpdate(() => {
      setEmail(storedEmail);
    });
  }, [storedEmail]);

  useEffect(() => {
    if (!storedUsername) {
      return;
    }
    scheduleStateUpdate(() => {
      setUsername(sanitizeUsername(storedUsername));
    });
  }, [storedUsername]);

  useEffect(() => {
    if (isRegisterMode) {
      return;
    }
    scheduleStateUpdate(() => {
      setConfirmPassword("");
    });
    scheduleStateUpdate(() => {
      setUsername(storedUsername ? sanitizeUsername(storedUsername) : "");
    });
  }, [isRegisterMode, storedUsername]);

  useEffect(() => {
    if (!localAccessToken) {
      return;
    }
    scheduleStateUpdate(() => {
      setPassword("");
    });
    scheduleStateUpdate(() => {
      setConfirmPassword("");
    });
  }, [localAccessToken]);

  const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handlePasswordChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const handleConfirmChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  }, []);

  const handleUsernameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setUsername(sanitizeUsername(event.target.value));
  }, []);

  const handleToggleMode = useCallback(() => {
    toggleMode();
    setPassword("");
    setConfirmPassword("");
    setUsername(storedUsername ? sanitizeUsername(storedUsername) : "");
  }, [toggleMode, storedUsername]);

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
      if (localSubmitDisabled) {
        return;
      }
      if (isRegisterMode) {
        await registerLocal({
          email: trimmedEmail,
          password,
          username: trimmedUsername,
        });
        return;
      }
      await loginLocal({
        email: trimmedEmail,
        password,
      });
    },
    [
      isRegisterMode,
      localSubmitDisabled,
      registerLocal,
      loginLocal,
      trimmedEmail,
      password,
      trimmedUsername,
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

  const heroTitle =
    formatMessage(authCopy.title, { appName }) ??
    formatMessage(defaultAuth.title, { appName }) ??
    appName;
  const heroDescription =
    formatMessage(authCopy.description, { appName }) ??
    formatMessage(defaultAuth.description, { appName }) ??
    "";
  const heroStatusHeadline = authCopy.statusHeadline ?? defaultAuth.statusHeadline ?? "";
  const heroStatusDescription =
    formatMessage(authCopy.statusDescription, { appName }) ??
    formatMessage(defaultAuth.statusDescription, { appName }) ??
    "";

  const badgeLabel = authCopy.badge ?? defaultAuth.badge ?? "";
  const primaryActionLabel =
    authCopy.primaryCtaLabel ?? defaultAuth.primaryCtaLabel ?? supportCta.label;
  const secondaryActionLabel =
    authCopy.secondaryCtaLabel ?? defaultAuth.secondaryCtaLabel ?? primaryCta.label;
  const homeLinkLabel = authCopy.homeLinkLabel ?? defaultAuth.homeLinkLabel ?? "";
  const browseGamesLabel =
    authCopy.shortcuts?.browseGames ?? defaultAuthShortcuts.browseGames ?? "";

  const downloadsTitle =
    authCopy.downloadsTitle ?? defaultAuth.downloadsTitle ?? downloads.title;
  const downloadsDescription =
    formatMessage(authCopy.downloadsDescription, { appName }) ??
    formatMessage(defaultAuth.downloadsDescription, { appName }) ??
    downloads.description;
  const downloadsIosLabel =
    authCopy.downloadsIosLabel ?? defaultAuth.downloadsIosLabel ?? downloads.iosLabel;
  const downloadsAndroidLabel =
    authCopy.downloadsAndroidLabel ?? defaultAuth.downloadsAndroidLabel ?? downloads.androidLabel;
  const hasDownloadLinks = Boolean(downloads.iosHref || downloads.androidHref);

  const localBadge = authCopy.sections?.local ?? defaultAuthSections.local ?? "";
  const oauthBadge = authCopy.sections?.oauth ?? defaultAuthSections.oauth ?? "";
  const statusBadge = authCopy.sections?.status ?? defaultAuthSections.status ?? "";

  const localHeading = isRegisterMode
    ? authCopy.local?.registerTitle ?? defaultAuthLocal.registerTitle ?? ""
    : authCopy.local?.loginTitle ?? defaultAuthLocal.loginTitle ?? "";
  const localSubtitle = isRegisterMode
    ? commonPrompts.haveAccount ?? defaultCommonPrompts.haveAccount ?? ""
    : commonPrompts.needAccount ?? defaultCommonPrompts.needAccount ?? "";
  const helperText =
    authCopy.local?.helper?.allowedCharacters ??
    defaultAuthLocalHelper.allowedCharacters ??
    "";
  const passwordMismatchMessage =
    authCopy.local?.errors?.passwordMismatch ?? defaultAuthLocalErrors.passwordMismatch ?? "";
  const usernameTooShortMessage =
    authCopy.local?.errors?.usernameTooShort ?? defaultAuthLocalErrors.usernameTooShort ?? "";

  const submitLabel = isRegisterMode
    ? commonActions.register ?? defaultCommonActions.register ?? ""
    : commonActions.login ?? defaultCommonActions.login ?? "";
  const toggleLabel = isRegisterMode
    ? commonPrompts.haveAccount ?? defaultCommonPrompts.haveAccount ?? ""
    : commonPrompts.needAccount ?? defaultCommonPrompts.needAccount ?? "";
  const logoutLabel = commonActions.logout ?? defaultCommonActions.logout ?? "";

  const oauthTitle = authCopy.oauth?.title ?? defaultAuthOauth.title ?? "";
  const oauthButtonLabel = authCopy.oauth?.loginButton ?? defaultAuthOauth.loginButton ?? "";
  const oauthLogoutLabel =
    authCopy.oauth?.logoutButton ?? defaultAuthOauth.logoutButton ?? logoutLabel;
  const oauthAccessTokenLabel =
    authCopy.oauth?.accessTokenLabel ?? defaultAuthOauth.accessTokenLabel ?? "";
  const oauthAuthorizationCodeLabel =
    authCopy.oauth?.authorizationCodeLabel ?? defaultAuthOauth.authorizationCodeLabel ?? "";

  const statusHeading = authCopy.statusCard?.heading ?? defaultStatusCard.heading ?? "";
  const statusDescription =
    formatMessage(authCopy.statusCard?.description, { appName }) ??
    formatMessage(defaultStatusCard.description, { appName }) ??
    "";
  const statusActiveMessage =
    authCopy.statusCard?.sessionActive ??
    commonStatuses.authenticated ??
    defaultStatusCard.sessionActive ??
    defaultCommonStatuses.authenticated ??
    "";
  const signOutLabel =
    authCopy.statusCard?.signOutLabel ?? defaultStatusCard.signOutLabel ?? logoutLabel;
  const guestDescription =
    formatMessage(authCopy.statusCard?.guestDescription, { appName }) ??
    formatMessage(defaultStatusCard.guestDescription, { appName }) ??
    statusDescription;

  const processingStatusLabel =
    authCopy.statuses?.processing ?? defaultAuthStatuses.processing ?? "";
  const redirectingStatusLabel =
    authCopy.statuses?.redirecting ?? defaultAuthStatuses.redirecting ?? "";
  const loadingStatusLabel =
    authCopy.statuses?.loadingSession ?? defaultAuthStatuses.loadingSession ?? "";

  const providerLabel = resolveProviderLabel(
    sessionSnapshot.provider,
    authCopy.providers,
    defaultAuthProviders,
  );
  const sessionAccessToken = sessionSnapshot.accessToken;
  const sessionRefreshToken = sessionSnapshot.refreshToken;
  const isSessionHydrating = !session.hydrated;
  const hasSession = Boolean(sessionAccessToken);

  const emailLabel = commonLabels.email ?? defaultCommonLabels.email ?? "";
  const passwordLabel = commonLabels.password ?? defaultCommonLabels.password ?? "";
  const confirmPasswordLabel =
    commonLabels.confirmPassword ?? defaultCommonLabels.confirmPassword ?? "";
  const usernameLabel = commonLabels.username ?? defaultCommonLabels.username ?? "";

  const statusDetailLabels = {
    provider: authCopy.statusCard?.details?.provider ?? defaultStatusDetails.provider ?? "provider",
    displayName:
      authCopy.statusCard?.details?.displayName ??
      defaultStatusDetails.displayName ??
      "displayName",
    userId: authCopy.statusCard?.details?.userId ?? defaultStatusDetails.userId ?? "userId",
    accessExpires:
      authCopy.statusCard?.details?.accessExpires ??
      defaultStatusDetails.accessExpires ??
      "accessExpires",
    refreshExpires:
      authCopy.statusCard?.details?.refreshExpires ??
      defaultStatusDetails.refreshExpires ??
      "refreshExpires",
    updated:
      authCopy.statusCard?.details?.updated ?? defaultStatusDetails.updated ?? "updated",
    sessionAccessToken:
      authCopy.statusCard?.details?.sessionAccessToken ??
      defaultStatusDetails.sessionAccessToken ??
      "sessionAccessToken",
    refreshToken:
      authCopy.statusCard?.details?.refreshToken ??
      defaultStatusDetails.refreshToken ??
      "refreshToken",
  } as const;

  const oauthBusy = oauthLoading || isRedirecting;

  const sessionDetails = [
    { key: "provider", term: statusDetailLabels.provider, value: providerLabel },
    { key: "email", term: emailLabel, value: sessionSnapshot.email },
    { key: "username", term: usernameLabel, value: sessionSnapshot.username },
    {
      key: "displayName",
      term: statusDetailLabels.displayName,
      value: sessionSnapshot.displayName,
    },
    { key: "userId", term: statusDetailLabels.userId, value: sessionSnapshot.userId },
    {
      key: "accessExpires",
      term: statusDetailLabels.accessExpires,
      value: formatDateTime(sessionSnapshot.accessTokenExpiresAt),
    },
    {
      key: "refreshExpires",
      term: statusDetailLabels.refreshExpires,
      value: formatDateTime(sessionSnapshot.refreshTokenExpiresAt),
    },
    {
      key: "updated",
      term: statusDetailLabels.updated,
      value: formatDateTime(sessionSnapshot.updatedAt),
    },
  ];

  const showOauthTokens = Boolean(authorizationCode || providerAccessToken);

  return (
    <Page>
      <Wrapper>
        <HeroCard>
          <Badge>{badgeLabel}</Badge>
          <Title>{heroTitle}</Title>
          <Description>{heroDescription}</Description>
          <Status>
            <StatusHeadline>{heroStatusHeadline}</StatusHeadline>
            <StatusDescription>{heroStatusDescription}</StatusDescription>
            <Actions>
              <PrimaryAction href={supportCta.href}>{primaryActionLabel}</PrimaryAction>
              <SecondaryAction href={primaryCta.href}>{secondaryActionLabel}</SecondaryAction>
            </Actions>
          </Status>
          <HomeLink href="/">
            <HomeLinkIcon aria-hidden="true">←</HomeLinkIcon>
            <span>{homeLinkLabel}</span>
          </HomeLink>
          <ShortcutsList>
            <ShortcutLink href="/games">
              <ShortcutIcon aria-hidden="true">→</ShortcutIcon>
              <span>{browseGamesLabel}</span>
            </ShortcutLink>
          </ShortcutsList>
        </HeroCard>
        <PanelsSection>
          <PanelCard>
            <PanelHeader>
              <PanelBadge>{localBadge}</PanelBadge>
              <PanelTitle>{localHeading}</PanelTitle>
              <PanelSubtitle>{localSubtitle}</PanelSubtitle>
            </PanelHeader>
            <AuthForm onSubmit={handleLocalSubmit} noValidate>
              <Field>
                <FieldLabel htmlFor={emailFieldId}>{emailLabel}</FieldLabel>
                <Input
                  id={emailFieldId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={emailLabel}
                  required
                  disabled={localLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={passwordFieldId}>{passwordLabel}</FieldLabel>
                <Input
                  id={passwordFieldId}
                  type="password"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder={passwordLabel}
                  required
                  disabled={localLoading}
                />
              </Field>
              {isRegisterMode ? (
                <>
                  <Field>
                    <FieldLabel htmlFor={confirmFieldId}>{confirmPasswordLabel}</FieldLabel>
                    <Input
                      id={confirmFieldId}
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={handleConfirmChange}
                      placeholder={confirmPasswordLabel}
                      required
                      disabled={localLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={usernameFieldId}>{usernameLabel}</FieldLabel>
                    <Input
                      id={usernameFieldId}
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder={usernameLabel}
                      disabled={localLoading}
                    />
                  </Field>
                  <HelperText>{helperText}</HelperText>
                </>
              ) : null}
              {showPasswordMismatch ? <ErrorText>{passwordMismatchMessage}</ErrorText> : null}
              {showUsernameTooShort ? <ErrorText>{usernameTooShortMessage}</ErrorText> : null}
              {localError ? <ErrorText>{localError}</ErrorText> : null}
              <ButtonRow>
                <PrimaryButton type="submit" disabled={localSubmitDisabled}>
                  {submitLabel}
                </PrimaryButton>
                <SecondaryButton
                  type="button"
                  onClick={handleToggleMode}
                  disabled={localLoading}
                >
                  {toggleLabel}
                </SecondaryButton>
              </ButtonRow>
            </AuthForm>
            {localLoading && processingStatusLabel ? (
              <StatusText>{processingStatusLabel}</StatusText>
            ) : null}
            {localAccessToken ? (
              <SessionCallout>
                <CalloutHeading>{statusActiveMessage}</CalloutHeading>
                {storedEmail ? (
                  <CalloutDetail>
                    {emailLabel}: {storedEmail}
                  </CalloutDetail>
                ) : null}
                {storedUsername ? (
                  <CalloutDetail>
                    {usernameLabel}: {storedUsername}
                  </CalloutDetail>
                ) : null}
                {storedDisplayName ? (
                  <CalloutDetail>
                    {statusDetailLabels.displayName}: {storedDisplayName}
                  </CalloutDetail>
                ) : null}
                <ButtonRow>
                  <SecondaryButton type="button" onClick={() => void logoutLocal()}>
                    {logoutLabel}
                  </SecondaryButton>
                </ButtonRow>
              </SessionCallout>
            ) : null}
          </PanelCard>
          <PanelCard>
            <PanelHeader>
              <PanelBadge>{oauthBadge}</PanelBadge>
              <PanelTitle>{oauthTitle}</PanelTitle>
              <PanelSubtitle>{heroStatusDescription}</PanelSubtitle>
            </PanelHeader>
            <ButtonRow>
              <PrimaryButton
                type="button"
                onClick={handleStartOAuth}
                disabled={oauthBusy}
              >
                {oauthBusy && processingStatusLabel ? processingStatusLabel : oauthButtonLabel}
              </PrimaryButton>
              {sessionAccessToken && sessionSnapshot.provider === "oauth" ? (
                <SecondaryButton
                  type="button"
                  onClick={() => void handleOAuthLogout()}
                  disabled={oauthLoading}
                >
                  {oauthLogoutLabel}
                </SecondaryButton>
              ) : null}
            </ButtonRow>
            {isRedirecting && redirectingStatusLabel ? (
              <StatusText>{redirectingStatusLabel}</StatusText>
            ) : null}
            {oauthError ? <ErrorText>{oauthError}</ErrorText> : null}
            {showOauthTokens ? (
              <TokenList>
                {authorizationCode ? (
                  <TokenRow>
                    <TokenLabel>{oauthAuthorizationCodeLabel}</TokenLabel>
                    <TokenValue>{authorizationCode}</TokenValue>
                  </TokenRow>
                ) : null}
                {providerAccessToken ? (
                  <TokenRow>
                    <TokenLabel>{oauthAccessTokenLabel}</TokenLabel>
                    <TokenValue>{providerAccessToken}</TokenValue>
                  </TokenRow>
                ) : null}
              </TokenList>
            ) : null}
          </PanelCard>
          <PanelCard>
            <PanelHeader>
              <PanelBadge>{statusBadge}</PanelBadge>
              <PanelTitle>{statusHeading}</PanelTitle>
              <PanelSubtitle>{statusDescription}</PanelSubtitle>
            </PanelHeader>
            {isSessionHydrating ? (
              loadingStatusLabel ? <StatusText>{loadingStatusLabel}</StatusText> : null
            ) : (
              <>
                <SessionCallout>
                  <CalloutHeading>
                    {hasSession ? statusActiveMessage : heroStatusHeadline}
                  </CalloutHeading>
                  <CalloutDetail>
                    {hasSession ? statusDescription : guestDescription}
                  </CalloutDetail>
                  {hasSession ? (
                    <ButtonRow>
                      <SecondaryButton type="button" onClick={() => void handleSignOut()}>
                        {signOutLabel}
                      </SecondaryButton>
                    </ButtonRow>
                  ) : null}
                </SessionCallout>
                {hasSession ? (
                  <>
                    <TokenList>
                      {sessionAccessToken ? (
                        <TokenRow>
                          <TokenLabel>
                            {sessionSnapshot.provider === "oauth"
                              ? oauthAccessTokenLabel
                              : statusDetailLabels.sessionAccessToken}
                          </TokenLabel>
                          <TokenValue>{sessionAccessToken}</TokenValue>
                        </TokenRow>
                      ) : null}
                      {sessionRefreshToken ? (
                        <TokenRow>
                          <TokenLabel>{statusDetailLabels.refreshToken}</TokenLabel>
                          <TokenValue>{sessionRefreshToken}</TokenValue>
                        </TokenRow>
                      ) : null}
                    </TokenList>
                    <SessionDetailList>
                      {sessionDetails.map(({ key, term, value }) =>
                        value ? (
                          <SessionDetailRow key={key}>
                            <SessionDetailTerm>{term ?? key}</SessionDetailTerm>
                            <SessionDetailValue>{value}</SessionDetailValue>
                          </SessionDetailRow>
                        ) : null,
                      )}
                    </SessionDetailList>
                  </>
                ) : (
                  <EmptyState>{guestDescription}</EmptyState>
                )}
              </>
            )}
          </PanelCard>
        </PanelsSection>
        {hasDownloadLinks ? (
          <DownloadSection>
            <DownloadTitle>{downloadsTitle}</DownloadTitle>
            <DownloadDescription>{downloadsDescription}</DownloadDescription>
            <DownloadButtons>
              {downloads.iosHref ? (
                <DownloadButton
                  href={downloads.iosHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{downloadsIosLabel}</span>
                </DownloadButton>
              ) : null}
              {downloads.androidHref ? (
                <DownloadButton
                  href={downloads.androidHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{downloadsAndroidLabel}</span>
                </DownloadButton>
              ) : null}
            </DownloadButtons>
          </DownloadSection>
        ) : null}
      </Wrapper>
    </Page>
  );
}

export default AuthPage;
