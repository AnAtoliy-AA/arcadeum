import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { DEFAULT_LOCALE, getMessages } from '@/shared/i18n';
import type { AuthMessages, CommonMessages } from '@/shared/i18n/types';
import type {
  HeroSectionLabels,
  LocalAuthPanelLabels,
  DownloadSectionLabels,
  SessionDetailLabels,
  AuthFormLabels,
  AuthBrandLabels,
  AuthPwaLabels,
  AuthOAuthLabels,
} from '../types';

const DEFAULT_TRANSLATIONS = getMessages(DEFAULT_LOCALE);
const DEFAULT_AUTH_COPY: Partial<AuthMessages> =
  DEFAULT_TRANSLATIONS.auth ?? {};
const DEFAULT_COMMON_COPY: Partial<CommonMessages> =
  DEFAULT_TRANSLATIONS.common ?? {};

export interface AuthLabels
  extends HeroSectionLabels,
    LocalAuthPanelLabels,
    DownloadSectionLabels {
  // Panel badges (already in LocalAuthPanelLabels but statusBadge is independent)
  statusBadge: string;
  oauthBadge: string;

  // OAuth (some are in LocalAuthPanelLabels but these are specific to OAuthPanel)
  oauthTitle: string;
  oauthSubtitle: string;
  oauthButtonLabel: string;
  oauthLogoutLabel: string;
  oauthAccessTokenLabel: string;
  oauthAuthorizationCodeLabel: string;
  oauthEmptyState?: string;

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

  // Session details
  sessionDetailLabels: SessionDetailLabels;

  // Redesigned auth UI label groups
  form: AuthFormLabels;
  brand: AuthBrandLabels;
  pwa: AuthPwaLabels;
  providers: AuthOAuthLabels;
}

function splitLegalCopy(template: string): {
  prefix: string;
  conjunction: string;
  suffix: string;
} {
  // Template: "By continuing you agree to {{appName}}'s {{termsLink}} and {{privacyLink}}."
  // We split it into the three text fragments around the link placeholders so
  // the UI can render the links as React nodes.
  const TERMS = '{{termsLink}}';
  const PRIVACY = '{{privacyLink}}';
  const termsIdx = template.indexOf(TERMS);
  const privacyIdx = template.indexOf(PRIVACY);
  if (termsIdx < 0 || privacyIdx < 0) {
    return { prefix: template, conjunction: ' ', suffix: '' };
  }
  return {
    prefix: template.slice(0, termsIdx),
    conjunction: template.slice(termsIdx + TERMS.length, privacyIdx),
    suffix: template.slice(privacyIdx + PRIVACY.length),
  };
}

function splitProofCopy(template: string): {
  before: string;
  after: string;
} {
  const COUNT = '{{count}}';
  const idx = template.indexOf(COUNT);
  if (idx < 0) return { before: template, after: '' };
  return {
    before: template.slice(0, idx),
    after: template.slice(idx + COUNT.length),
  };
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
  const defaultAuthLocalAvailability = defaultAuthLocal.availability ?? {};
  const defaultAuthForm = defaultAuth.form ?? {};
  const defaultAuthBrand = defaultAuth.brand ?? {};
  const defaultAuthPwa = defaultAuth.pwa ?? {};
  const authForm = authCopy.form ?? {};
  const authBrand = authCopy.brand ?? {};
  const authPwa = authCopy.pwa ?? {};
  const authOauth = authCopy.oauth ?? {};

  const logoutLabel = commonActions.logout ?? defaultCommonActions.logout ?? '';

  return {
    // Hero
    heroTitle:
      formatMessage(authCopy.title, { appName }) ??
      formatMessage(defaultAuth.title, { appName }) ??
      appName,
    heroDescription:
      formatMessage(authCopy.description, { appName }) ??
      formatMessage(defaultAuth.description, { appName }) ??
      '',
    heroStatusHeadline:
      authCopy.statusHeadline ?? defaultAuth.statusHeadline ?? '',
    heroStatusDescription:
      formatMessage(authCopy.statusDescription, { appName }) ??
      formatMessage(defaultAuth.statusDescription, { appName }) ??
      '',
    badgeLabel: authCopy.badge ?? defaultAuth.badge ?? '',
    primaryActionLabel:
      authCopy.primaryCtaLabel ??
      defaultAuth.primaryCtaLabel ??
      supportCta.label,
    secondaryActionLabel:
      authCopy.secondaryCtaLabel ??
      defaultAuth.secondaryCtaLabel ??
      primaryCta.label,
    homeLinkLabel: authCopy.homeLinkLabel ?? defaultAuth.homeLinkLabel ?? '',
    browseGamesLabel:
      authCopy.shortcuts?.browseGames ?? defaultAuthShortcuts.browseGames ?? '',

    // Downloads
    downloadsTitle:
      authCopy.downloadsTitle ?? defaultAuth.downloadsTitle ?? downloads.title,
    downloadsDescription:
      formatMessage(authCopy.downloadsDescription, { appName }) ??
      formatMessage(defaultAuth.downloadsDescription, { appName }) ??
      downloads.description,
    downloadsIosLabel:
      authCopy.downloadsIosLabel ??
      defaultAuth.downloadsIosLabel ??
      downloads.iosLabel,
    downloadsAndroidLabel:
      authCopy.downloadsAndroidLabel ??
      defaultAuth.downloadsAndroidLabel ??
      downloads.androidLabel,

    // Panel badges
    localBadge: authCopy.sections?.local ?? defaultAuthSections.local ?? '',
    oauthBadge: authCopy.sections?.oauth ?? defaultAuthSections.oauth ?? '',
    statusBadge: authCopy.sections?.status ?? defaultAuthSections.status ?? '',

    // Local auth
    localHeading: isRegisterMode
      ? (authCopy.local?.registerTitle ?? defaultAuthLocal.registerTitle ?? '')
      : (authCopy.local?.loginTitle ?? defaultAuthLocal.loginTitle ?? ''),
    localSubtitle: isRegisterMode
      ? (commonPrompts.haveAccount ?? defaultCommonPrompts.haveAccount ?? '')
      : (commonPrompts.needAccount ?? defaultCommonPrompts.needAccount ?? ''),
    helperText:
      authCopy.local?.helper?.allowedCharacters ??
      defaultAuthLocalHelper.allowedCharacters ??
      '',
    passwordMismatchMessage:
      authCopy.local?.errors?.passwordMismatch ??
      defaultAuthLocalErrors.passwordMismatch ??
      '',
    usernameTooShortMessage:
      authCopy.local?.errors?.usernameTooShort ??
      defaultAuthLocalErrors.usernameTooShort ??
      '',
    invalidEmailMessage:
      authCopy.local?.errors?.invalidEmail ??
      defaultAuthLocalErrors.invalidEmail ??
      '',
    submitLabel: isRegisterMode
      ? (commonActions.register ??
        defaultCommonActions.register ??
        'Create account')
      : (commonActions.login ?? defaultCommonActions.login ?? 'Sign in'),
    toggleLabel: isRegisterMode
      ? (commonPrompts.haveAccount ??
        defaultCommonPrompts.haveAccount ??
        'Already have an account?')
      : (commonPrompts.needAccount ??
        defaultCommonPrompts.needAccount ??
        'Need an account?'),
    logoutLabel: logoutLabel || 'Sign out',

    // OAuth
    oauthTitle: authCopy.oauth?.title ?? defaultAuthOauth.title ?? '',
    oauthSubtitle: authCopy.sections?.oauth ?? defaultAuthSections.oauth ?? '',
    oauthButtonLabel:
      authCopy.oauth?.loginButton ?? defaultAuthOauth.loginButton ?? '',
    oauthLogoutLabel:
      authCopy.oauth?.logoutButton ??
      defaultAuthOauth.logoutButton ??
      logoutLabel,
    oauthAccessTokenLabel:
      authCopy.oauth?.accessTokenLabel ??
      defaultAuthOauth.accessTokenLabel ??
      '',
    oauthAuthorizationCodeLabel:
      authCopy.oauth?.authorizationCodeLabel ??
      defaultAuthOauth.authorizationCodeLabel ??
      '',
    oauthEmptyState:
      formatMessage(authCopy.statusCard?.guestDescription, { appName }) ??
      formatMessage(defaultStatusCard.guestDescription, { appName }) ??
      '',

    // Status
    statusHeading:
      authCopy.statusCard?.heading ?? defaultStatusCard.heading ?? '',
    statusDescription:
      formatMessage(authCopy.statusCard?.description, { appName }) ??
      formatMessage(defaultStatusCard.description, { appName }) ??
      '',
    statusActiveMessage:
      authCopy.statusCard?.sessionActive ??
      commonStatuses.authenticated ??
      defaultStatusCard.sessionActive ??
      defaultCommonStatuses.authenticated ??
      '',
    signOutLabel:
      authCopy.statusCard?.signOutLabel ??
      defaultStatusCard.signOutLabel ??
      logoutLabel,
    guestDescription:
      formatMessage(authCopy.statusCard?.guestDescription, { appName }) ??
      formatMessage(defaultStatusCard.guestDescription, { appName }) ??
      formatMessage(authCopy.statusCard?.description, { appName }) ??
      formatMessage(defaultStatusCard.description, { appName }) ??
      '',

    // Processing
    processingStatusLabel:
      authCopy.statuses?.processing ?? defaultAuthStatuses.processing ?? '',
    redirectingStatusLabel:
      authCopy.statuses?.redirecting ?? defaultAuthStatuses.redirecting ?? '',
    loadingStatusLabel:
      authCopy.statuses?.loadingSession ??
      defaultAuthStatuses.loadingSession ??
      '',

    // Common
    emailLabel: commonLabels.email ?? defaultCommonLabels.email ?? '',
    passwordLabel: commonLabels.password ?? defaultCommonLabels.password ?? '',
    confirmPasswordLabel:
      commonLabels.confirmPassword ?? defaultCommonLabels.confirmPassword ?? '',
    usernameLabel: commonLabels.username ?? defaultCommonLabels.username ?? '',
    referralCodeLabel:
      (commonLabels as Record<string, string>).referralCode ??
      (defaultCommonLabels as Record<string, string>).referralCode ??
      'Referral Code (Optional)',

    // Session details
    sessionDetailLabels: {
      provider:
        authCopy.statusCard?.details?.provider ??
        defaultStatusDetails.provider ??
        'provider',
      displayName:
        authCopy.statusCard?.details?.displayName ??
        defaultStatusDetails.displayName ??
        'displayName',
      userId:
        authCopy.statusCard?.details?.userId ??
        defaultStatusDetails.userId ??
        'userId',
      accessExpires:
        authCopy.statusCard?.details?.accessExpires ??
        defaultStatusDetails.accessExpires ??
        'accessExpires',
      refreshExpires:
        authCopy.statusCard?.details?.refreshExpires ??
        defaultStatusDetails.refreshExpires ??
        'refreshExpires',
      updated:
        authCopy.statusCard?.details?.updated ??
        defaultStatusDetails.updated ??
        'updated',
      sessionAccessToken:
        authCopy.statusCard?.details?.sessionAccessToken ??
        defaultStatusDetails.sessionAccessToken ??
        'sessionAccessToken',
      refreshToken:
        authCopy.statusCard?.details?.refreshToken ??
        defaultStatusDetails.refreshToken ??
        'refreshToken',
    },

    usernameAvailabilityMessages: {
      checking:
        authCopy.local?.availability?.checking ??
        defaultAuthLocalAvailability.checking ??
        'Checking...',
      available:
        authCopy.local?.availability?.available ??
        defaultAuthLocalAvailability.available ??
        'Available',
      taken:
        authCopy.local?.errors?.usernameTaken ??
        defaultAuthLocalErrors.usernameTaken ??
        'This username is already taken.',
    },
    emailAvailabilityMessages: {
      checking:
        authCopy.local?.availability?.checking ??
        defaultAuthLocalAvailability.checking ??
        'Checking...',
      available:
        authCopy.local?.availability?.available ??
        defaultAuthLocalAvailability.available ??
        'Available',
      taken:
        authCopy.local?.errors?.emailTaken ??
        defaultAuthLocalErrors.emailTaken ??
        'This email is already registered.',
    },

    form: buildFormLabels(authForm, defaultAuthForm),
    brand: buildBrandLabels(authBrand, defaultAuthBrand),
    pwa: buildPwaLabels(authPwa, defaultAuthPwa),
    providers: buildProvidersLabels(authOauth, defaultAuthOauth),
  };
}

type AuthFormCopy = NonNullable<AuthMessages['form']>;

function buildFormLabels(
  copy: Partial<AuthFormCopy>,
  fallback: Partial<AuthFormCopy>,
): AuthFormLabels {
  const legalTemplate = copy.legal ?? fallback.legal ?? '';
  const legal = splitLegalCopy(legalTemplate);
  return {
    tabSignIn: copy.tabSignIn ?? fallback.tabSignIn ?? 'Sign in',
    tabRegister: copy.tabRegister ?? fallback.tabRegister ?? 'Create account',
    headingSignIn:
      copy.headingSignIn ?? fallback.headingSignIn ?? 'Welcome back.',
    headingRegister:
      copy.headingRegister ?? fallback.headingRegister ?? 'Make it official.',
    subSignIn: copy.subSignIn ?? fallback.subSignIn ?? '',
    subRegister: copy.subRegister ?? fallback.subRegister ?? '',
    orWithEmail: copy.orWithEmail ?? fallback.orWithEmail ?? 'or with email',
    emailLabel: copy.emailLabel ?? fallback.emailLabel ?? 'Email address',
    passwordLabel: copy.passwordLabel ?? fallback.passwordLabel ?? 'Password',
    handleLabel: copy.handleLabel ?? fallback.handleLabel ?? 'Player handle',
    rememberMe: copy.rememberMe ?? fallback.rememberMe ?? 'Trust this device',
    forgotPassword:
      copy.forgotPassword ?? fallback.forgotPassword ?? 'Forgot password?',
    showPassword: copy.showPassword ?? fallback.showPassword ?? 'Show',
    hidePassword: copy.hidePassword ?? fallback.hidePassword ?? 'Hide',
    submitSignIn: copy.submitSignIn ?? fallback.submitSignIn ?? 'Sign in',
    submitRegister:
      copy.submitRegister ?? fallback.submitRegister ?? 'Create account',
    magicLinkPrompt: copy.magicLinkPrompt ?? fallback.magicLinkPrompt ?? '',
    magicLinkCta:
      copy.magicLinkCta ?? fallback.magicLinkCta ?? 'Email me a sign-in link',
    magicLinkSentTitle:
      copy.magicLinkSentTitle ??
      fallback.magicLinkSentTitle ??
      'Check your inbox',
    magicLinkSentBody:
      copy.magicLinkSentBody ?? fallback.magicLinkSentBody ?? '',
    magicLinkBack:
      copy.magicLinkBack ?? fallback.magicLinkBack ?? 'Use a different method',
    legalPrefix: legal.prefix,
    legalConjunction: legal.conjunction,
    legalSuffix: legal.suffix,
    termsLink: copy.termsLink ?? fallback.termsLink ?? 'Terms',
    privacyLink: copy.privacyLink ?? fallback.privacyLink ?? 'Privacy Policy',
  };
}

type AuthBrandCopy = NonNullable<AuthMessages['brand']>;

function buildBrandLabels(
  copy: Partial<AuthBrandCopy>,
  fallback: Partial<AuthBrandCopy>,
): AuthBrandLabels {
  const proofTemplate = copy.proof ?? fallback.proof ?? '';
  const proof = splitProofCopy(proofTemplate);
  return {
    statusPill: copy.statusPill ?? fallback.statusPill ?? '',
    eyebrow: copy.eyebrow ?? fallback.eyebrow ?? '',
    headlinePrefix: copy.headlinePrefix ?? fallback.headlinePrefix ?? '',
    headlineHighlight:
      copy.headlineHighlight ?? fallback.headlineHighlight ?? '',
    subline: copy.subline ?? fallback.subline ?? '',
    featureOauthTitle:
      copy.featureOauthTitle ?? fallback.featureOauthTitle ?? '',
    featureOauthDetail:
      copy.featureOauthDetail ?? fallback.featureOauthDetail ?? '',
    featureMagicTitle:
      copy.featureMagicTitle ?? fallback.featureMagicTitle ?? '',
    featureMagicDetail:
      copy.featureMagicDetail ?? fallback.featureMagicDetail ?? '',
    featureProgressTitle:
      copy.featureProgressTitle ?? fallback.featureProgressTitle ?? '',
    featureProgressDetail:
      copy.featureProgressDetail ?? fallback.featureProgressDetail ?? '',
    proofBefore: proof.before,
    proofAfter: proof.after,
    proofCount: copy.proofCount ?? fallback.proofCount ?? '',
    footHome: copy.footHome ?? fallback.footHome ?? '',
    footGames: copy.footGames ?? fallback.footGames ?? '',
    footHelp: copy.footHelp ?? fallback.footHelp ?? '',
  };
}

type AuthPwaCopy = NonNullable<AuthMessages['pwa']>;

function buildPwaLabels(
  copy: Partial<AuthPwaCopy>,
  fallback: Partial<AuthPwaCopy>,
): AuthPwaLabels {
  return {
    title: copy.title ?? fallback.title ?? 'Get the app.',
    body: copy.body ?? fallback.body ?? '',
    cta: copy.cta ?? fallback.cta ?? 'Install',
  };
}

type AuthOauthCopy = NonNullable<AuthMessages['oauth']>;

function buildProvidersLabels(
  copy: Partial<AuthOauthCopy>,
  fallback: Partial<AuthOauthCopy>,
): AuthOAuthLabels {
  return {
    google: copy.google ?? fallback.google ?? 'Continue with Google',
    apple: copy.apple ?? fallback.apple ?? 'Continue with Apple',
    discord: copy.discord ?? fallback.discord ?? 'Continue with Discord',
    comingSoon: copy.comingSoon ?? fallback.comingSoon ?? 'Coming soon',
  };
}
