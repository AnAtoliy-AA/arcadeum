import { resolveApiUrl } from '@/shared/lib/api-base';

export type ActivityFeedType =
  | 'game_completed'
  | 'achievement_unlocked'
  | 'level_up'
  | 'win_streak'
  | 'tournament_won';

export type ActivityMatchResult = 'win' | 'loss' | 'draw';
export type ActivityEndReason = 'forfeit' | 'timeout';
export type ActivityFeedFilter =
  'all' | 'wins' | 'achievements' | 'tournaments';
export type ActivityActorKind = 'user' | 'guest' | 'bot' | 'hidden';

/** Public view of a participant (mirrors the BE ActivityFeedActorDto). */
export interface ActivityFeedActor {
  kind: ActivityActorKind;
  name: string | null;
  /** Public player id for `/players/:id`; null for guests, bots, hidden. */
  profileId: string | null;
  avatarId: string | null;
  frameId: string | null;
  role: string | null;
}

export interface ActivityFeedItem {
  id: string;
  type: ActivityFeedType;
  timestamp: string;
  gameId: string | null;
  actor: ActivityFeedActor;
  opponents: ActivityFeedActor[];
  teammates: ActivityFeedActor[];
  result: ActivityMatchResult | null;
  endReason: ActivityEndReason | null;
  score: { actor: number; opponents: number[] } | null;
  ratingDelta: number | null;
  replayId: string | null;
  achievement: { id: string; name: string } | null;
  level: number | null;
  streak: number | null;
  tournament: { id: string; name: string } | null;
}

export interface ActivityFeedPage {
  items: ActivityFeedItem[];
  hasMore: boolean;
}

export interface FetchActivityFeedOptions {
  limit?: number;
  before?: string;
  filter?: ActivityFeedFilter;
  gameId?: string;
}

export function buildActivityFeedPath(options: FetchActivityFeedOptions = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.before) params.set('before', options.before);
  if (options.filter && options.filter !== 'all') {
    params.set('filter', options.filter);
  }
  if (options.gameId) params.set('gameId', options.gameId);
  const qs = params.toString();
  return `/activity/feed${qs ? `?${qs}` : ''}`;
}

export async function fetchActivityFeed(
  options: FetchActivityFeedOptions = {},
): Promise<ActivityFeedPage> {
  const res = await fetch(resolveApiUrl(buildActivityFeedPath(options)), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Activity feed request failed: ${res.status}`);
  const data = (await res.json()) as ActivityFeedPage | ActivityFeedItem[];
  // Older API versions returned a bare array; normalise during rollout.
  if (Array.isArray(data)) return { items: [], hasMore: false };
  return { items: data.items ?? [], hasMore: Boolean(data.hasMore) };
}
