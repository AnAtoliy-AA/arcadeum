import { useMemo } from 'react';
import type {
  ExplodingCatsSnapshot,
  ExplodingCatsLogEntry,
  ExplodingCatsCard,
} from '../types';

interface GameLogsInput {
  snapshot: ExplodingCatsSnapshot | null;
  isCurrentUserPlayer: boolean;
  playerNameMap: Map<string, string>;
  t: (key: string) => string;
  translateCardName: (card: ExplodingCatsCard) => string;
}

export function useGameLogs({
  snapshot,
  isCurrentUserPlayer,
  playerNameMap,
  t,
  translateCardName,
}: GameLogsInput) {
  const logs = useMemo(() => {
    const source = (snapshot?.logs ?? []) as ExplodingCatsLogEntry[];
    const filtered = source.filter(
      (entry) => entry.scope !== 'players' || isCurrentUserPlayer,
    );
    const ordered = [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return aTime - bTime;
    });
    return ordered.slice(-20).reverse();
  }, [snapshot, isCurrentUserPlayer]);

  const formatLogMessage = (message: string) => {
    if (!message) {
      return message;
    }
    let next = message;

    // Handle seeTheFuture.reveal:cards:card1,cards:card2,cards:card3 format
    if (next.startsWith('seeTheFuture.reveal:')) {
      const cardKeysStr = next.slice('seeTheFuture.reveal:'.length);
      const cardKeys = cardKeysStr.split(',');
      const translatedCards = cardKeys.map((key) => {
        // key format is "cards:card_type"
        if (key.startsWith('cards:')) {
          const cardType = key.slice('cards:'.length);
          return translateCardName(cardType as ExplodingCatsCard);
        }
        return key;
      });
      return `${t('games.table.cards.seeTheFuture')} 🔮: ${translatedCards.join(', ')}`;
    }

    // Handle stolenCard:cards:cardType format (pair combo private feedback)
    if (next.startsWith('stolenCard:cards:')) {
      const cardType = next.slice('stolenCard:cards:'.length);
      const translatedCard = translateCardName(cardType as ExplodingCatsCard);
      return `You stole: ${translatedCard} 🎴`;
    }

    // Replace player IDs with display names
    playerNameMap.forEach((displayName, playerId) => {
      if (playerId && displayName && playerId !== displayName) {
        next = next.split(playerId).join(displayName);
      }
    });
    return next;
  };

  return { logs, formatLogMessage };
}
