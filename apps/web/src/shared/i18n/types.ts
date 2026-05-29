import type { DeepPartial } from './base-types';

// Single source of truth lives in `@/shared/config/locale-slugs` — it
// has no i18n dependencies, so it's safe to import from app-config and
// routes without creating a cycle. Re-exported here so existing
// `@/shared/i18n` imports keep working.
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type Locale,
} from '@/shared/config/locale-slugs';
import type { Locale } from '@/shared/config/locale-slugs';

export type LanguagePreference = Locale;

export type { DeepPartial };

// Import types from message files
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
import type { PagesMessages } from './messages/pages';
import type { StatsMessages } from './messages/stats';
import type { PwaMessages } from './messages/pwa';
import type { ReferralsMessages } from './messages/referrals';
import type { SeoMessages } from './messages/seo';
import type { NotificationsMessages } from './messages/notifications';

// Re-export them
export type {
  HomeMessages,
  SettingsMessages,
  AuthMessages,
  SupportMessages,
  CommonMessages,
  NavigationMessages,
  ChatMessages,
  ChatListMessages,
  HistoryMessages,
  PaymentsMessages,
  GamesMessagesBundle,
  PagesMessages,
  StatsMessages,
  PwaMessages,
  ReferralsMessages,
  SeoMessages,
  NotificationsMessages,
};

// Export legal types for easier access
export type {
  TermsMessages,
  PrivacyMessages,
  ContactMessages,
  LegalMessages,
} from './messages/legal/types';

// Legacy helper types used in index.ts and elsewhere
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

export type PageFeature = {
  title: string;
  description: string;
};

export type CookiePolicySection = {
  title: string;
  content?: string;
  intro?: string;
  items?: string[];
};

export type TranslationBundle = {
  common?: CommonMessages;
  pages?: PagesMessages;
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
  stats?: StatsMessages;
  pwa?: PwaMessages;
  referrals?: ReferralsMessages;
  seo?: SeoMessages;
  notifications?: NotificationsMessages;
  legal?: import('./messages/legal/types').LegalMessages;
  battlePass?: import('./messages/battle-pass').BattlePassMessages;
};
