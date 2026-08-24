/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  makeDeck,
  rankValue,
  suitOf,
  isHeartCard,
  isQueenOfSpadesCard,
  isPenaltyCard,
  sortHand,
  passDirectionForHand,
  receiverIndexOf,
  cardPoints,
  pointsInCards,
  trickWinnerId,
  shootTheMoonShooter,
  holderIndexOf,
  holderOfTwoClubs,
} from '@arcadeum/games-core/games/hearts/hearts.utils';
export type { DeckShuffler } from '@arcadeum/games-core/games/hearts/hearts.utils';
