import { describe, expect, it } from 'vitest';
import {
  formatTurnTimeRemaining,
  getTurnTimeRemaining,
  getTurnUrgency,
  isMyTurn,
  type AsyncMatchItem,
} from './async-match';

describe('async-match helpers', () => {
  it('calculates remaining turn time correctly', () => {
    const now = 1700000000000;
    const expires = new Date(now + 3600000 * 3);
    expect(getTurnTimeRemaining(expires, now)).toBe(3600000 * 3);
  });

  it('formats remaining turn time nicely', () => {
    expect(formatTurnTimeRemaining(3600000 * 25 + 60000 * 30)).toBe('1d 1h');
    expect(formatTurnTimeRemaining(3600000 * 4 + 60000 * 15)).toBe('4h 15m');
    expect(formatTurnTimeRemaining(0)).toBe('0h 0m');
  });

  it('evaluates turn urgency levels', () => {
    expect(getTurnUrgency(3600000 * 1)).toBe('critical');
    expect(getTurnUrgency(3600000 * 4)).toBe('warning');
    expect(getTurnUrgency(3600000 * 12)).toBe('normal');
    expect(getTurnUrgency(0)).toBe('expired');
  });

  it('determines if it is currently my turn', () => {
    const match: AsyncMatchItem = {
      matchId: 'm-1',
      gameType: 'chess',
      playerA: 'u-1',
      playerB: 'u-2',
      currentTurnPlayerId: 'u-1',
      status: 'active',
      turnDurationHours: 24,
      lastTurnAt: new Date().toISOString(),
      turnExpiresAt: new Date().toISOString(),
    };

    expect(isMyTurn(match, 'u-1')).toBe(true);
    expect(isMyTurn(match, 'u-2')).toBe(false);
  });
});
