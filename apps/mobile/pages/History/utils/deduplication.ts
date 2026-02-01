import type { HistorySummary } from '../api/historyApi';

/**
 * Removes duplicate entries from the history list based on roomId.
 * Keeps the first occurrence of each unique roomId.
 */
export function deduplicateHistoryEntries(
  items: HistorySummary[],
): HistorySummary[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.roomId)) {
      return false;
    }
    seen.add(item.roomId);
    return true;
  });
}
