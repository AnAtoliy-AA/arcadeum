import { TENTHS_BELOW_SECONDS } from '../hooks/useClockCountdown';

/**
 * Formats a chess clock as MM:SS, or MM:SS.t (tenths) in the final seconds
 * so players can see exactly how close a flag fall is.
 */
export function formatDigitalClock(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const safe = Math.max(0, seconds);
  // Round up to the tenth so 0.01s still shows as 00:00.1, never 0.
  const tenths = Math.ceil(safe * 10);
  if (safe > 0 && tenths < TENTHS_BELOW_SECONDS * 10) {
    const whole = Math.floor(tenths / 10);
    return `00:${whole.toString().padStart(2, '0')}.${tenths % 10}`;
  }
  const total = Math.ceil(safe);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
