const REFRESH_LOCK_KEY = 'web_session_refresh_lock';
const TAB_ID_KEY = 'web_session_tab_id';

/**
 * Stable id for this browser tab. sessionStorage survives a reload of the
 * same tab but is not shared with other tabs, which is exactly the identity
 * the lock needs.
 */
function getTabId(): string {
  try {
    const existing = window.sessionStorage.getItem(TAB_ID_KEY);
    if (existing) return existing;
    const created =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(TAB_ID_KEY, created);
    return created;
  } catch {
    return 'unknown-tab';
  }
}

/**
 * Cross-tab refresh deduplication.
 *
 * Refresh tokens are rotated on every use, so two tabs refreshing at the
 * same instant race: the first one revokes the shared cookie token and the
 * second gets a 401 even though the session is fine. This lock lets a
 * single tab win the race while the others back off and retry with the
 * freshly rotated cookie.
 *
 * The lock records which tab took it. A reload of the SAME tab is not a
 * race (the previous page is gone and the cookie is the source of truth),
 * so it may refresh immediately. Without this, reloading twice within the
 * TTL left the page without an access token (looking logged out) until the
 * retry timer fired.
 *
 * localStorage is used (not sessionStorage) for the lock because it is
 * shared across tabs of the same origin. The lock is TTL-based so a crashed
 * tab can never wedge the others; there is nothing to release on success.
 * The stored value is `<timestamp>|<tabId>`; a bare timestamp written by an
 * older client is still honoured.
 *
 * Returns true if this caller may proceed with a refresh, false if another
 * tab refreshed within the last `ttlMs` milliseconds.
 */
export function acquireRefreshLock(ttlMs = 10_000): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const now = Date.now();
    const tabId = getTabId();
    const raw = window.localStorage.getItem(REFRESH_LOCK_KEY);
    if (raw) {
      const [stamp, holder] = raw.split('|');
      const lastRefreshAt = Number(stamp);
      if (
        Number.isFinite(lastRefreshAt) &&
        now - lastRefreshAt < ttlMs &&
        holder !== tabId
      ) {
        return false;
      }
    }
    window.localStorage.setItem(REFRESH_LOCK_KEY, `${now}|${tabId}`);
    return true;
  } catch {
    // Storage unavailable (private mode / disabled) - allow the refresh.
    return true;
  }
}
