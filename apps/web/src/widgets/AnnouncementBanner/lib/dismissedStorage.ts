const KEY = 'arc:announcements:dismissed';
const CAP = 50;

export interface DismissedEntry {
  id: string;
  updatedAt: string;
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
