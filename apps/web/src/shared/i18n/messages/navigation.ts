import type { DeepPartial } from '../base-types';

export const en = {
  homeTab: 'Home',
  chatsTab: 'Chats',
  gamesTab: 'Games',
  historyTab: 'History',
  leaderboardsTab: 'Leaderboards',
  settingsTab: 'Settings',
  statsTab: 'Statistics',
  walletTab: 'Wallet',
  shopTab: 'Shop',
  tokenTab: 'Token',
  adminTab: 'Admin',
  menuLabel: 'Menu',
  accountLabel: 'Account',
  helpLabel: 'Help',
};

export const es = {
  homeTab: 'Inicio',
  chatsTab: 'Chats',
  gamesTab: 'Juegos',
  historyTab: 'Historial',
  leaderboardsTab: 'Clasificaciones',
  settingsTab: 'Configuración',
  statsTab: 'Estadísticas',
  walletTab: 'Cartera',
  shopTab: 'Tienda',
  tokenTab: 'Token',
  adminTab: 'Administración',
  menuLabel: 'Menú',
  accountLabel: 'Cuenta',
  helpLabel: 'Ayuda',
};

export const fr = {
  homeTab: 'Accueil',
  chatsTab: 'Discussions',
  gamesTab: 'Jeux',
  historyTab: 'Historique',
  leaderboardsTab: 'Classements',
  settingsTab: 'Paramètres',
  statsTab: 'Statistiques',
  walletTab: 'Portefeuille',
  shopTab: 'Boutique',
  tokenTab: 'Token',
  adminTab: 'Administration',
  menuLabel: 'Menu',
  accountLabel: 'Compte',
  helpLabel: 'Aide',
};

export const ru = {
  homeTab: 'Главная',
  chatsTab: 'Чаты',
  gamesTab: 'Игры',
  historyTab: 'История',
  leaderboardsTab: 'Рейтинги',
  settingsTab: 'Настройки',
  statsTab: 'Статистика',
  walletTab: 'Кошелёк',
  shopTab: 'Магазин',
  tokenTab: 'Токен',
  adminTab: 'Админ',
  menuLabel: 'Меню',
  accountLabel: 'Аккаунт',
  helpLabel: 'Помощь',
};

export const by = {
  homeTab: 'Галоўная',
  chatsTab: 'Чаты',
  gamesTab: 'Гульні',
  historyTab: 'Гісторыя',
  leaderboardsTab: 'Рэйтынгі',
  settingsTab: 'Налады',
  statsTab: 'Статыстыка',
  walletTab: 'Кашалёк',
  shopTab: 'Крама',
  tokenTab: 'Токен',
  adminTab: 'Адмін',
  menuLabel: 'Меню',
  accountLabel: 'Уліковы запіс',
  helpLabel: 'Дапамога',
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
