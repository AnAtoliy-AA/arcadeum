import {
  STREAM_GAME_IDS,
  type StreamGameId,
  type StreamSettings,
} from '../server/stream.types';

/** Hard limits. Mirrors apps/be/src/stream/stream-settings.model.ts. */
export const LIMITS = {
  weight: { min: 1, max: 10 },
  maxDurationMin: { min: 1, max: 30 },
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

/** Validation error codes; the UI maps each to an i18n key. */
export type FieldErrorCode =
  | 'range'
  | 'integer'
  | 'bannerLong'
  | 'bannerInvalid'
  | 'urlInvalid'
  | 'tracksInvalid'
  | 'minGames'
  | 'themesRequired';

export type FieldErrors = Record<
  string,
  { code: FieldErrorCode; min?: number; max?: number }
>;

const TRACK_NAME = /^[\p{L}\p{N} _.()'&,-]{1,100}$/u;

export const secToMin = (sec: number): number =>
  Math.round((sec / 60) * 10) / 10;
export const minToSec = (min: number): number => Math.round(min * 60);

export function parseTrackLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function checkNumber(
  errors: FieldErrors,
  field: string,
  value: number,
  range: { min: number; max: number },
  integer = true,
): void {
  if (!Number.isFinite(value)) {
    errors[field] = { code: 'range', ...range };
  } else if (integer && !Number.isInteger(value)) {
    errors[field] = { code: 'integer' };
  } else if (value < range.min || value > range.max) {
    errors[field] = { code: 'range', ...range };
  }
}

/** Client-side validation so the admin sees problems before saving. */
export function validateSettings(s: StreamSettings): FieldErrors {
  const e: FieldErrors = {};
  checkNumber(e, 'bot.moveDelayMs', s.bot.moveDelayMs, LIMITS.moveDelayMs);
  checkNumber(
    e,
    'secondsBetweenGames',
    s.secondsBetweenGames,
    LIMITS.secondsBetweenGames,
  );
  checkNumber(e, 'music.volume', s.music.volume, LIMITS.musicVolume);
  checkNumber(e, 'video.bitrateKbps', s.video.bitrateKbps, LIMITS.bitrateKbps);
  for (const id of STREAM_GAME_IDS) {
    const g = s.games[id];
    checkNumber(e, `games.${id}.weight`, g.weight, LIMITS.weight);
    checkNumber(
      e,
      `games.${id}.maxDurationMin`,
      secToMin(g.maxDurationSec),
      LIMITS.maxDurationMin,
      false,
    );
    if (g.enabled && g.themes.length === 0) {
      e[`games.${id}.themes`] = { code: 'themesRequired' };
    }
  }
  if (
    STREAM_GAME_IDS.filter((id) => s.games[id].enabled).length <
    LIMITS.minEnabledGames
  ) {
    e.games = { code: 'minGames', min: LIMITS.minEnabledGames };
  }
  const banner = s.overlay.bannerText;
  if (banner.length > LIMITS.bannerLength)
    e['overlay.bannerText'] = { code: 'bannerLong', max: LIMITS.bannerLength };
  else if (
    /[<>]|https?:|www\./i.test(banner) ||
    /[\u2013\u2014]/.test(banner)
  ) {
    e['overlay.bannerText'] = { code: 'bannerInvalid' };
  }
  if (s.overlay.joinUrl) {
    let ok = s.overlay.joinUrl.length <= LIMITS.joinUrlLength;
    try {
      const u = new URL(s.overlay.joinUrl);
      ok = ok && (u.protocol === 'https:' || u.protocol === 'http:');
    } catch {
      ok = false;
    }
    if (!ok) e['overlay.joinUrl'] = { code: 'urlInvalid' };
  }
  const bad =
    s.music.tracks.length > LIMITS.maxTracks ||
    s.music.tracks.some((t) => !TRACK_NAME.test(t) || t.includes('..'));
  if (bad) e['music.tracks'] = { code: 'tracksInvalid', max: LIMITS.maxTracks };
  return e;
}

export function isSameSettings(a: StreamSettings, b: StreamSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function setGame<K extends keyof StreamSettings['games'][StreamGameId]>(
  s: StreamSettings,
  id: StreamGameId,
  key: K,
  value: StreamSettings['games'][StreamGameId][K],
): StreamSettings {
  return {
    ...s,
    games: { ...s.games, [id]: { ...s.games[id], [key]: value } },
  };
}

/** `HH:MM` style uptime: 3d 4h, 2h 5m, 45s. */
export function formatUptime(sec: number | null): string {
  if (sec === null) return '-';
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec % 60}s`;
  return `${sec}s`;
}

/** Map a backend validation code (`stream.bannerProfanity`) to an errors.* i18n key. */
export function serverErrorKey(code: string | undefined): string | null {
  switch (code?.replace(/^stream\./, '')) {
    case 'bannerProfanity':
      return 'bannerProfanity';
    case 'bannerTooLong':
      return 'bannerLong';
    case 'bannerInvalid':
      return 'bannerInvalid';
    case 'invalidJoinUrl':
      return 'urlInvalid';
    case 'invalidTrackName':
      return 'tracksInvalid';
    case 'minGames':
      return 'minGames';
    default:
      return null;
  }
}
