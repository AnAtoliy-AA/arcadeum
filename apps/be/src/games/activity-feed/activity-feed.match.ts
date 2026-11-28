import type {
  ActivityEndReason,
  ActivityMatchResult,
  GameCompletedMetadata,
} from './activity-feed.types';
import { classifyParticipantId } from './activity-feed.actors';

export interface MatchEventInput {
  playerIds: string[];
  winners: string[];
  gameId: string;
  /** Final engine state, when the caller has it (live sessions do). */
  state?: Record<string, unknown> | null;
  replayId?: string | null;
}

export interface MatchEvent {
  userId: string;
  gameId: string;
  metadata: GameCompletedMetadata;
}

const isBot = (id: string) => id.startsWith('bot-');

const FORFEIT_KINDS = new Set([
  'forfeit',
  'resign',
  'resignation',
  'surrender',
]);
const TIMEOUT_KINDS = new Set(['timeout']);

/** Best-effort end reason from engine state (chess endReason or last log). */
export function deriveEndReason(
  state: Record<string, unknown> | null | undefined,
): ActivityEndReason | undefined {
  if (!state) return undefined;
  const endReason = state.endReason;
  if (endReason === 'resignation') return 'forfeit';
  if (endReason === 'timeout') return 'timeout';
  if (typeof endReason === 'string') return undefined;
  const logs = Array.isArray(state.logs) ? state.logs : [];
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i] as { type?: unknown; kind?: unknown } | null;
    if (!log || log.type !== 'action') continue;
    const kind = typeof log.kind === 'string' ? log.kind.toLowerCase() : '';
    if (FORFEIT_KINDS.has(kind)) return 'forfeit';
    if (TIMEOUT_KINDS.has(kind)) return 'timeout';
    return undefined;
  }
  return undefined;
}

/** Per-player numeric score when the engine tracks one for everybody. */
export function deriveScore(
  state: Record<string, unknown> | null | undefined,
  actorId: string,
  opponentIds: string[],
): { actor: number; opponents: number[] } | undefined {
  const players = Array.isArray(state?.players) ? state.players : [];
  const scores = new Map<string, number>();
  for (const p of players) {
    const player = p as { playerId?: unknown; score?: unknown } | null;
    if (
      player &&
      typeof player.playerId === 'string' &&
      typeof player.score === 'number' &&
      Number.isFinite(player.score)
    ) {
      scores.set(player.playerId, player.score);
    }
  }
  const actor = scores.get(actorId);
  if (actor === undefined || opponentIds.length === 0) return undefined;
  const opponents: number[] = [];
  for (const id of opponentIds) {
    const s = scores.get(id);
    if (s === undefined) return undefined;
    opponents.push(s);
  }
  return { actor, opponents };
}

function deriveRatingDelta(
  state: Record<string, unknown> | null | undefined,
  actorId: string,
): number | undefined {
  const result = state?.gameResult as
    { ratingDeltas?: Record<string, unknown> } | undefined;
  const delta = result?.ratingDeltas?.[actorId];
  return typeof delta === 'number' && Number.isFinite(delta)
    ? Math.round(delta)
    : undefined;
}

/**
 * One feed event per finished match, told from the most interesting
 * human's point of view: a human winner when there is one, otherwise the
 * first human (draw, or a loss to a bot). The previous implementation
 * wrote one "won a game" row per human, so losers were shown as winners
 * and every match appeared twice.
 */
export function buildMatchEvent(input: MatchEventInput): MatchEvent | null {
  const players = [...new Set(input.playerIds.filter(Boolean))];
  // Registered accounts first so they are preferred as the actor.
  const humans = players
    .filter((id) => !isBot(id))
    .sort(
      (a, b) =>
        Number(classifyParticipantId(b) === 'user') -
        Number(classifyParticipantId(a) === 'user'),
    );
  if (humans.length === 0) return null;

  const winners = new Set(input.winners);
  const humanWinners = humans.filter((id) => winners.has(id));
  let actorId: string;
  let result: ActivityMatchResult;
  if (winners.size === 0) {
    actorId = humans[0];
    result = 'draw';
  } else if (humanWinners.length > 0) {
    actorId = humanWinners[0];
    result = 'win';
  } else {
    actorId = humans[0];
    result = 'loss';
  }

  const actorWon = winners.has(actorId);
  const others = players.filter((id) => id !== actorId);
  const teammateIds =
    result === 'draw'
      ? []
      : others.filter((id) => winners.has(id) === actorWon);
  const opponentIds = others.filter((id) => !teammateIds.includes(id));

  const metadata: GameCompletedMetadata = { result, opponentIds };
  if (teammateIds.length > 0) metadata.teammateIds = teammateIds;
  if (result !== 'draw') {
    const endReason = deriveEndReason(input.state);
    if (endReason) metadata.endReason = endReason;
  }
  const score = deriveScore(input.state, actorId, opponentIds);
  if (score) metadata.score = score;
  const ratingDelta = deriveRatingDelta(input.state, actorId);
  if (ratingDelta !== undefined) metadata.ratingDelta = ratingDelta;
  if (input.replayId) metadata.replayId = input.replayId;

  return { userId: actorId, gameId: input.gameId, metadata };
}

/** Streak lengths that are worth a feed event. */
// PlayerStatsService.getRecentForms looks at the last 12 results, so
// streaks above that are not observable.
export const WIN_STREAK_MILESTONES = [3, 5, 10] as const;

export function isStreakMilestone(streak: number): boolean {
  return (WIN_STREAK_MILESTONES as readonly number[]).includes(streak);
}
