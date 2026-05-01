import type { DeepPartial } from '../base-types';

export const en = {
  chatsTab: 'Chats',
  gamesTab: 'Games',
  historyTab: 'History',
  settingsTab: 'Settings',
  statsTab: 'Statistics',
};

export const es = {
  chatsTab: 'Chats',
  gamesTab: 'Juegos',
  historyTab: 'Historial',
  settingsTab: 'Configuración',
  statsTab: 'Estadísticas',
};

export const fr = {
  chatsTab: 'Discussions',
  gamesTab: 'Jeux',
  historyTab: 'Historique',
  settingsTab: 'Paramètres',
  statsTab: 'Statistiques',
};

export const ru = {
  chatsTab: 'Чаты',
  gamesTab: 'Игры',
  historyTab: 'История',
  settingsTab: 'Настройки',
  statsTab: 'Статистика',
};

export const by = {
  chatsTab: 'Чаты',
  gamesTab: 'Гульні',
  historyTab: 'Гісторыя',
  settingsTab: 'Налады',
  statsTab: 'Статыстыка',
};

export const navigationMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

/** Derived type for backward compatibility */
export type NavigationMessages = DeepPartial<typeof en>;
