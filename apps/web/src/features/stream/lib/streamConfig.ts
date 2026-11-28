/**
 * Shared constants and helpers for the broadcast ("stream") scenes.
 *
 * The scenes are rendered in a headless browser and captured to a live
 * stream, so everything here is deliberately defensive: query params come
 * from a script, are clamped and sanitised, and never throw.
 */

/** Request header set by `proxy.ts` on `/{locale}/stream/**` requests. */
export const STREAM_HEADER = 'x-arcadeum-stream';

/** First path segment after the locale that marks a broadcast route. */
export const STREAM_SEGMENT = 'stream';

/** Bot-vs-bot games the stream may rotate through (mirrors the BE list). */
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

const DEFAULT_JOIN_URL = 'https://arcadeum.games';

/** Where the call to action and QR code point. Configurable per deploy. */
export function getStreamJoinUrl(): string {
  const raw = process.env.NEXT_PUBLIC_STREAM_JOIN_URL?.trim();
  if (!raw) return DEFAULT_JOIN_URL;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString().replace(/\/$/, '')
      : DEFAULT_JOIN_URL;
  } catch {
    return DEFAULT_JOIN_URL;
  }
}

/** Human readable host of the join URL, e.g. `arcadeum.games`. */
export function getStreamJoinHost(
  joinUrl: string = getStreamJoinUrl(),
): string {
  try {
    return new URL(joinUrl).host;
  } catch {
    return 'arcadeum.games';
  }
}

type SearchParamValue = string | string[] | undefined;
export type RawSearchParams = Record<string, SearchParamValue>;

function first(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `?debug=1` (or `true`) switches on diagnostics. */
export function parseDebug(value: SearchParamValue): boolean {
  const v = first(value)?.toLowerCase();
  return v === '1' || v === 'true';
}

/** Countdown seconds, clamped to a sane range. */
export function parseSeconds(
  value: SearchParamValue,
  fallback = 20,
  max = 600,
): number {
  const n = Number.parseInt(first(value) ?? '', 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, max);
}

/** Free text from the URL: strip control chars, collapse spaces, cap length. */
export function sanitizeText(value: SearchParamValue, maxLength = 80): string {
  const raw = first(value) ?? '';
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ');
  return cleaned.trim().slice(0, maxLength);
}

/** Accepts only known game ids so arbitrary text never reaches the UI. */
export function parseGameId(value: SearchParamValue): StreamGameId | null {
  const v = first(value);
  return (STREAM_GAME_IDS as readonly string[]).includes(v ?? '')
    ? (v as StreamGameId) // narrowed by the includes() check above
    : null;
}

const STREAM_PATH = /^\/(?:(?:en|ru|es|fr|by)\/)?stream(?:\/|$)/;

export function isStreamPath(pathname: string | null | undefined): boolean {
  return !!pathname && STREAM_PATH.test(pathname);
}

/** Caption language. Only English exists for the MVP; others fall back. */
export type CaptionLang = 'en';

export function parseCaptionLang(value: SearchParamValue): CaptionLang {
  void value;
  return 'en';
}

/** Overlay pieces an admin may hide (`?hide=players,cta`). */
export const OVERLAY_PARTS = [
  'players',
  'status',
  'cta',
  'moves',
  'arc',
] as const;
export type OverlayPart = (typeof OVERLAY_PARTS)[number];

export interface OverlayOptions {
  joinUrl: string;
  showQr: boolean;
  banner: string;
  parts: Record<OverlayPart, boolean>;
}

/** `?join=` override for the call to action: http(s) only, bounded length. */
export function parseJoinUrl(value: SearchParamValue): string | null {
  const raw = first(value)?.trim();
  if (!raw || raw.length > 200) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString().replace(/\/$/, '')
      : null;
  } catch {
    return null;
  }
}

/** `?hide=players,cta` lists parts to hide; unknown names are ignored. */
export function parseOverlayParts(
  value: SearchParamValue,
): Record<OverlayPart, boolean> {
  const hidden = new Set(
    (first(value) ?? '')
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean),
  );
  return {
    players: !hidden.has('players'),
    status: !hidden.has('status'),
    cta: !hidden.has('cta'),
    moves: !hidden.has('moves'),
    arc: !hidden.has('arc'),
  };
}

/**
 * Overlay options written by the stream director from the admin settings:
 * `?join=&qr=0&banner=&hide=`. Everything is validated; defaults match the
 * original scene (env join URL, everything visible, no banner).
 */
export function parseOverlayOptions(query: RawSearchParams): OverlayOptions {
  return {
    joinUrl: parseJoinUrl(query.join) ?? getStreamJoinUrl(),
    showQr: first(query.qr) !== '0',
    banner: sanitizeText(query.banner, 80),
    parts: parseOverlayParts(query.hide),
  };
}

/** Room ids are Mongo ids or short codes; reject anything else early. */
export function isValidRoomId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,64}$/.test(value);
}
