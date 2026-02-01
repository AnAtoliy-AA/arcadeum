import { useLanguage, formatMessage } from "@/app/i18n/LanguageProvider";
import { appConfig } from "@/shared/config/app-config";
import { DEFAULT_LOCALE, getMessages } from "@/shared/i18n";
import type { AuthMessages, CommonMessages } from "@/shared/i18n/types";
import type { SessionDetailLabels } from "../types";

const DEFAULT_TRANSLATIONS = getMessages(DEFAULT_LOCALE);
const DEFAULT_AUTH_COPY: Partial<AuthMessages> = DEFAULT_TRANSLATIONS.auth ?? {};
const DEFAULT_COMMON_COPY: Partial<CommonMessages> = DEFAULT_TRANSLATIONS.common ?? {};

interface AuthLabels {
  // Hero section
  heroTitle: string;
  heroDescription: string;
  heroStatusHeadline: string;
  heroStatusDescription: string;
  badgeLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  homeLinkLabel: string;
  browseGamesLabel: string;

  // Downloads
  downloadsTitle: string;
  downloadsDescription: string;
  downloadsIosLabel: string;
  downloadsAndroidLabel: string;

  // Panel badges
  localBadge: string;
  oauthBadge: string;
  statusBadge: string;

  // Local auth
  localHeading: string;
  localSubtitle: string;
  helperText: string;
  passwordMismatchMessage: string;
  usernameTooShortMessage: string;
  submitLabel: string;
  toggleLabel: string;
  logoutLabel: string;

  // OAuth
  oauthTitle: string;
  oauthButtonLabel: string;
  oauthLogoutLabel: string;
  oauthAccessTokenLabel: string;
  oauthAuthorizationCodeLabel: string;

  // Status
  statusHeading: string;
  statusDescription: string;
  statusActiveMessage: string;
  signOutLabel: string;
  guestDescription: string;

  // Processing
  processingStatusLabel: string;
  redirectingStatusLabel: string;
  loadingStatusLabel: string;

  // Common
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  usernameLabel: string;

  // Session details
  sessionDetailLabels: SessionDetailLabels;
}

export function useAuthLabels(isRegisterMode: boolean): AuthLabels {
  const { messages } = useLanguage();
  const { appName, primaryCta, supportCta, downloads } = appConfig;

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
  const defaultAuthStatuses = defaultAuth.statuses ?? {};
  const defaultAuthLocal = defaultAuth.local ?? {};
  const defaultAuthLocalHelper = defaultAuthLocal.helper ?? {};
  const defaultAuthLocalErrors = defaultAuthLocal.errors ?? {};
  const defaultAuthOauth = defaultAuth.oauth ?? {};
  const defaultStatusCard = defaultAuth.statusCard ?? {};
  const defaultStatusDetails = defaultStatusCard.details ?? {};

  const logoutLabel = commonActions.logout ?? defaultCommonActions.logout ?? "";

  return {
    // Hero
    heroTitle:
      formatMessage(authCopy.title, { appName }) ??
      formatMessage(defaultAuth.title, { appName }) ??
      appName,
    heroDescription:
      formatMessage(authCopy.description, { appName }) ??
      formatMessage(defaultAuth.description, { appName }) ??
      "",
    heroStatusHeadline: authCopy.statusHeadline ?? defaultAuth.statusHeadline ?? "",
    heroStatusDescription:
      formatMessage(authCopy.statusDescription, { appName }) ??
      formatMessage(defaultAuth.statusDescription, { appName }) ??
      "",
    badgeLabel: authCopy.badge ?? defaultAuth.badge ?? "",
    primaryActionLabel:
      authCopy.primaryCtaLabel ?? defaultAuth.primaryCtaLabel ?? supportCta.label,
    secondaryActionLabel:
      authCopy.secondaryCtaLabel ?? defaultAuth.secondaryCtaLabel ?? primaryCta.label,
    homeLinkLabel: authCopy.homeLinkLabel ?? defaultAuth.homeLinkLabel ?? "",
    browseGamesLabel:
      authCopy.shortcuts?.browseGames ?? defaultAuthShortcuts.browseGames ?? "",

    // Downloads
    downloadsTitle:
      authCopy.downloadsTitle ?? defaultAuth.downloadsTitle ?? downloads.title,
    downloadsDescription:
      formatMessage(authCopy.downloadsDescription, { appName }) ??
      formatMessage(defaultAuth.downloadsDescription, { appName }) ??
      downloads.description,
    downloadsIosLabel:
      authCopy.downloadsIosLabel ?? defaultAuth.downloadsIosLabel ?? downloads.iosLabel,
    downloadsAndroidLabel:
      authCopy.downloadsAndroidLabel ?? defaultAuth.downloadsAndroidLabel ?? downloads.androidLabel,

    // Panel badges
    localBadge: authCopy.sections?.local ?? defaultAuthSections.local ?? "",
    oauthBadge: authCopy.sections?.oauth ?? defaultAuthSections.oauth ?? "",
    statusBadge: authCopy.sections?.status ?? defaultAuthSections.status ?? "",

    // Local auth
    localHeading: isRegisterMode
      ? authCopy.local?.registerTitle ?? defaultAuthLocal.registerTitle ?? ""
      : authCopy.local?.loginTitle ?? defaultAuthLocal.loginTitle ?? "",
    localSubtitle: isRegisterMode
      ? commonPrompts.haveAccount ?? defaultCommonPrompts.haveAccount ?? ""
      : commonPrompts.needAccount ?? defaultCommonPrompts.needAccount ?? "",
    helperText:
      authCopy.local?.helper?.allowedCharacters ??
      defaultAuthLocalHelper.allowedCharacters ??
      "",
    passwordMismatchMessage:
      authCopy.local?.errors?.passwordMismatch ?? defaultAuthLocalErrors.passwordMismatch ?? "",
    usernameTooShortMessage:
      authCopy.local?.errors?.usernameTooShort ?? defaultAuthLocalErrors.usernameTooShort ?? "",
    submitLabel: isRegisterMode
      ? commonActions.register ?? defaultCommonActions.register ?? ""
      : commonActions.login ?? defaultCommonActions.login ?? "",
    toggleLabel: isRegisterMode
      ? commonPrompts.haveAccount ?? defaultCommonPrompts.haveAccount ?? ""
      : commonPrompts.needAccount ?? defaultCommonPrompts.needAccount ?? "",
    logoutLabel,

    // OAuth
    oauthTitle: authCopy.oauth?.title ?? defaultAuthOauth.title ?? "",
    oauthButtonLabel: authCopy.oauth?.loginButton ?? defaultAuthOauth.loginButton ?? "",
    oauthLogoutLabel:
      authCopy.oauth?.logoutButton ?? defaultAuthOauth.logoutButton ?? logoutLabel,
    oauthAccessTokenLabel:
      authCopy.oauth?.accessTokenLabel ?? defaultAuthOauth.accessTokenLabel ?? "",
    oauthAuthorizationCodeLabel:
      authCopy.oauth?.authorizationCodeLabel ?? defaultAuthOauth.authorizationCodeLabel ?? "",

    // Status
    statusHeading: authCopy.statusCard?.heading ?? defaultStatusCard.heading ?? "",
    statusDescription:
      formatMessage(authCopy.statusCard?.description, { appName }) ??
      formatMessage(defaultStatusCard.description, { appName }) ??
      "",
    statusActiveMessage:
      authCopy.statusCard?.sessionActive ??
      commonStatuses.authenticated ??
      defaultStatusCard.sessionActive ??
      defaultCommonStatuses.authenticated ??
      "",
    signOutLabel:
      authCopy.statusCard?.signOutLabel ?? defaultStatusCard.signOutLabel ?? logoutLabel,
    guestDescription:
      formatMessage(authCopy.statusCard?.guestDescription, { appName }) ??
      formatMessage(defaultStatusCard.guestDescription, { appName }) ??
      (formatMessage(authCopy.statusCard?.description, { appName }) ??
        formatMessage(defaultStatusCard.description, { appName }) ??
        ""),

    // Processing
    processingStatusLabel:
      authCopy.statuses?.processing ?? defaultAuthStatuses.processing ?? "",
    redirectingStatusLabel:
      authCopy.statuses?.redirecting ?? defaultAuthStatuses.redirecting ?? "",
    loadingStatusLabel:
      authCopy.statuses?.loadingSession ?? defaultAuthStatuses.loadingSession ?? "",

    // Common
    emailLabel: commonLabels.email ?? defaultCommonLabels.email ?? "",
    passwordLabel: commonLabels.password ?? defaultCommonLabels.password ?? "",
    confirmPasswordLabel:
      commonLabels.confirmPassword ?? defaultCommonLabels.confirmPassword ?? "",
    usernameLabel: commonLabels.username ?? defaultCommonLabels.username ?? "",

    // Session details
    sessionDetailLabels: {
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
    },
  };
}
