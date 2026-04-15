import { CriticalState, CriticalCard } from '../../critical/critical.state';
import { EngineHelpers } from './critical-theft.utils';

/**
 * Check and handle marked card when a card is played or discarded.
 * Call this when cards are removed from a player's hand.
 */
export function checkAndHandleMarkedCard(
  state: CriticalState,
  playerId: string,
  cardIndex: number,
  card: CriticalCard,
  helpers: EngineHelpers,
): void {
  const player = helpers.findPlayer(state, playerId);
  if (!player?.markedCards || player.markedCards.length === 0) {
    return;
  }

  // Find if this card index was marked
  const markInfo = player.markedCards.find((m) => m.cardIndex === cardIndex);
  if (!markInfo) {
    return;
  }

  // Remove the mark
  player.markedCards = player.markedCards.filter(
    (m) => m.cardIndex !== cardIndex,
  );

  // Give the card to the marker
  const marker = helpers.findPlayer(state, markInfo.markedBy);
  if (marker && marker.alive) {
    marker.hand.push(card);

    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Marked card triggered! Card stolen! 🏷️`,
        {
          scope: 'all',
          senderId: markInfo.markedBy,
        },
      ),
    );
  }

  // Update remaining mark indices (cards after the removed one shift down)
  player.markedCards = player.markedCards.map((m) => ({
    ...m,
    cardIndex: m.cardIndex > cardIndex ? m.cardIndex - 1 : m.cardIndex,
  }));
}
