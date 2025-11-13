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
};

export type TranslationBundle = {
  common?: CommonMessages;
  home?: HomeMessages;
  settings?: SettingsMessages;
  support?: SupportMessages;
};
