import type { DeepPartial } from '../base-types';

export const en = {
  chatsTab: 'Chats',
  gamesTab: 'Games',
  historyTab: 'History',
  settingsTab: 'Settings',
  statsTab: 'Statistics',
  walletTab: 'Wallet',
  adminTab: 'Admin',
};

export const es = {
  chatsTab: 'Chats',
  gamesTab: 'Juegos',
  historyTab: 'Historial',
  settingsTab: 'Configuración',
  statsTab: 'Estadísticas',
  walletTab: 'Cartera',
  adminTab: 'Administración',
};

export const fr = {
  chatsTab: 'Discussions',
  gamesTab: 'Jeux',
  historyTab: 'Historique',
  settingsTab: 'Paramètres',
  statsTab: 'Statistiques',
  walletTab: 'Portefeuille',
  adminTab: 'Administration',
};

export const ru = {
  chatsTab: 'Чаты',
  gamesTab: 'Игры',
  historyTab: 'История',
  settingsTab: 'Настройки',
  statsTab: 'Статистика',
  walletTab: 'Кошелёк',
  adminTab: 'Админ',
};

export const by = {
  chatsTab: 'Чаты',
  gamesTab: 'Гульні',
  historyTab: 'Гісторыя',
  settingsTab: 'Налады',
  statsTab: 'Статыстыка',
  walletTab: 'Кашалёк',
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
