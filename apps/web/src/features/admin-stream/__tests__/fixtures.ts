import {
  STREAM_GAME_IDS,
  STREAM_THEMES,
  type StreamGameId,
  type StreamSettings,
  type StreamSettingsView,
  type StreamStatusView,
} from '../server/stream.types';

export function makeSettings(
  over: Partial<StreamSettings> = {},
): StreamSettings {
  const games = {} as StreamSettings['games'];
  for (const id of STREAM_GAME_IDS) {
    games[id as StreamGameId] = {
      enabled: true,
      weight: 1,
      themes: [...STREAM_THEMES],
      maxDurationSec: 600,
    };
  }
  return {
    enabled: true,
    stopGracefully: false,
    games,
    bot: { difficulty: 'expert', moveDelayMs: 2000 },
    secondsBetweenGames: 15,
    overlay: {
      joinUrl: '',
      showQr: true,
      parts: { players: true, status: true, cta: true, moves: true, arc: true },
      bannerText: '',
    },
    music: { volume: 25, tracks: [] },
    video: {
      resolution: '720p',
      fps: 30,
      bitrateKbps: 3500,
      preset: 'veryfast',
    },
    sceneLanguage: 'en',
    ...over,
  };
}

export const makeView = (
  over: Partial<StreamSettingsView> = {},
): StreamSettingsView => ({
  version: 3,
  settings: makeSettings(),
  updatedAt: '2026-11-20T10:00:00.000Z',
  updatedByLabel: 'Alice',
  ...over,
});

export const makeStatus = (
  over: Partial<StreamStatusView> = {},
): StreamStatusView => ({
  online: true,
  lastReportAt: new Date().toISOString(),
  state: 'live',
  currentGame: { id: 'chess_v1', roomId: 'r1', theme: 'zen' },
  uptimeSec: 7300,
  ffmpegFps: 30,
  ffmpegRestarts: 1,
  gamesPlayed: 12,
  dryRun: false,
  lastRestartReason: null,
  lastRestartAt: null,
  recentErrors: [],
  appliedConfigVersion: 3,
  currentConfigVersion: 3,
  pendingCommands: 0,
  ...over,
});
