/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  makeDeck,
  rankValue,
  suitOf,
  isSpadeCard,
  sortHand,
  sideOf,
  sideOfPlayer,
  teamMembers,
  partnerOf,
  trickWinnerId,
} from '@arcadeum/games-core/games/spades/spades.utils';
export type { DeckShuffler } from '@arcadeum/games-core/games/spades/spades.utils';
