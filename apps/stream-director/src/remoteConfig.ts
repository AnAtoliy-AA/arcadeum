import { z } from 'zod';
import { GAMES } from './games';
import type { GameConfig, StreamConfig } from './types';

/**
 * Remote (admin) stream settings as served by GET /stream/config. Mirrors
 * apps/be/src/stream/stream-settings.model.ts. Validated with zod: anything
 * that does not parse is ignored and the last good config keeps running.
 *
 * The stream key / RTMP URL are never part of this payload.
 */

const GAME_IDS = [
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

const gameSchema = z.object({
  enabled: z.boolean(),
  weight: z.number().int().min(1).max(10),
  themes: z.array(z.string().min(1).max(40)).min(1).max(30),
  maxDurationSec: z.number().int().min(60).max(1800),
});

const gamesShape = Object.fromEntries(GAME_IDS.map((id) => [id, gameSchema]));

export const remoteSettingsSchema = z
  .object({
    enabled: z.boolean(),
    stopGracefully: z.boolean(),
    games: z.object(
      gamesShape as Record<(typeof GAME_IDS)[number], typeof gameSchema>,
    ),
    bot: z.object({
      difficulty: z.enum(['medium', 'hard', 'expert', 'master']),
      moveDelayMs: z.number().int().min(500).max(8000),
    }),
    secondsBetweenGames: z.number().int().min(5).max(120),
    overlay: z.object({
      joinUrl: z.string().max(200),
      showQr: z.boolean(),
      parts: z.object({
        players: z.boolean(),
        status: z.boolean(),
        cta: z.boolean(),
        moves: z.boolean(),
        arc: z.boolean(),
      }),
      bannerText: z.string().max(80),
    }),
    music: z.object({
      volume: z.number().int().min(0).max(100),
      tracks: z.array(z.string().min(1).max(100)).max(50),
    }),
    video: z.object({
      resolution: z.enum(['720p', '1080p']),
      fps: z.union([z.literal(25), z.literal(30)]),
      bitrateKbps: z.number().int().min(1500).max(6000),
      preset: z.enum(['ultrafast', 'superfast', 'veryfast', 'faster', 'fast']),
    }),
    sceneLanguage: z.literal('en'),
  })
  .refine((s) => Object.values(s.games).filter((g) => g.enabled).length >= 2, {
    message: 'at least 2 games must be enabled',
  });

export type RemoteSettings = z.infer<typeof remoteSettingsSchema>;

export const remoteResponseSchema = z.object({
  version: z.number().int().min(0),
  config: z.unknown(),
});

export type ParsedRemote =
  | { ok: true; version: number; settings: RemoteSettings }
  | { ok: false; reason: string };

/** Validate an HTTP body; never throws. */
export function parseRemote(body: unknown): ParsedRemote {
  const envelope = remoteResponseSchema.safeParse(body);
  if (!envelope.success) return { ok: false, reason: 'bad response shape' };
  const settings = remoteSettingsSchema.safeParse(envelope.data.config);
  if (!settings.success) {
    const reason = settings.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return { ok: false, reason };
  }
  return { ok: true, version: envelope.data.version, settings: settings.data };
}

export const commandSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(['start', 'stop', 'skip', 'restart_browser']),
  graceful: z.boolean().optional(),
});
export type RemoteCommand = z.infer<typeof commandSchema>;

/** Valid commands only; malformed entries are dropped. */
export function parseCommands(body: unknown): RemoteCommand[] {
  if (!Array.isArray(body)) return [];
  return body.flatMap((c) => {
    const r = commandSchema.safeParse(c);
    return r.success ? [r.data] : [];
  });
}

const RESOLUTIONS = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
} as const;

/** How a change reaches the stream. */
export interface ApplyReport {
  /** Changed settings, grouped by when they take effect. */
  live: string[];
  nextGame: string[];
  /** ffmpeg must restart (done between games). */
  ffmpegRestart: string[];
  enabled: boolean;
  stopGracefully: boolean;
}

const titleOf = (id: string): string =>
  GAMES.find((g) => g.id === id)?.title ?? id;
const stuckOf = (id: string): number =>
  GAMES.find((g) => g.id === id)?.stuckMs ?? 120_000;

export function toGameConfigs(s: RemoteSettings): GameConfig[] {
  return GAME_IDS.filter((id) => s.games[id].enabled).map((id) => ({
    id,
    title: titleOf(id),
    maxDurationMs: s.games[id].maxDurationSec * 1000,
    stuckMs: stuckOf(id),
    moveDelayMs: s.bot.moveDelayMs,
    themes: s.games[id].themes,
    weight: s.games[id].weight,
    personalities: null,
  }));
}

const same = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

/**
 * Apply validated remote settings to the mutable runtime config and report
 * what changed and when it takes effect. Pure apart from mutating `config`.
 */
export function applyRemote(
  config: StreamConfig,
  s: RemoteSettings,
): ApplyReport {
  const report: ApplyReport = {
    live: [],
    nextGame: [],
    ffmpegRestart: [],
    enabled: s.enabled,
    stopGracefully: s.stopGracefully,
  };

  const games = toGameConfigs(s);
  const prevGames = config.director.games;
  if (!same(games, prevGames)) {
    // Duration applies to the running game; the rest from the next pick.
    const durationChanged = games.some(
      (g) =>
        prevGames.find((p) => p.id === g.id)?.maxDurationMs !== g.maxDurationMs,
    );
    if (durationChanged) report.live.push('maxDuration');
    report.nextGame.push('games');
    config.director.games = games;
  }
  if (config.director.moveDelayMs !== s.bot.moveDelayMs) {
    config.director.moveDelayMs = s.bot.moveDelayMs;
    report.nextGame.push('moveDelay');
  }
  if (config.director.botDifficulty !== s.bot.difficulty) {
    config.director.botDifficulty = s.bot.difficulty;
    report.nextGame.push('difficulty');
  }
  if (config.director.idleSeconds !== s.secondsBetweenGames) {
    config.director.idleSeconds = s.secondsBetweenGames;
    report.nextGame.push('secondsBetweenGames');
  }

  const hide = Object.entries(s.overlay.parts)
    .filter(([, visible]) => !visible)
    .map(([name]) => name);
  const overlay = {
    joinUrl: s.overlay.joinUrl,
    showQr: s.overlay.showQr,
    banner: s.overlay.bannerText,
    hide,
  };
  if (!same(overlay, config.scene.overlay)) {
    config.scene.overlay = overlay;
    report.nextGame.push('overlay');
  }

  const volume = s.music.volume / 100;
  if (config.audio.musicVolume !== volume) {
    config.audio.musicVolume = volume;
    report.ffmpegRestart.push('musicVolume');
  }
  const tracks = s.music.tracks.length ? s.music.tracks : null;
  if (!same(tracks, config.audio.trackNames)) {
    config.audio.trackNames = tracks;
    report.ffmpegRestart.push('musicTracks');
  }

  const res = RESOLUTIONS[s.video.resolution];
  const profile = {
    ...config.profile,
    ...res,
    fps: s.video.fps,
    videoKbps: s.video.bitrateKbps,
    preset: s.video.preset,
  };
  if (!same(profile, config.profile)) {
    config.profile = profile;
    report.ffmpegRestart.push('videoProfile');
  }
  return report;
}
