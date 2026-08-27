/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  dispatchTheftPackAction,
  executeSwapHands,
  isWildcardValidForCombo,
  executeMark,
  executeStealDraw,
  checkAndHandleStealDraw,
  executeStash,
  executeUnstash,
} from '@arcadeum/games-core/games/critical/critical-theft.utils';
export type {
  LogEntryOptions,
  EngineHelpers,
} from '@arcadeum/games-core/games/critical/critical-theft.utils';
export { executeSnatch } from '@arcadeum/games-core/games/critical/critical-theft.utils';
