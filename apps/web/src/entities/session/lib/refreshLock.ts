const REFRESH_LOCK_KEY = 'web_session_refresh_lock';

/**
 * Cross-tab refresh deduplication.
 *
 * Refresh tokens are rotated on every use, so two tabs refreshing at the
 * same instant race: the first one revokes the shared cookie token and the
 * second gets a 401 even though the session is fine. This lock lets a
 * single tab win the race while the others back off and retry with the
 * freshly rotated cookie.
 *
 * localStorage is used (not sessionStorage) because it is shared across
 * tabs of the same origin. The lock is TTL-based so a crashed tab can
 * never wedge the others; there is nothing to release on success.
 *
 * Returns true if this caller may proceed with a refresh, false if another
 * tab refreshed within the last `ttlMs` milliseconds.
 */
export function acquireRefreshLock(ttlMs = 10_000): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(REFRESH_LOCK_KEY);
    if (raw) {
      const lastRefreshAt = Number(raw);
      if (Number.isFinite(lastRefreshAt) && now - lastRefreshAt < ttlMs) {
        return false;
      }
    }
    window.localStorage.setItem(REFRESH_LOCK_KEY, String(now));
    return true;
  } catch {
    // Storage unavailable (private mode / disabled) — allow the refresh.
    return true;
  }
}
