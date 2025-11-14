import type { ThemePreference } from "../config/theme";

export const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LanguagePreference = Locale;

export const DEFAULT_LOCALE: Locale = "en";

export type HomeMessages = {
  kicker?: string;
  tagline?: string;
  description?: string;
  primaryCtaLabel?: string;
  supportCtaLabel?: string;
  downloadsTitle?: string;
  downloadsDescription?: string;
  downloadsIosLabel?: string;
  downloadsAndroidLabel?: string;
};

export type ThemeOptionMessages = {
  label?: string;
  description?: string;
};

export type SettingsMessages = {
  title?: string;
  description?: string;
  appearanceTitle?: string;
  appearanceDescription?: string;
  themeOptions?: Partial<Record<ThemePreference, ThemeOptionMessages>>;
  languageTitle?: string;
  languageDescription?: string;
  languageOptionLabels?: Partial<Record<Locale, string>>;
  downloadsTitle?: string;
  downloadsDescription?: string;
  downloadsIosLabel?: string;
  downloadsAndroidLabel?: string;
  accountTitle?: string;
  accountDescription?: string;
  accountGuestStatus?: string;
  accountPrimaryCta?: string;
  accountSupportCtaLabel?: string;
};

export type AuthMessages = {
  badge?: string;
  title?: string;
  description?: string;
  statusHeadline?: string;
  statusDescription?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  downloadsTitle?: string;
  downloadsDescription?: string;
  downloadsIosLabel?: string;
  downloadsAndroidLabel?: string;
  homeLinkLabel?: string;
  shortcuts?: {
    browseGames?: string;
  };
  sections?: {
    local?: string;
    oauth?: string;
    status?: string;
  };
  providers?: {
    guest?: string;
    local?: string;
    oauth?: string;
  };
  statuses?: {
    processing?: string;
    redirecting?: string;
    loadingSession?: string;
  };
  local?: {
    loginTitle?: string;
    registerTitle?: string;
    helper?: {
      allowedCharacters?: string;
    };
    errors?: {
      passwordMismatch?: string;
      usernameTooShort?: string;
    };
  };
  oauth?: {
    title?: string;
    loginButton?: string;
    logoutButton?: string;
    accessTokenLabel?: string;
    authorizationCodeLabel?: string;
  };
  statusCard?: {
    heading?: string;
    description?: string;
    sessionActive?: string;
    signOutLabel?: string;
    guestDescription?: string;
    details?: {
      provider?: string;
      displayName?: string;
      userId?: string;
      accessExpires?: string;
      refreshExpires?: string;
      updated?: string;
      sessionAccessToken?: string;
      refreshToken?: string;
    };
  };
};

export type TeamMemberMessages = {
  role?: string;
  bio?: string;
};

export type ActionMessages = {
  title?: string;
  description?: string;
  cta?: string;
  successMessage?: string;
};

export type SupportMessages = {
  title?: string;
  tagline?: string;
  description?: string;
  thanks?: string;
  teamSectionTitle?: string;
  actionsSectionTitle?: string;
  team?: Partial<Record<string, TeamMemberMessages>>;
  actions?: Partial<Record<string, ActionMessages>>;
};

export type CommonMessages = {
  languageNames?: Partial<Record<Locale, string>>;
  labels?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  };
  actions?: {
    login?: string;
    register?: string;
    logout?: string;
    openApp?: string;
  };
  prompts?: {
    haveAccount?: string;
    needAccount?: string;
  };
  statuses?: {
    authenticated?: string;
  };
};

export type TranslationBundle = {
  common?: CommonMessages;
  home?: HomeMessages;
  settings?: SettingsMessages;
  support?: SupportMessages;
  auth?: AuthMessages;
};
