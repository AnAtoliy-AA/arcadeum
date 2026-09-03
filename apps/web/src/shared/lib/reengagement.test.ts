import { describe, it, expect, beforeEach } from 'vitest';
import { ReengagementManager } from './reengagement';

describe('ReengagementManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records activity and retrieves it', () => {
    ReengagementManager.recordActivity(5, 1);
    const record = ReengagementManager.getActivityRecord();
    expect(record.currentStreak).toBe(5);
    expect(record.freezeCount).toBe(1);
    expect(record.lastActiveTimestamp).toBeGreaterThan(0);
  });

  it('returns null trigger when player was active recently', () => {
    const now = Date.now();
    ReengagementManager.recordActivity(3, 0);
    const trigger = ReengagementManager.evaluateTriggers(
      now + 1000 * 60 * 60 * 2,
    );
    expect(trigger).toBeNull();
  });

  it('triggers streak danger after 21 hours of inactivity on active streak', () => {
    const now = Date.now();
    ReengagementManager.recordActivity(4, 0);
    const trigger = ReengagementManager.evaluateTriggers(
      now + 1000 * 60 * 60 * 21,
    );
    expect(trigger?.id).toBe('streak_danger');
    expect(trigger?.type).toBe('streak_danger');
  });

  it('triggers winback bonus after 50 hours of inactivity', () => {
    const now = Date.now();
    ReengagementManager.recordActivity(1, 0);
    const trigger = ReengagementManager.evaluateTriggers(
      now + 1000 * 60 * 60 * 50,
    );
    expect(trigger?.id).toBe('winback_bonus');
    expect(trigger?.type).toBe('winback_bonus');
  });
});
