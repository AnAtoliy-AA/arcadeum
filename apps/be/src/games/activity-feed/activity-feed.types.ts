import type { ActivityFeedType } from './activity-feed.schema';

/** Outcome of a match from the feed actor's point of view. */
export const ACTIVITY_MATCH_RESULTS = ['win', 'loss', 'draw'] as const;
export type ActivityMatchResult = (typeof ACTIVITY_MATCH_RESULTS)[number];

/** How a decisive match ended when it was not played to the end. */
export type ActivityEndReason = 'forfeit' | 'timeout';

export const ACTIVITY_FEED_FILTERS = [
  'all',
  'wins',
  'achievements',
  'tournaments',
] as const;
export type ActivityFeedFilter = (typeof ACTIVITY_FEED_FILTERS)[number];

/**
 * Metadata stored on a `game_completed` event. Participant ids are stored
 * so names can be resolved at read time (renames, deletions and privacy
 * rules apply retroactively); they are never returned to clients as-is.
 */
export interface GameCompletedMetadata {
  result: ActivityMatchResult;
  endReason?: ActivityEndReason;
  opponentIds: string[];
  teammateIds?: string[];
  score?: { actor: number; opponents: number[] };
  ratingDelta?: number;
  replayId?: string;
}

export interface AchievementMetadata {
  achievementId: string;
  achievementName: string;
}

export interface LevelUpMetadata {
  level: number;
}

export interface WinStreakMetadata {
  streak: number;
}

export interface TournamentWonMetadata {
  tournamentId: string;
  tournamentName: string;
}

export type ActorKind = 'user' | 'guest' | 'bot' | 'hidden';

/**
 * Public view of a participant. Registered users expose their public
 * display name, cosmetics and the same player id used by public profile
 * URLs (`/players/:id`). Guests, bots and hidden (deleted or blocked)
 * accounts expose nothing identifying: no id, no name.
 */
export interface ActivityFeedActorDto {
  kind: ActorKind;
  name: string | null;
  profileId: string | null;
  avatarId: string | null;
  frameId: string | null;
  role: string | null;
}

export interface ActivityFeedItemDto {
  id: string;
  type: ActivityFeedType;
  timestamp: string;
  gameId: string | null;
  actor: ActivityFeedActorDto;
  opponents: ActivityFeedActorDto[];
  teammates: ActivityFeedActorDto[];
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

export interface ActivityFeedPageDto {
  items: ActivityFeedItemDto[];
  hasMore: boolean;
}
