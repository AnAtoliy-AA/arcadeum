import type { ActivityFeedItem } from '@/shared/api/activity';

/** Window in which repeated results by the same player are merged. */
export const GROUP_WINDOW_MS = 60 * 60 * 1000;

export type ActivityEntry =
  | { kind: 'single'; key: string; item: ActivityFeedItem }
  | { kind: 'group'; key: string; items: ActivityFeedItem[] };

/**
 * Identity used to decide whether two rows are "the same thing again".
 * Only registered players are grouped: guests and hidden accounts are
 * different people even though they render the same label.
 */
function groupKey(item: ActivityFeedItem): string | null {
  if (item.type !== 'game_completed') return null;
  if (item.actor.kind !== 'user' || !item.actor.profileId) return null;
  return [
    item.actor.profileId,
    item.gameId ?? '',
    item.result ?? 'played',
  ].join('|');
}

/**
 * Merge runs of near-identical match results ("Alice won 5 Sea Battle
 * games in the last hour"). Items must be sorted newest first; a run is
 * consecutive rows with the same player, game and result whose oldest
 * row is within GROUP_WINDOW_MS of the newest.
 */
export function groupActivity(items: ActivityFeedItem[]): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  let run: ActivityFeedItem[] = [];
  let runKey: string | null = null;

  const flush = () => {
    if (run.length === 0) return;
    if (run.length === 1) {
      entries.push({ kind: 'single', key: run[0].id, item: run[0] });
    } else {
      entries.push({ kind: 'group', key: `g-${run[0].id}`, items: run });
    }
    run = [];
    runKey = null;
  };

  for (const item of items) {
    const key = groupKey(item);
    const withinWindow =
      run.length > 0 &&
      Date.parse(run[0].timestamp) - Date.parse(item.timestamp) <=
        GROUP_WINDOW_MS;
    if (key !== null && key === runKey && withinWindow) {
      run.push(item);
      continue;
    }
    flush();
    run = [item];
    runKey = key;
  }
  flush();
  return entries;
}

/** Ids that are in `fresh` but not already shown. */
export function newItemsSince(
  current: ActivityFeedItem[],
  fresh: ActivityFeedItem[],
): ActivityFeedItem[] {
  const known = new Set(current.map((i) => i.id));
  return fresh.filter((i) => !known.has(i.id));
}

/** Append a page, dropping duplicates (cursor pages can overlap). */
export function mergeOlder(
  current: ActivityFeedItem[],
  older: ActivityFeedItem[],
): ActivityFeedItem[] {
  return [...current, ...newItemsSince(current, older)];
}
