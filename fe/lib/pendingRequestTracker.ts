const DEFAULT_THRESHOLD_MS = 6000;

type Listener = (state: PendingRequestState) => void;

export interface PendingRequestState {
  visible: boolean;
  since: number | null;
  pendingCount: number;
}

const listeners = new Set<Listener>();
let pendingCount = 0;
let revealTimer: ReturnType<typeof setTimeout> | null = null;
let visible = false;
let since: number | null = null;

function notify() {
  const snapshot: PendingRequestState = {
    visible,
    since,
    pendingCount,
  };
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('pending-request-listener-error', error);
    }
  });
}

function scheduleReveal(thresholdMs: number) {
  if (revealTimer) {
    clearTimeout(revealTimer);
  }
  revealTimer = setTimeout(() => {
    since = Date.now();
    visible = true;
    notify();
  }, thresholdMs);
}

function resetVisibility() {
  if (revealTimer) {
    clearTimeout(revealTimer);
    revealTimer = null;
  }
  if (visible || since) {
    visible = false;
    since = null;
    notify();
  } else {
    since = null;
    notify();
  }
}

export function beginPendingRequest(options?: { thresholdMs?: number }) {
  const threshold = options?.thresholdMs ?? DEFAULT_THRESHOLD_MS;
  pendingCount += 1;
  if (pendingCount === 1) {
    visible = false;
    since = null;
    scheduleReveal(threshold);
  }
  notify();

  let finished = false;
  return () => {
    if (finished) {
      return;
    }
    finished = true;
    pendingCount = Math.max(0, pendingCount - 1);
    if (pendingCount === 0) {
      resetVisibility();
    } else {
      notify();
    }
  };
}

export function subscribePendingRequests(listener: Listener): () => void {
  listeners.add(listener);
  listener({ visible, since, pendingCount });
  return () => {
    listeners.delete(listener);
  };
}

export function getPendingRequestState(): PendingRequestState {
  return { visible, since, pendingCount };
}
