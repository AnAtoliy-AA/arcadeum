/**
 * Pure model of the live-stream settings: shape, hard limits, defaults,
 * normalisation (clamping) and diffing. No Nest or Mongo imports so the
 * stream director can mirror it and tests stay fast.
 *
 * The stream key and RTMP URL are deliberately NOT part of this model. They
 * live only in the VM environment of the director.
 */

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
export const SCENE_LANGUAGES = ['en'] as const;

/** Hard limits. Out-of-range numbers are clamped, never trusted. */
export const LIMITS = {
  weight: { min: 1, max: 10 },
  maxDurationSec: { min: 60, max: 1800 },
  moveDelayMs: { min: 500, max: 8000 },
  secondsBetweenGames: { min: 5, max: 120 },
  musicVolume: { min: 0, max: 100 },
  bitrateKbps: { min: 1500, max: 6000 },
  bannerLength: 80,
  joinUrlLength: 200,
  maxTracks: 50,
  trackNameLength: 100,
  minEnabledGames: 2,
} as const;

export const DEFAULT_MAX_DURATION_SEC: Record<StreamGameId, number> = {
  chess_v1: 840,
  checkers_v1: 600,
  tic_tac_toe_v1: 180,
  cascade_v1: 480,
  critical_v1: 600,
  sea_battle_v1: 600,
  cat_dash_v1: 480,
  backgammon_v1: 720,
  hearts_v1: 720,
  spades_v1: 720,
  go_v1: 840,
  pachisi_v1: 840,
};

export interface StreamGameSettings {
  enabled: boolean;
  weight: number;
  themes: string[];
  maxDurationSec: number;
}

export interface StreamSettings {
  enabled: boolean;
  /** When stopping: finish the running game first (true) or stop now. */
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
  sceneLanguage: (typeof SCENE_LANGUAGES)[number];
}

export function defaultSettings(): StreamSettings {
  const games = {} as Record<StreamGameId, StreamGameSettings>;
  for (const id of STREAM_GAME_IDS) {
    games[id] = {
      enabled: true,
      weight: 1,
      themes: [...STREAM_THEMES],
      maxDurationSec: DEFAULT_MAX_DURATION_SEC[id],
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
  };
}

export function clamp(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function pickEnum<T extends string | number>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly unknown[]).includes(value)
    ? (value as T) // narrowed by the includes() check above
    : fallback;
}

/** Track names only: no paths, no control characters, bounded length. */
export const TRACK_NAME_PATTERN = /^[\p{L}\p{N} _.()'&,-]{1,100}$/u;

export function isValidTrackName(name: unknown): name is string {
  return (
    typeof name === 'string' &&
    TRACK_NAME_PATTERN.test(name) &&
    !name.includes('..')
  );
}

export function isValidJoinUrl(value: string): boolean {
  if (value === '') return true;
  if (value.length > LIMITS.joinUrlLength) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

const BLOCKED_WORDS = [
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'nigger',
  'nigga',
  'faggot',
  'whore',
  'slut',
  'dick',
  'cock',
  'pussy',
  'asshole',
  'bastard',
  'nazi',
  'rape',
];

/** Lowercase, undo common leetspeak, drop separators so "f.u.c.k" is caught. */
function squash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[^a-z]/g, '');
}

export function containsProfanity(text: string): boolean {
  const squashed = squash(text);
  return BLOCKED_WORDS.some((w) => squashed.includes(w));
}

/** Banner text rules: printable, no links or finance claims, short. */
export function bannerProblem(text: string): string | null {
  if (text.length > LIMITS.bannerLength) return 'stream.bannerTooLong';
  // eslint-disable-next-line no-control-regex -- rejecting control chars is the point
  if (/[\u0000-\u001f\u007f<>]/.test(text)) return 'stream.bannerInvalid';
  if (/—|–/.test(text)) return 'stream.bannerInvalid';
  if (/https?:|www\./i.test(text)) return 'stream.bannerInvalid';
  if (containsProfanity(text)) return 'stream.bannerProfanity';
  return null;
}

type Loose = Record<string, unknown>;
const asObj = (v: unknown): Loose =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Loose) : {};
const asBool = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;

/**
 * Merge any (possibly partial, possibly hostile) input over a base and clamp
 * every value to the hard limits. Always returns a valid StreamSettings.
 */
export function normalizeSettings(
  input: unknown,
  base: StreamSettings = defaultSettings(),
): StreamSettings {
  const src = asObj(input);
  const games = {} as Record<StreamGameId, StreamGameSettings>;
  const srcGames = asObj(src.games);
  for (const id of STREAM_GAME_IDS) {
    const b = base.games[id];
    const g = asObj(srcGames[id]);
    const themes = Array.isArray(g.themes)
      ? [...new Set(g.themes)].filter((t): t is string =>
          (STREAM_THEMES as readonly unknown[]).includes(t),
        )
      : b.themes;
    games[id] = {
      enabled: asBool(g.enabled, b.enabled),
      weight: clamp(g.weight ?? b.weight, LIMITS.weight.min, LIMITS.weight.max),
      // An empty theme list would break room creation: fall back to all.
      themes: themes.length ? themes : [...STREAM_THEMES],
      maxDurationSec: clamp(
        g.maxDurationSec ?? b.maxDurationSec,
        LIMITS.maxDurationSec.min,
        LIMITS.maxDurationSec.max,
      ),
    };
  }
  const bot = asObj(src.bot);
  const overlay = asObj(src.overlay);
  const parts = asObj(overlay.parts);
  const music = asObj(src.music);
  const video = asObj(src.video);
  const joinUrl =
    typeof overlay.joinUrl === 'string' ? overlay.joinUrl.trim() : undefined;
  const banner =
    typeof overlay.bannerText === 'string'
      ? overlay.bannerText.replace(/\s+/g, ' ').trim()
      : undefined;
  const tracks = Array.isArray(music.tracks)
    ? [...new Set(music.tracks.filter(isValidTrackName))].slice(
        0,
        LIMITS.maxTracks,
      )
    : base.music.tracks;
  const nextParts = {} as Record<OverlayPart, boolean>;
  for (const p of OVERLAY_PARTS) {
    nextParts[p] = asBool(parts[p], base.overlay.parts[p]);
  }
  return {
    enabled: asBool(src.enabled, base.enabled),
    stopGracefully: asBool(src.stopGracefully, base.stopGracefully),
    games,
    bot: {
      difficulty: pickEnum(
        bot.difficulty,
        BOT_DIFFICULTIES,
        base.bot.difficulty,
      ),
      moveDelayMs: clamp(
        bot.moveDelayMs ?? base.bot.moveDelayMs,
        LIMITS.moveDelayMs.min,
        LIMITS.moveDelayMs.max,
      ),
    },
    secondsBetweenGames: clamp(
      src.secondsBetweenGames ?? base.secondsBetweenGames,
      LIMITS.secondsBetweenGames.min,
      LIMITS.secondsBetweenGames.max,
    ),
    overlay: {
      joinUrl:
        joinUrl !== undefined && isValidJoinUrl(joinUrl)
          ? joinUrl
          : base.overlay.joinUrl,
      showQr: asBool(overlay.showQr, base.overlay.showQr),
      parts: nextParts,
      bannerText:
        banner !== undefined && bannerProblem(banner) === null
          ? banner
          : base.overlay.bannerText,
    },
    music: {
      volume: clamp(
        music.volume ?? base.music.volume,
        LIMITS.musicVolume.min,
        LIMITS.musicVolume.max,
      ),
      tracks,
    },
    video: {
      resolution: pickEnum(
        video.resolution,
        RESOLUTIONS,
        base.video.resolution,
      ),
      fps: pickEnum(video.fps, FPS_VALUES, base.video.fps),
      bitrateKbps: clamp(
        video.bitrateKbps ?? base.video.bitrateKbps,
        LIMITS.bitrateKbps.min,
        LIMITS.bitrateKbps.max,
      ),
      preset: pickEnum(video.preset, X264_PRESETS, base.video.preset),
    },
    sceneLanguage: pickEnum(
      src.sceneLanguage,
      SCENE_LANGUAGES,
      base.sceneLanguage,
    ),
  };
}

export function enabledGameCount(s: StreamSettings): number {
  return STREAM_GAME_IDS.filter((id) => s.games[id].enabled).length;
}

export interface SettingChange {
  path: string;
  from: unknown;
  to: unknown;
}

/** Flat list of leaf differences, e.g. `games.chess_v1.weight: 1 -> 3`. */
export function diffSettings(
  a: unknown,
  b: unknown,
  path = '',
): SettingChange[] {
  const isObj = (v: unknown): v is Loose =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  if (isObj(a) && isObj(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((k) =>
      diffSettings(a[k], b[k], path ? `${path}.${k}` : k),
    );
  }
  return JSON.stringify(a) === JSON.stringify(b)
    ? []
    : [{ path, from: a, to: b }];
}
