import { authMessages } from "./auth";
import { chatMessages, chatListMessages } from "./chat";
import { commonMessages } from "./common";
import { gamesMessages } from "./games";
import { historyMessages } from "./history";
import { homeMessages } from "./home";
import { legalMessages } from "./legal";
import { navigationMessages } from "./navigation";
import { paymentsMessages } from "./payments";
import { settingsMessages } from "./settings";
import { supportMessages } from "./support";

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
  },
} as const;
