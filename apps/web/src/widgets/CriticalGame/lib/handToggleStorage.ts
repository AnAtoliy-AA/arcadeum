/**
 * Hand-card text-toggle persistence for `MatchWidget`. Each user gets a
 * namespaced localStorage entry so multiple accounts on the same browser
 * don't share preferences. All failures (Safari private mode, quota,
 * JSON corruption) fall through to the supplied default so a bad cache
 * entry can never break a live match.
 */

export type HandToggleField = 'name' | 'description';

/** SSR-safe read with default fallback on any failure. */
export function readHandToggle(
  key: string | null,
  field: HandToggleField,
  fallback: boolean,
): boolean {
  if (!key || typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Record<HandToggleField, boolean>>;
    const value = parsed?.[field];
    return typeof value === 'boolean' ? value : fallback;
  } catch {
    return fallback;
  }
}

/** Silent write — storage failures don't surface to the caller. */
export function writeHandToggle(
  key: string | null,
  field: HandToggleField,
  value: boolean,
): void {
  if (!key || typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw
      ? ((JSON.parse(raw) as Partial<Record<HandToggleField, boolean>>) ?? {})
      : {};
    parsed[field] = value;
    window.localStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    /* localStorage unavailable (Safari private mode, quota) — silent skip */
  }
}
