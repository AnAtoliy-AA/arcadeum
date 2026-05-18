import type { DeepPartial } from '../base-types';

export const en = {
  homeTab: 'Home',
  chatsTab: 'Chats',
  gamesTab: 'Games',
  historyTab: 'History',
  settingsTab: 'Settings',
  statsTab: 'Statistics',
  walletTab: 'Wallet',
  shopTab: 'Shop',
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
  settingsTab: 'Configuración',
  statsTab: 'Estadísticas',
  walletTab: 'Cartera',
  shopTab: 'Tienda',
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
  settingsTab: 'Paramètres',
  statsTab: 'Statistiques',
  walletTab: 'Portefeuille',
  shopTab: 'Boutique',
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
  settingsTab: 'Настройки',
  statsTab: 'Статистика',
  walletTab: 'Кошелёк',
  shopTab: 'Магазин',
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
  settingsTab: 'Налады',
  statsTab: 'Статыстыка',
  walletTab: 'Кашалёк',
  shopTab: 'Крама',
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
