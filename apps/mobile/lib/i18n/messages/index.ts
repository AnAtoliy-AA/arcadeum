import type { TranslationMap } from '../types';
import { apiMessages } from './api';
import { authMessages } from './auth';
import { chatMessages, chatListMessages } from './chat';
import { commonMessages } from './common';
import { gamesMessages } from './games';  // Now imports from games folder
import { historyMessages } from './history';
import { homeMessages } from './home';
import { navigationMessages } from './navigation';
import { paymentsMessages } from './payments';
import { settingsMessages } from './settings';
import { supportMessages } from './support';
import { welcomeMessages } from './welcome';

export const translations = {
  en: {
    api: apiMessages.en,
    navigation: navigationMessages.en,
    common: commonMessages.en,
    auth: authMessages.en,
    chat: chatMessages.en,
    chatList: chatListMessages.en,
    history: historyMessages.en,
    games: gamesMessages.en,
    home: homeMessages.en,
    welcome: welcomeMessages.en,
    support: supportMessages.en,
    payments: paymentsMessages.en,
    settings: settingsMessages.en,
  },
  es: {
    api: apiMessages.es,
    navigation: navigationMessages.es,
    common: commonMessages.es,
    auth: authMessages.es,
    chat: chatMessages.es,
    chatList: chatListMessages.es,
    history: historyMessages.es,
    games: gamesMessages.es,
    home: homeMessages.es,
    welcome: welcomeMessages.es,
    support: supportMessages.es,
    payments: paymentsMessages.es,
    settings: settingsMessages.es,
  },
  fr: {
    api: apiMessages.fr,
    navigation: navigationMessages.fr,
    common: commonMessages.fr,
    auth: authMessages.fr,
    chat: chatMessages.fr,
    chatList: chatListMessages.fr,
    history: historyMessages.fr,
    games: gamesMessages.fr,
    home: homeMessages.fr,
    welcome: welcomeMessages.fr,
    support: supportMessages.fr,
    payments: paymentsMessages.fr,
    settings: settingsMessages.fr,
  },
} as const satisfies TranslationMap;

// Utility type to extract all nested paths from an object
type NestedPaths<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedPaths<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

// Extract all valid translation keys from the English translations
export type TranslationKey = NestedPaths<typeof translations['en']>;