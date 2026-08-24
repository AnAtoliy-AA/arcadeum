import type { SeasonTheme } from '../model/types';

/** Static palette accents per season theme (hex literals like genre palettes). */
const THEME_ACCENTS: Record<SeasonTheme, string> = {
  ember: '#f97316',
  tides: '#22d3ee',
  frost: '#7dd3fc',
  bloom: '#f472b6',
  eclipse: '#a78bfa',
  aurora: '#34d399',
  dawn: '#facc15',
  dusk: '#fb7185',
};

export function seasonAccent(theme: SeasonTheme | undefined): string {
  if (!theme) return THEME_ACCENTS.ember;
  return THEME_ACCENTS[theme] ?? THEME_ACCENTS.ember;
}

/**
 * Fraction of the season elapsed, clamped to [0, 1].
 * Returns 0 for invalid/unparseable windows so UI never divides by zero.
 */
export function seasonProgress(
  startsAt: string,
  endsAt: string,
  now: number = Date.now(),
): number {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }
  const ratio = (now - start) / (end - start);
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(1, Math.max(0, ratio));
}

/** Whole days left until `endsAt`, floored at 0. */
export function daysRemaining(
  endsAt: string,
  now: number = Date.now(),
): number {
  const end = Date.parse(endsAt);
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - now) / 86_400_000));
}
