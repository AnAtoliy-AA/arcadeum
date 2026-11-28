import { Types } from 'mongoose';
import type { ActivityFeedActorDto, ActorKind } from './activity-feed.types';

/** Projection of the user fields the feed is allowed to read. */
export interface FeedUserRecord {
  _id: { toString(): string };
  username?: string | null;
  displayName?: string | null;
  role?: string | null;
  equippedAvatarId?: string | null;
  equippedFrameId?: string | null;
  isBlocked?: boolean | null;
  deletedAt?: Date | null;
}

export const FEED_USER_PROJECTION = {
  username: 1,
  displayName: 1,
  role: 1,
  equippedAvatarId: 1,
  equippedFrameId: 1,
  isBlocked: 1,
  deletedAt: 1,
} as const;

/** Classify a participant id without touching the database. */
export function classifyParticipantId(id: string): 'bot' | 'guest' | 'user' {
  if (id.startsWith('bot-')) return 'bot';
  if (!Types.ObjectId.isValid(id) || !/^[a-f0-9]{24}$/i.test(id)) {
    return 'guest';
  }
  return 'user';
}

/** Ids that need a user lookup (registered accounts only). */
export function collectUserIds(ids: Iterable<string>): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    if (id && classifyParticipantId(id) === 'user') out.add(id);
  }
  return [...out];
}

function anonymous(kind: ActorKind): ActivityFeedActorDto {
  return {
    kind,
    name: null,
    profileId: null,
    avatarId: null,
    frameId: null,
    role: null,
  };
}

/**
 * Build the public actor view. Never includes email, raw guest/bot ids or
 * anything about deleted/blocked accounts.
 */
export function toActor(
  id: string,
  users: Map<string, FeedUserRecord>,
): ActivityFeedActorDto {
  const kind = classifyParticipantId(id);
  if (kind !== 'user') return anonymous(kind);
  const user = users.get(id);
  if (!user || user.isBlocked || user.deletedAt) return anonymous('hidden');
  const name = user.displayName?.trim() || user.username?.trim() || null;
  if (!name) return anonymous('hidden');
  return {
    kind: 'user',
    name,
    profileId: id,
    avatarId: user.equippedAvatarId ?? null,
    frameId: user.equippedFrameId ?? null,
    role: user.role ?? null,
  };
}
