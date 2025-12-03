/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { NeonTheme } from './themes/neon';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

type GameTablePalette = {
  surface: string;
  raised: string;
  border: string;
  shadow: string;
  playerSelf: string;
  playerCurrent: string;
  destructiveBg: string;
  destructiveText: string;
  playerIcon: string;
};

type GameRoomPalette = {
  raisedBackground: string;
  border: string;
  surfaceShadow: string;
  heroBackground: string;
  heroGlowPrimary: string;
  heroGlowSecondary: string;
  topBarSurface: string;
  topBarBorder: string;
  heroBadgeBackground: string;
  heroBadgeBorder: string;
  heroBadgeIcon: string;
  heroBadgeText: string;
  actionBackground: string;
  actionBorder: string;
  statusLobby: string;
  statusInProgress: string;
  statusCompleted: string;
  leaveBackground: string;
  leaveDisabledBackground: string;
  leaveTint: string;
  deleteBackground: string;
  deleteDisabledBackground: string;
  deleteTint: string;
  errorBackground: string;
  errorBorder: string;
  errorText: string;
  backgroundGradient: readonly [string, string, string];
  backgroundGlow: string;
  decorPlay: string;
  decorCheck: string;
  decorAlert: string;
  titleBackground: string;
  titleBorder: string;
  titleGlow: string;
  titleText: string;
};

type GameDetailPalette = {
  raisedBackground: string;
  statusPrototype: string;
  statusDesign: string;
  statusRoadmap: string;
};

export type ThemePalette = {
  isLight: boolean;
  text: string;
  background: string;
  tint: string;
  icon: string;
  cardBackground: string;
  cardBorder: string;
  tabIconDefault: string;
  tabIconSelected: string;
  statusConnected: string;
  statusDisconnected: string;
  error: string;
  destructive: string;
  warning: string;
  gameTable: GameTablePalette;
  gameRoom: GameRoomPalette;
  gameDetail: GameDetailPalette;
};

export const Colors: Record<'light' | 'dark' | 'neonLight' | 'neonDark', ThemePalette> = {
  light: {
    isLight: true,
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    cardBackground: '#F6F8FC',
    cardBorder: '#D8DFEA',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    statusConnected: '#22c55e',
    statusDisconnected: '#ef4444',
    error: '#ef4444',
    destructive: '#ef4444',
    warning: '#f59e0b',
    gameTable: {
      surface: '#F3F4F6',
      raised: '#FFFFFF',
      border: '#D1D5DB',
      shadow: 'rgba(15, 23, 42, 0.12)',
      playerSelf: '#DBEAFE',
      playerCurrent: '#C7D2FE',
      destructiveBg: '#FEE2E2',
      destructiveText: '#B91C1C',
      playerIcon: '#1F2937',
    },
    gameRoom: {
      raisedBackground: 'rgba(255, 255, 255, 0.92)',
      border: 'rgba(148, 163, 184, 0.35)',
      surfaceShadow: 'rgba(15, 23, 42, 0.08)',
      heroBackground: 'rgba(248, 250, 252, 0.95)',
      heroGlowPrimary: '#BAE6FD',
      heroGlowSecondary: '#EDE9FE',
      topBarSurface: 'rgba(255, 255, 255, 0.9)',
      topBarBorder: 'rgba(148, 163, 184, 0.35)',
      heroBadgeBackground: 'rgba(226, 232, 240, 0.85)',
      heroBadgeBorder: '#94A3B8',
      heroBadgeIcon: '#3B82F6',
      heroBadgeText: '#1F2937',
      actionBackground: 'rgba(241, 245, 249, 0.9)',
      actionBorder: '#CBD5F5',
      statusLobby: 'rgba(34, 197, 94, 0.12)',
      statusInProgress: 'rgba(249, 115, 22, 0.12)',
      statusCompleted: 'rgba(59, 130, 246, 0.12)',
      leaveBackground: '#FEE2E2',
      leaveDisabledBackground: '#E2E8F0',
      leaveTint: '#B91C1C',
      deleteBackground: '#EDE9FE',
      deleteDisabledBackground: '#E2E8F0',
      deleteTint: '#6B21A8',
      errorBackground: '#FEE2E2',
      errorBorder: '#FCA5A5',
      errorText: '#B91C1C',
      backgroundGradient: ['#F8FAFC', '#EEF2FF', '#E0F2FE'],
      backgroundGlow: 'rgba(148, 163, 184, 0.18)',
      decorPlay: '#6366F1',
      decorCheck: '#0EA5E9',
      decorAlert: '#F97316',
      titleBackground: 'rgba(148, 163, 184, 0.22)',
      titleBorder: '#38BDF8',
      titleGlow: '#60A5FA',
      titleText: '#1F2937',
    },
    gameDetail: {
      raisedBackground: '#E9EEF6',
      statusPrototype: '#D8F1FF',
      statusDesign: '#EDE3FF',
      statusRoadmap: '#E0F6ED',
    },
  },
  dark: {
    isLight: false,
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    cardBackground: '#1F2228',
    cardBorder: '#32353D',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    statusConnected: '#22c55e',
    statusDisconnected: '#ef4444',
    error: '#ef4444',
    destructive: '#ff6b6b',
    warning: '#fbbf24',
    gameTable: {
      surface: '#111827',
      raised: '#1F2937',
      border: '#334155',
      shadow: 'rgba(2, 6, 23, 0.6)',
      playerSelf: '#1E3A8A',
      playerCurrent: '#334155',
      destructiveBg: '#4C1D1D',
      destructiveText: '#FCA5A5',
      playerIcon: '#E2E8F0',
    },
    gameRoom: {
      raisedBackground: 'rgba(17, 24, 39, 0.92)',
      border: 'rgba(51, 65, 85, 0.6)',
      surfaceShadow: 'rgba(2, 6, 23, 0.65)',
      heroBackground: 'rgba(15, 23, 42, 0.94)',
      heroGlowPrimary: '#60A5FA',
      heroGlowSecondary: '#C084FC',
      topBarSurface: 'rgba(17, 24, 39, 0.9)',
      topBarBorder: 'rgba(51, 65, 85, 0.6)',
      heroBadgeBackground: 'rgba(30, 41, 59, 0.85)',
      heroBadgeBorder: '#64748B',
      heroBadgeIcon: '#93C5FD',
      heroBadgeText: '#F8FAFC',
      actionBackground: 'rgba(30, 41, 59, 0.9)',
      actionBorder: '#475569',
      statusLobby: 'rgba(34, 197, 94, 0.2)',
      statusInProgress: 'rgba(249, 115, 22, 0.2)',
      statusCompleted: 'rgba(59, 130, 246, 0.2)',
      leaveBackground: 'rgba(127, 29, 29, 0.75)',
      leaveDisabledBackground: 'rgba(30, 41, 59, 0.75)',
      leaveTint: '#FCA5A5',
      deleteBackground: 'rgba(76, 29, 149, 0.75)',
      deleteDisabledBackground: 'rgba(30, 41, 59, 0.7)',
      deleteTint: '#E9D5FF',
      errorBackground: 'rgba(127, 29, 29, 0.24)',
      errorBorder: 'rgba(248, 113, 113, 0.35)',
      errorText: '#FECACA',
      backgroundGradient: ['#0F172A', '#111827', '#1E293B'],
      backgroundGlow: 'rgba(148, 163, 184, 0.12)',
      decorPlay: '#60A5FA',
      decorCheck: '#22D3EE',
      decorAlert: '#F97316',
      titleBackground: 'rgba(15, 23, 42, 0.85)',
      titleBorder: '#38BDF8',
      titleGlow: '#0EA5E9',
      titleText: '#F8FAFC',
    },
    gameDetail: {
      raisedBackground: '#262A31',
      statusPrototype: '#1D3B48',
      statusDesign: '#2A2542',
      statusRoadmap: '#1F3A32',
    },
  },
  neonLight: {
    isLight: false,
    text: NeonTheme.light.textPrimary,
    background: NeonTheme.light.background,
    tint: NeonTheme.light.accentPrimary,
    icon: NeonTheme.light.textMuted,
    cardBackground: NeonTheme.light.card.background,
    cardBorder: NeonTheme.light.card.border,
    tabIconDefault: NeonTheme.light.textMuted,
    tabIconSelected: NeonTheme.light.accentPrimary,
    statusConnected: NeonTheme.light.status.success,
    statusDisconnected: NeonTheme.light.status.danger,
    error: NeonTheme.light.status.danger,
    destructive: NeonTheme.light.status.danger,
    warning: NeonTheme.light.status.warning,
    gameTable: NeonTheme.light.gameTable,
    gameRoom: NeonTheme.light.gameRoom,
    gameDetail: NeonTheme.light.gameDetail,
  },
  neonDark: {
    isLight: false,
    text: NeonTheme.dark.textPrimary,
    background: NeonTheme.dark.background,
    tint: NeonTheme.dark.accentPrimary,
    icon: NeonTheme.dark.textMuted,
    cardBackground: NeonTheme.dark.card.background,
    cardBorder: NeonTheme.dark.card.border,
    tabIconDefault: NeonTheme.dark.textMuted,
    tabIconSelected: NeonTheme.dark.accentPrimary,
    statusConnected: NeonTheme.dark.status.success,
    statusDisconnected: NeonTheme.dark.status.danger,
    error: NeonTheme.dark.status.danger,
    destructive: NeonTheme.dark.status.danger,
    warning: NeonTheme.dark.status.warning,
    gameTable: NeonTheme.dark.gameTable,
    gameRoom: NeonTheme.dark.gameRoom,
    gameDetail: NeonTheme.dark.gameDetail,
  },
};

export type AppThemeName = keyof typeof Colors;
