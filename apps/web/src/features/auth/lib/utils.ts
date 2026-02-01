/**
 * Formats a date/time string for display
 */
export function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Sanitizes username to only allow alphanumeric, underscore, and hyphen
 */
export function sanitizeUsername(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}

/**
 * Schedules a state update using queueMicrotask (with Promise fallback)
 */
export function scheduleStateUpdate(action: () => void): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(action);
    return;
  }
  Promise.resolve().then(action).catch(() => {
    // ignore scheduling errors
  });
}
