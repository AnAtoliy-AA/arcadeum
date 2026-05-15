import type { DeepPartial } from '../base-types';

export const en = {
  chatsTab: 'Chats',
  gamesTab: 'Games',
  historyTab: 'History',
  settingsTab: 'Settings',
  statsTab: 'Statistics',
  walletTab: 'Wallet',
  shopTab: 'Shop',
  adminTab: 'Admin',
};

export const es = {
  chatsTab: 'Chats',
  gamesTab: 'Juegos',
  historyTab: 'Historial',
  settingsTab: 'Configuración',
  statsTab: 'Estadísticas',
  walletTab: 'Cartera',
  shopTab: 'Tienda',
  adminTab: 'Administración',
};

export const fr = {
  chatsTab: 'Discussions',
  gamesTab: 'Jeux',
  historyTab: 'Historique',
  settingsTab: 'Paramètres',
  statsTab: 'Statistiques',
  walletTab: 'Portefeuille',
  shopTab: 'Boutique',
  adminTab: 'Administration',
};

export const ru = {
  chatsTab: 'Чаты',
  gamesTab: 'Игры',
  historyTab: 'История',
  settingsTab: 'Настройки',
  statsTab: 'Статистика',
  walletTab: 'Кошелёк',
  shopTab: 'Магазин',
  adminTab: 'Админ',
};

export const by = {
  chatsTab: 'Чаты',
  gamesTab: 'Гульні',
  historyTab: 'Гісторыя',
  settingsTab: 'Налады',
  statsTab: 'Статыстыка',
  walletTab: 'Кашалёк',
  shopTab: 'Крама',
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
