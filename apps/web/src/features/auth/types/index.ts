import type { AuthMessages } from '@/shared/i18n/types';

/**
 * Provider copy type for translation labels
 */
export type ProviderCopy = AuthMessages['providers'];

/**
 * Session detail item for displaying session information
 */
export interface SessionDetailItem {
  key: string;
  term: string;
  value: string | null | undefined;
}

/**
 * Labels for session status details
 */
export interface SessionDetailLabels {
  provider: string;
  displayName: string;
  userId: string;
  accessExpires: string;
  refreshExpires: string;
  updated: string;
  sessionAccessToken: string;
  refreshToken: string;
}

export interface HeroSectionLabels {
  badgeLabel: string;
  heroTitle: string;
  heroDescription: string;
  heroStatusHeadline: string;
  heroStatusDescription: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  homeLinkLabel: string;
  browseGamesLabel: string;
}

export interface LocalAuthPanelLabels {
  localBadge: string;
  localHeading: string;
  localSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  usernameLabel: string;
  referralCodeLabel: string;
  helperText: string;
  submitLabel: string;
  toggleLabel: string;
  logoutLabel: string;
  passwordMismatchMessage: string;
  usernameTooShortMessage: string;
  invalidEmailMessage: string;
  processingStatusLabel: string;
  statusActiveMessage: string;
  sessionDetailLabels: {
    displayName: string;
  };
  usernameAvailabilityMessages: {
    checking: string;
    available: string;
    taken: string;
  };
  emailAvailabilityMessages: {
    checking: string;
    available: string;
    taken: string;
  };
}

export interface DownloadSectionLabels {
  downloadsTitle: string;
  downloadsDescription: string;
  downloadsIosLabel: string;
  downloadsAndroidLabel: string;
}

export interface AuthFormLabels {
  tabSignIn: string;
  tabRegister: string;
  headingSignIn: string;
  headingRegister: string;
  subSignIn: string;
  subRegister: string;
  orWithEmail: string;
  emailLabel: string;
  passwordLabel: string;
  handleLabel: string;
  rememberMe: string;
  forgotPassword: string;
  showPassword: string;
  hidePassword: string;
  submitSignIn: string;
  submitRegister: string;
  magicLinkPrompt: string;
  magicLinkCta: string;
  magicLinkSentTitle: string;
  magicLinkSentBody: string;
  magicLinkBack: string;
  passwordMismatch: string;
  legalPrefix: string;
  legalConjunction: string;
  legalSuffix: string;
  termsLink: string;
  privacyLink: string;
}

export interface AuthBrandLabels {
  statusPill: string;
  eyebrow: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subline: string;
  featureOauthTitle: string;
  featureOauthDetail: string;
  featureMagicTitle: string;
  featureMagicDetail: string;
  featureProgressTitle: string;
  featureProgressDetail: string;
  proofBefore: string;
  proofAfter: string;
  proofCount: string;
  footHome: string;
  footGames: string;
  footHelp: string;
}

export interface AuthPwaLabels {
  title: string;
  body: string;
  cta: string;
}

export interface AuthOAuthLabels {
  google: string;
  googleShort: string;
  apple: string;
  appleShort: string;
  discord: string;
  discordShort: string;
  comingSoon: string;
}
