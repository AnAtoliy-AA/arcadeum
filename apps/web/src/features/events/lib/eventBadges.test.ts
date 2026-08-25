import { describe, it, expect } from 'vitest';
import {
  EVENT_PRIZE_BADGES,
  getEventPrizeBadge,
  getAllEventPrizeBadges,
} from './eventBadges';

describe('eventBadges catalog', () => {
  it('should return null for non-existent or empty badge ids', () => {
    expect(getEventPrizeBadge(null)).toBeNull();
    expect(getEventPrizeBadge(undefined)).toBeNull();
    expect(getEventPrizeBadge('')).toBeNull();
    expect(getEventPrizeBadge('non_existent_badge')).toBeNull();
  });

  it('should resolve known badges case-insensitively', () => {
    const admiral = getEventPrizeBadge('admiral_ribbon');
    expect(admiral).not.toBeNull();
    expect(admiral?.name).toBe("Admiral's Ribbon");
    expect(admiral?.gameType).toBe('sea-battle');
    expect(admiral?.rarity).toBe('epic');

    const upper = getEventPrizeBadge('ADMIRAL_RIBBON');
    expect(upper?.id).toBe('admiral_ribbon');

    const champion = getEventPrizeBadge('champion_crown');
    expect(champion?.rarity).toBe('legendary');
    expect(champion?.gameType).toBe('chess');

    const dice = getEventPrizeBadge('golden_dice');
    expect(dice?.gameType).toBe('backgammon');
  });

  it('should return all badge definitions with required properties', () => {
    const all = getAllEventPrizeBadges();
    expect(all.length).toBe(Object.keys(EVENT_PRIZE_BADGES).length);
    expect(all.length).toBeGreaterThanOrEqual(10);

    for (const badge of all) {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.gameType).toBeTruthy();
      expect(badge.gradient).toBeTruthy();
      expect(badge.glowColor).toBeTruthy();
      expect(badge.iconType).toBeTruthy();
      expect(['common', 'rare', 'epic', 'legendary']).toContain(badge.rarity);
    }
  });
});
