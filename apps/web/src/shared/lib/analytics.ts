// Lightweight analytics dispatch layer (roadmap 6C). Product surfaces call
// `track('feature.event', { ... })` — the same contract as before — and events
// are forwarded to whichever provider AnalyticsProvider registers at runtime.
// No provider configured: dev logging only, zero network activity.
// Server code shouldn't import this — analytics is a client concern.

export type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export type AnalyticsDispatcher = (
  event: string,
  props: AnalyticsPayload,
) => void;

const isDev = process.env.NODE_ENV === 'development';
const MAX_QUEUE_SIZE = 100;

let dispatcher: AnalyticsDispatcher | null = null;
let queue: Array<{ event: string; props: AnalyticsPayload }> = [];

/**
 * Registers the active provider. Events emitted before registration are
 * buffered (bounded) and flushed on registration; `null` unregisters.
 */
export function setAnalyticsDispatcher(next: AnalyticsDispatcher | null): void {
  dispatcher = next;
  if (!dispatcher) return;
  const pending = queue;
  queue = [];
  for (const item of pending) {
    dispatcher(item.event, item.props);
  }
}

function enqueue(event: string, props: AnalyticsPayload): void {
  // Bounded so a misconfigured session can't grow memory indefinitely while
  // waiting for a provider that never registers.
  queue.push({ event, props });
  if (queue.length > MAX_QUEUE_SIZE) {
    queue.splice(0, queue.length - MAX_QUEUE_SIZE);
  }
}

export function track(event: string, props: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  if (isDev) {
    // Single console.debug per event keeps the dev console scrollable. Gated
    // strictly to development so test runs (`NODE_ENV=test`) stay quiet.
    console.debug('[analytics]', event, props);
  }

  if (dispatcher) {
    dispatcher(event, props);
  } else {
    enqueue(event, props);
  }
}
