/** Payload types for the admin stream endpoints (mirror apps/be/src/stream). */

export const STREAM_GAME_IDS = [
  'chess_v1',
  'checkers_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'critical_v1',
  'sea_battle_v1',
  'cat_dash_v1',
  'backgammon_v1',
  'hearts_v1',
  'spades_v1',
  'go_v1',
  'pachisi_v1',
] as const;
export type StreamGameId = (typeof STREAM_GAME_IDS)[number];

export const STREAM_THEMES = [
  'adventure',
  'cyberpunk',
  'underwater',
  'galaxy',
  'fantasy',
  'steampunk',
  'zen',
  'western',
  'egypt',
] as const;

export const BOT_DIFFICULTIES = ['medium', 'hard', 'expert', 'master'] as const;
export const OVERLAY_PARTS = [
  'players',
  'status',
  'cta',
  'moves',
  'arc',
] as const;
export type OverlayPart = (typeof OVERLAY_PARTS)[number];
export const RESOLUTIONS = ['720p', '1080p'] as const;
export const FPS_VALUES = [25, 30] as const;
export const X264_PRESETS = [
  'ultrafast',
  'superfast',
  'veryfast',
  'faster',
  'fast',
] as const;

export interface StreamGameSettings {
  enabled: boolean;
  weight: number;
  themes: string[];
  maxDurationSec: number;
}

export interface StreamSettings {
  enabled: boolean;
  stopGracefully: boolean;
  games: Record<StreamGameId, StreamGameSettings>;
  bot: { difficulty: (typeof BOT_DIFFICULTIES)[number]; moveDelayMs: number };
  secondsBetweenGames: number;
  overlay: {
    joinUrl: string;
    showQr: boolean;
    parts: Record<OverlayPart, boolean>;
    bannerText: string;
  };
  music: { volume: number; tracks: string[] };
  video: {
    resolution: (typeof RESOLUTIONS)[number];
    fps: (typeof FPS_VALUES)[number];
    bitrateKbps: number;
    preset: (typeof X264_PRESETS)[number];
  };
  sceneLanguage: 'en';
}

export interface StreamSettingsView {
  version: number;
  settings: StreamSettings;
  updatedAt: string | null;
  updatedByLabel: string | null;
}

export interface StreamStatusView {
  online: boolean;
  lastReportAt: string | null;
  state: string | null;
  currentGame: {
    id: string;
    roomId?: string;
    theme?: string;
    startedAt?: string;
  } | null;
  uptimeSec: number | null;
  ffmpegFps: number | null;
  ffmpegRestarts: number | null;
  gamesPlayed: number | null;
  dryRun: boolean | null;
  lastRestartReason: string | null;
  lastRestartAt: string | null;
  recentErrors: string[];
  appliedConfigVersion: number | null;
  currentConfigVersion: number;
  pendingCommands: number;
}

export interface StreamAuditView {
  id: string;
  kind: 'settings' | 'command';
  version: number;
  adminLabel: string;
  changedAt: string;
  changes: { path: string; from: unknown; to: unknown }[];
}

export type StreamCommandType = 'start' | 'stop' | 'skip' | 'restart_browser';
