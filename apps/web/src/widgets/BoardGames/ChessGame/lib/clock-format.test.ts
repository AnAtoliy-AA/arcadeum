import { describe, it, expect } from 'vitest';
import { formatDigitalClock } from './clock-format';
import { clockSeconds } from '../hooks/useClockCountdown';

describe('formatDigitalClock', () => {
  it('shows minutes and seconds, rounding up', () => {
    expect(formatDigitalClock(180)).toBe('03:00');
    expect(formatDigitalClock(59.2)).toBe('01:00');
    expect(formatDigitalClock(10)).toBe('00:10');
  });

  it('shows tenths in the final ten seconds', () => {
    expect(formatDigitalClock(9.95)).toBe('00:10');
    expect(formatDigitalClock(9.4)).toBe('00:09.4');
    expect(formatDigitalClock(0.01)).toBe('00:00.1');
  });

  it('handles empty and missing clocks', () => {
    expect(formatDigitalClock(0)).toBe('00:00');
    expect(formatDigitalClock(-3)).toBe('00:00');
    expect(formatDigitalClock(null)).toBe('--:--');
  });
});

describe('clockSeconds', () => {
  it('prefers authoritative milliseconds', () => {
    expect(
      clockSeconds({
        remainingSeconds: 10,
        remainingMs: 9400,
        lastMoveTimestamp: 0,
      }),
    ).toBe(9.4);
  });

  it('falls back to whole seconds', () => {
    expect(clockSeconds({ remainingSeconds: 42, lastMoveTimestamp: 0 })).toBe(
      42,
    );
  });
});
