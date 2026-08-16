const KEY = 'arc:announcements:dismissed';
const CAP = 50;

/**
 * Cookie mirror of the latest dismissal. The server reads it when
 * server-rendering the banner so dismissed announcements never appear
 * after hydration (which would cause CLS when the banner is removed).
 */
export const DISMISSED_COOKIE = 'arc-announcement-dismissed';
export const DISMISSED_COOKIE_MAX_AGE = 31_536_000; // 1 year, seconds

export interface DismissedEntry {
  id: string;
  updatedAt: string;
}

function encodeEntry(entry: DismissedEntry): string {
  return `${encodeURIComponent(entry.id)}|${encodeURIComponent(entry.updatedAt)}`;
}

function decodeEntry(raw: string | null): DismissedEntry | null {
  if (!raw) return null;
  const sep = raw.indexOf('|');
  if (sep === -1) return null;
  try {
    const id = decodeURIComponent(raw.slice(0, sep));
    const updatedAt = decodeURIComponent(raw.slice(sep + 1));
    if (!id || !updatedAt) return null;
    return { id, updatedAt };
  } catch {
    return null;
  }
}

/** Server-side check: is this entry the one stored in the dismissal cookie? */
export function isDismissedInCookie(
  raw: string | null,
  entry: DismissedEntry,
): boolean {
  const stored = decodeEntry(raw);
  return (
    stored !== null &&
    stored.id === entry.id &&
    stored.updatedAt === entry.updatedAt
  );
}

/** Client-side: persist a dismissal in both the cookie and localStorage. */
export function writeDismissedCookie(entry: DismissedEntry): void {
  if (typeof window === 'undefined') return;
  const encoded = encodeEntry(entry);
  document.cookie = `${DISMISSED_COOKIE}=${encoded}; path=/; max-age=${DISMISSED_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function safeParse(raw: string | null): DismissedEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is DismissedEntry =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as { id?: unknown }).id === 'string' &&
        typeof (e as { updatedAt?: unknown }).updatedAt === 'string',
    );
  } catch {
    return [];
  }
}

export function getDismissed(): DismissedEntry[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function addDismissed(entry: DismissedEntry): void {
  if (typeof window === 'undefined') return;
  const existing = getDismissed().filter((e) => e.id !== entry.id);
  const next = [entry, ...existing].slice(0, CAP);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function isDismissed(entry: DismissedEntry): boolean {
  return getDismissed().some(
    (e) => e.id === entry.id && e.updatedAt === entry.updatedAt,
  );
}
