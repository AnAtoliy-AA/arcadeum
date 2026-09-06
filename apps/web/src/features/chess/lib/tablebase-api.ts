import { resolveApiUrl } from '@/shared/lib/api-base';

export interface TablebaseResult {
  category: 'win' | 'loss' | 'draw' | 'win-guaranteed' | 'maybe-win';
  dtz: number | null;
  dtm: number | null;
}

export async function probeTablebase(
  fen: string,
): Promise<TablebaseResult | null> {
  try {
    const url = resolveApiUrl(
      `/chess/tablebase/probe?fen=${encodeURIComponent(fen)}`,
    );
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data as TablebaseResult;
  } catch {
    return null;
  }
}

export async function isTablebasePosition(
  fen: string,
): Promise<boolean> {
  try {
    const url = resolveApiUrl(
      `/chess/tablebase/check?fen=${encodeURIComponent(fen)}`,
    );
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return data.isTablebase === true;
  } catch {
    return false;
  }
}
