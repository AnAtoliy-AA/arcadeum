// Barrel — re-export everything from focused modules.
// Consumer code should import from '@/shared/i18n', never from sub-paths.

export { loadMessages } from './messages';

// Locale utilities
export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getMessages,
  isLocale,
  localeToHreflang,
} from './locale';

// Interpolation
export { formatMessage } from './interpolate';

// React context + hooks
export { LanguageContext } from './LanguageContext';
export type { LanguageContextValue } from './LanguageContext';
export { useLanguage } from './useLanguage';

// Types
export type {
  Locale,
  LanguagePreference,
  TranslationBundle,
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
  TermsMessages,
  PrivacyMessages,
  ContactMessages,
  LegalMessages,
  ThemeOptionMessages,
  TeamMemberMessages,
  ActionMessages,
  PageFeature,
  CookiePolicySection,
  DeepPartial,
} from './types';

export type {
  PageSection,
  PageFaqItem,
  PageFaq,
  PageTranslations,
} from './page-translations';
