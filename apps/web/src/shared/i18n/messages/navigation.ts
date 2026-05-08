import type { DeepPartial } from '../base-types';

export const en = {
  chatsTab: 'Chats',
  gamesTab: 'Games',
  historyTab: 'History',
  settingsTab: 'Settings',
  statsTab: 'Statistics',
  adminTab: 'Admin',
};

export const es = {
  chatsTab: 'Chats',
  gamesTab: 'Juegos',
  historyTab: 'Historial',
  settingsTab: 'Configuración',
  statsTab: 'Estadísticas',
  adminTab: 'Administración',
};

export const fr = {
  chatsTab: 'Discussions',
  gamesTab: 'Jeux',
  historyTab: 'Historique',
  settingsTab: 'Paramètres',
  statsTab: 'Statistiques',
  adminTab: 'Administration',
};

export const ru = {
  chatsTab: 'Чаты',
  gamesTab: 'Игры',
  historyTab: 'История',
  settingsTab: 'Настройки',
  statsTab: 'Статистика',
  adminTab: 'Админ',
};

export const by = {
  chatsTab: 'Чаты',
  gamesTab: 'Гульні',
  historyTab: 'Гісторыя',
  settingsTab: 'Налады',
  statsTab: 'Статыстыка',
  adminTab: 'Адмін',
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
