/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  isStrikeTargetingPlayer,
  hasCard,
  validatePlayCard,
  validateCollectionCombo,
  validateFavor,
  validateGiveFavorCard,
  canPlayCollectionCombo,
  canPlayFiverCombo,
  validateCriticalAction,
  FIVER_COMBO_SIZE,
} from '@arcadeum/games-core/games/critical/critical-validation.utils';
export type {
  PlayCardPayload,
  PlayCollectionComboPayload,
  FavorPayload,
  GiveFavorCardPayload,
  DefusePayload,
  CommitAlterFuturePayload,
  TheftPackPayload,
  ProphecyPayload,
  FavorExecutePayload,
  CriticalPayload,
} from '@arcadeum/games-core/games/critical/critical-validation.utils';
export { getAvailableActionsForPlayer } from '@arcadeum/games-core/games/critical/critical-validation.utils';
