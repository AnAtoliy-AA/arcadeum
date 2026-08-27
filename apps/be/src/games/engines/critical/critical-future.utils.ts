/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  dispatchFuturePackAction,
  executeSeeTheFuture,
  executeAlterTheFuture,
  executeCommitAlterFuture,
  executeRevealTheFuture,
  executeDrawBottom,
  executeSwapTopBottom,
  executeBury,
} from '@arcadeum/games-core/games/critical/critical-future.utils';
export type {
  LogEntryOptions,
  EngineHelpers,
} from '@arcadeum/games-core/games/critical/critical-future.utils';
