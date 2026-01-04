import { useCallback, useMemo } from 'react';
import type {
  GameRoomSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsCard,
} from '../types';

interface DisplayNameResolverOptions {
  currentUserId: string | null;
  room: GameRoomSummary;
  snapshot: ExplodingCatsSnapshot | null;
  youLabel: string;
  translateCardType?: (cardType: ExplodingCatsCard) => string;
  seeTheFutureLabel?: string;
}

/**
 * Hook for resolving display names and formatting log messages
 */
export function useDisplayNames({
  currentUserId,
  room,
  snapshot,
  youLabel,
  translateCardType,
  seeTheFutureLabel,
}: DisplayNameResolverOptions) {
  const resolveDisplayName = useCallback(
    (userId?: string | null, fallback?: string | null) => {
      if (!userId) {
        return fallback ?? '';
      }
      if (userId === currentUserId) {
        return youLabel || 'You';
      }
      if (room.host?.id === userId) {
        return room.host.displayName || room.host.id;
      }
      const member = room.members?.find((candidate) => candidate.id === userId);
      if (member) {
        return member.displayName || member.id;
      }
      return (
        fallback || (userId.length > 8 ? `${userId.slice(0, 8)}…` : userId)
      );
    },
    [currentUserId, room.host, room.members, youLabel],
  );

  const participantReplacements = useMemo(() => {
    const entries = new Map<string, string>();
    const register = (userId?: string | null, fallback?: string | null) => {
      if (!userId) return;
      if (entries.has(userId)) return;
      entries.set(userId, resolveDisplayName(userId, fallback));
    };

    register(room.host?.id, room.host?.displayName ?? null);
    room.members?.forEach((member) =>
      register(member.id, member.displayName ?? null),
    );
    snapshot?.players.forEach((player) =>
      register(
        player.playerId,
        player.playerId === currentUserId
          ? youLabel || 'You'
          : `Player ${player.playerId.slice(0, 8)}`,
      ),
    );

    return Array.from(entries.entries()).sort(
      (a, b) => b[0].length - a[0].length,
    );
  }, [
    currentUserId,
    resolveDisplayName,
    room.host,
    room.members,
    snapshot?.players,
    youLabel,
  ]);

  const formatLogMessage = useCallback(
    (message?: string | null) => {
      if (!message) {
        return message || '';
      }

      // Handle seeTheFuture.reveal:cards:card1,cards:card2,cards:card3 format
      if (message.startsWith('seeTheFuture.reveal:')) {
        const cardKeysStr = message.slice('seeTheFuture.reveal:'.length);
        const cardKeys = cardKeysStr.split(',');
        const translatedCards = cardKeys.map((key) => {
          // key format is "cards:card_type"
          if (key.startsWith('cards:')) {
            const cardType = key.slice('cards:'.length) as ExplodingCatsCard;
            return translateCardType ? translateCardType(cardType) : cardType;
          }
          return key;
        });
        const label = seeTheFutureLabel || 'See the Future';
        return `${label} 🔮: ${translatedCards.join(', ')}`;
      }

      if (participantReplacements.length === 0) {
        return message;
      }
      return participantReplacements.reduce((acc, [id, name]) => {
        if (!id || !name || id === name || !acc.includes(id)) {
          return acc;
        }
        return acc.split(id).join(name);
      }, message);
    },
    [participantReplacements, translateCardType, seeTheFutureLabel],
  );

  return {
    resolveDisplayName,
    formatLogMessage,
  };
}
