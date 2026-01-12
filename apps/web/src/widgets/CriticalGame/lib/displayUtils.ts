import { useCallback, useMemo } from 'react';
import type { GameRoomSummary, CriticalSnapshot, CriticalCard } from '../types';

interface DisplayNameResolverOptions {
  currentUserId: string | null;
  room: GameRoomSummary;
  snapshot: CriticalSnapshot | null;
  youLabel: string;
  translateCardType?: (cardType: CriticalCard) => string;
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
            const cardType = key.slice('cards:'.length) as CriticalCard;
            return translateCardType ? translateCardType(cardType) : cardType;
          }
          return key;
        });
        const label = seeTheFutureLabel || 'See the Future';
        return `${label} 🔮: ${translatedCards.join(', ')}`;
      }

      // Handle stolenCard:cards:cardType format (pair combo private feedback)
      if (message.startsWith('stolenCard:cards:')) {
        const cardType = message.slice(
          'stolenCard:cards:'.length,
        ) as CriticalCard;
        const translatedCard = translateCardType
          ? translateCardType(cardType)
          : cardType;
        return `You stole: ${translatedCard} 🎴`;
      }

      // Apply participant replacements first
      let result = message;
      if (participantReplacements.length > 0) {
        result = participantReplacements.reduce((acc, [id, name]) => {
          if (!id || !name || id === name || !acc.includes(id)) {
            return acc;
          }
          return acc.split(id).join(name);
        }, result);
      }

      // Replace raw card identifiers with translated names
      if (translateCardType) {
        const allCardTypes: CriticalCard[] = [
          'exploding_cat',
          'defuse',
          'attack',
          'skip',
          'favor',
          'shuffle',
          'see_the_future',
          'nope',
          'tacocat',
          'hairy_potato_cat',
          'rainbow_ralphing_cat',
          'cattermelon',
          'bearded_cat',
          'targeted_attack',
          'personal_attack',
          'attack_of_the_dead',
          'super_skip',
          'reverse',
        ];
        // Sort by length (longest first) to avoid partial matches
        const sortedCardTypes = [...allCardTypes].sort(
          (a, b) => b.length - a.length,
        );
        for (const cardType of sortedCardTypes) {
          if (result.includes(cardType)) {
            const translatedName = translateCardType(cardType);
            result = result.split(cardType).join(translatedName);
          }
        }
      }

      return result;
    },
    [participantReplacements, translateCardType, seeTheFutureLabel],
  );

  return {
    resolveDisplayName,
    formatLogMessage,
  };
}
