import type { ActivityFeedType } from './activity-feed.schema';
import { toActor, type FeedUserRecord } from './activity-feed.actors';
import {
  ACTIVITY_MATCH_RESULTS,
  type ActivityEndReason,
  type ActivityFeedFilter,
  type ActivityFeedItemDto,
  type ActivityMatchResult,
} from './activity-feed.types';

/** Shape of a stored feed row as returned by `.lean()`. */
export interface StoredFeedItem {
  _id: { toString(): string };
  type: ActivityFeedType;
  userId: string;
  gameId?: string;
  detail?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const asString = (v: unknown): string | null =>
  typeof v === 'string' && v.length > 0 ? v : null;

const asNumber = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

const asIdList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

function asResult(item: StoredFeedItem): ActivityMatchResult | null {
  const raw = item.metadata?.result;
  if (
    typeof raw === 'string' &&
    (ACTIVITY_MATCH_RESULTS as readonly string[]).includes(raw)
  ) {
    return raw as ActivityMatchResult;
  }
  // Legacy rows (before metadata existed) only knew about draws reliably:
  // "won a game" was written for every player, losers included.
  if (item.type === 'game_completed' && item.detail === 'played a draw') {
    return 'draw';
  }
  return null;
}

function asEndReason(v: unknown): ActivityEndReason | null {
  return v === 'forfeit' || v === 'timeout' ? v : null;
}

function asScore(v: unknown): ActivityFeedItemDto['score'] {
  const s = v as { actor?: unknown; opponents?: unknown } | null | undefined;
  const actor = asNumber(s?.actor);
  if (actor === null || !Array.isArray(s?.opponents)) return null;
  const opponents = s.opponents.filter(
    (n): n is number => typeof n === 'number' && Number.isFinite(n),
  );
  return opponents.length > 0 ? { actor, opponents } : null;
}

/** Every participant id a row references (actor, opponents, teammates). */
export function referencedIds(item: StoredFeedItem): string[] {
  return [
    item.userId,
    ...asIdList(item.metadata?.opponentIds),
    ...asIdList(item.metadata?.teammateIds),
  ];
}

export function toFeedItemDto(
  item: StoredFeedItem,
  users: Map<string, FeedUserRecord>,
): ActivityFeedItemDto {
  const m = item.metadata ?? {};
  const achievementId = asString(m.achievementId);
  const tournamentId = asString(m.tournamentId);
  return {
    id: item._id.toString(),
    type: item.type,
    timestamp: item.createdAt.toISOString(),
    gameId: asString(item.gameId),
    actor: toActor(item.userId, users),
    opponents: asIdList(m.opponentIds).map((id) => toActor(id, users)),
    teammates: asIdList(m.teammateIds).map((id) => toActor(id, users)),
    result: asResult(item),
    endReason: asEndReason(m.endReason),
    score: asScore(m.score),
    ratingDelta: asNumber(m.ratingDelta),
    replayId: asString(m.replayId),
    achievement: achievementId
      ? { id: achievementId, name: asString(m.achievementName) ?? '' }
      : null,
    level: asNumber(m.level),
    streak: asNumber(m.streak),
    tournament: tournamentId
      ? { id: tournamentId, name: asString(m.tournamentName) ?? '' }
      : null,
  };
}

/** Mongo filter for a feed tab. */
export function filterQuery(
  filter: ActivityFeedFilter | undefined,
): Record<string, unknown> {
  switch (filter) {
    case 'wins':
      return { type: 'game_completed', 'metadata.result': 'win' };
    case 'achievements':
      return {
        type: { $in: ['achievement_unlocked', 'level_up', 'win_streak'] },
      };
    case 'tournaments':
      return { type: 'tournament_won' };
    default:
      return {};
  }
}
