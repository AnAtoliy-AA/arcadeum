import type { Locale } from '../types';

const navigationMessagesDefinition = {
  en: {
    chatsTab: 'Chats',
    gamesTab: 'Games',
    historyTab: 'History',
    settingsTab: 'Settings',
  },
  es: {
    chatsTab: 'Chats',
    gamesTab: 'Juegos',
    historyTab: 'Historial',
    settingsTab: 'Configuración',
  },
  fr: {
    chatsTab: 'Discussions',
    gamesTab: 'Jeux',
    historyTab: 'Historique',
    settingsTab: 'Paramètres',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const navigationMessages = navigationMessagesDefinition;

/** Derived type from the navigationMessages object - English locale structure */
export type NavigationMessages = (typeof navigationMessagesDefinition)['en'];
