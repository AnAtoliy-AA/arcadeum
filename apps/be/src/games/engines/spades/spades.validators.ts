/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  validateBid,
  completedTricks,
  validatePlayCard,
  validateForfeit,
} from '@arcadeum/games-core/games/spades/spades.validators';
export type { ValidationResult } from '@arcadeum/games-core/games/spades/spades.validators';
