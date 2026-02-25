export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'ru', 'by'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LanguagePreference = Locale;

export const DEFAULT_LOCALE: Locale = 'en';

/** Utility type that makes all properties and nested properties optional */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Re-export types from message files - these are now derived from actual translation objects
export type { HomeMessages } from './messages/home';
export type { SettingsMessages } from './messages/settings';
export type { AuthMessages } from './messages/auth';
export type { SupportMessages } from './messages/support';
export type { CommonMessages } from './messages/common';
export type { NavigationMessages } from './messages/navigation';
export type { ChatMessages, ChatListMessages } from './messages/chat';
export type { HistoryMessages } from './messages/history';
export type { PaymentsMessages } from './messages/payments';
export type { GamesMessagesBundle } from './messages/games';

// Legacy helper types that may be used elsewhere
export type ThemeOptionMessages = {
  label?: string;
  description?: string;
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

// Import the actual types for TranslationBundle
import type { HomeMessages } from './messages/home';
import type { SettingsMessages } from './messages/settings';
import type { AuthMessages } from './messages/auth';
import type { SupportMessages } from './messages/support';
import type { CommonMessages } from './messages/common';
import type { NavigationMessages } from './messages/navigation';
import type { ChatMessages, ChatListMessages } from './messages/chat';
import type { HistoryMessages } from './messages/history';
import type { PaymentsMessages } from './messages/payments';
import type { GamesMessagesBundle } from './messages/games';

export type TranslationBundle = {
  common?: CommonMessages;
  home?: HomeMessages;
  settings?: SettingsMessages;
  support?: SupportMessages;
  auth?: AuthMessages;
  navigation?: NavigationMessages;
  chat?: ChatMessages;
  chatList?: ChatListMessages;
  games?: GamesMessagesBundle;
  history?: HistoryMessages;
  payments?: PaymentsMessages;
  legal?: {
    nav?: {
      terms?: string;
      privacy?: string;
      contact?: string;
    };
    terms?: import('./messages/legal/types').TermsMessages;
    privacy?: import('./messages/legal/types').PrivacyMessages;
    contact?: import('./messages/legal/types').ContactMessages;
  };
};
