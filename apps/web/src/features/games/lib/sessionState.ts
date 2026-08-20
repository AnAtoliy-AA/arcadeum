import type { GameSessionSummary } from '@/shared/types/games';

/**
 * Narrow a session's opaque `state` payload into a typed game snapshot.
 * The server session state is a `Record<string, unknown>`; each game's
 * state hook casts it to its own client snapshot type via this single,
 * documented helper instead of scattering `as unknown as X` casts.
 */
export function getSessionState<T>(
  session: Pick<GameSessionSummary, 'state'> | null | undefined,
): T | null {
  if (!session?.state) return null;
  return session.state as unknown as T;
}
