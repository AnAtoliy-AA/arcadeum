/**
 * Tiny event bus that mimics the subset of `/games` socket events used by
 * `useGameSession`. Offline sessions publish snapshots here; widgets keep
 * consuming the exact same hook contract as online play.
 */
export type OfflineBusEvent =
  | 'games.session.snapshot'
  | 'games.session.started'
  | 'games.session.exception';

type Listener = (payload: unknown) => void;

const listeners = new Map<OfflineBusEvent, Set<Listener>>();

export function offlineBusOn(
  event: OfflineBusEvent,
  fn: Listener,
): () => void {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(fn);
  return () => {
    set?.delete(fn);
  };
}

export function offlineBusEmit(
  event: OfflineBusEvent,
  payload: unknown,
): void {
  const set = listeners.get(event);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(payload);
    } catch (err) {
      // A broken listener must not break the game loop.
      console.error('[offline-bus] listener error', err);
    }
  }
}
