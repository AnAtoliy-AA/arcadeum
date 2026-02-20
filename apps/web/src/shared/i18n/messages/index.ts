import { authMessages } from './auth';
import { chatMessages, chatListMessages } from './chat';
import { commonMessages } from './common';
import { gamesMessages } from './games';
import { historyMessages } from './history';
import { homeMessages } from './home';
import { legalMessages } from './legal';
import { navigationMessages } from './navigation';
import { paymentsMessages } from './payments';
import { pwaMessages } from './pwa';
import { settingsMessages } from './settings';
import { referralsMessages } from './referrals';
import { statsMessages } from './stats';
import { supportMessages } from './support';

// Build translations with concrete types for proper type inference
// This approach preserves the full structure for StringPaths type generation
export const translations = {
  en: {
    common: commonMessages.en,
    home: homeMessages.en,
    settings: settingsMessages.en,
    support: supportMessages.en,
    auth: authMessages.en,
    navigation: navigationMessages.en,
    chat: chatMessages.en,
    chatList: chatListMessages.en,
    games: gamesMessages.en,
    history: historyMessages.en,
    payments: paymentsMessages.en,
    legal: legalMessages.en,
    stats: statsMessages.en,
    pwa: pwaMessages.en,
    referrals: referralsMessages.en,
  },
  es: {
    common: commonMessages.es,
    home: homeMessages.es,
    settings: settingsMessages.es,
    support: supportMessages.es,
    auth: authMessages.es,
    navigation: navigationMessages.es,
    chat: chatMessages.es,
    chatList: chatListMessages.es,
    games: gamesMessages.es,
    history: historyMessages.es,
    payments: paymentsMessages.es,
    legal: legalMessages.es,
    stats: statsMessages.es,
    pwa: pwaMessages.es,
    referrals: referralsMessages.es,
  },
  fr: {
    common: commonMessages.fr,
    home: homeMessages.fr,
    settings: settingsMessages.fr,
    support: supportMessages.fr,
    auth: authMessages.fr,
    navigation: navigationMessages.fr,
    chat: chatMessages.fr,
    chatList: chatListMessages.fr,
    games: gamesMessages.fr,
    history: historyMessages.fr,
    payments: paymentsMessages.fr,
    legal: legalMessages.fr,
    stats: statsMessages.fr,
    pwa: pwaMessages.fr,
    referrals: referralsMessages.fr,
  },
  ru: {
    common: commonMessages.ru,
    home: homeMessages.ru,
    settings: settingsMessages.ru,
    support: supportMessages.ru,
    auth: authMessages.ru,
    navigation: navigationMessages.ru,
    chat: chatMessages.ru,
    chatList: chatListMessages.ru,
    games: gamesMessages.ru,
    history: historyMessages.ru,
    payments: paymentsMessages.ru,
    legal: legalMessages.ru,
    stats: statsMessages.ru,
    pwa: pwaMessages.ru,
    referrals: referralsMessages.ru,
  },
  be: {
    common: commonMessages.be,
    home: homeMessages.be,
    settings: settingsMessages.be,
    support: supportMessages.be,
    auth: authMessages.be,
    navigation: navigationMessages.be,
    chat: chatMessages.be,
    chatList: chatListMessages.be,
    games: gamesMessages.be,
    history: historyMessages.be,
    payments: paymentsMessages.be,
    legal: legalMessages.be,
    stats: statsMessages.be,
    pwa: pwaMessages.be,
    referrals: referralsMessages.be,
  },
} as const;
