import { describe, expect, it } from 'vitest';
import {
  calculateBattlePassLevel,
  claimQuestReward,
  getDefaultDailyQuests,
  updateQuestProgress,
} from './quests-progression';

describe('quests-progression helpers', () => {
  it('calculates Battle Pass tier levels and progress percentages correctly', () => {
    const p1 = calculateBattlePassLevel(0);
    expect(p1.level).toBe(1);
    expect(p1.currentLevelXp).toBe(0);
    expect(p1.progressPct).toBe(0);

    const p2 = calculateBattlePassLevel(450, 300);
    expect(p2.level).toBe(2);
    expect(p2.currentLevelXp).toBe(150);
    expect(p2.progressPct).toBe(50);

    const pMax = calculateBattlePassLevel(50000, 300, 50);
    expect(pMax.level).toBe(50);
    expect(pMax.isMaxTier).toBe(true);
    expect(pMax.progressPct).toBe(100);
  });

  it('updates quest progress on matching actions', () => {
    const quests = getDefaultDailyQuests();
    const updated = updateQuestProgress(quests, 'play_match', 2);
    const playQuest = updated.find((q) => q.id === 'daily-play-3');

    expect(playQuest?.currentCount).toBe(2);
    expect(playQuest?.completed).toBe(false);

    const completedQuests = updateQuestProgress(updated, 'play_match', 1);
    const playQuestDone = completedQuests.find((q) => q.id === 'daily-play-3');
    expect(playQuestDone?.currentCount).toBe(3);
    expect(playQuestDone?.completed).toBe(true);
  });

  it('claims rewards for completed quests only once', () => {
    let quests = getDefaultDailyQuests();
    quests = updateQuestProgress(quests, 'win_match', 1);

    const { updatedQuests, claimedXp, claimedCoins } = claimQuestReward(
      quests,
      'daily-win-1',
    );

    expect(claimedXp).toBe(200);
    expect(claimedCoins).toBe(75);
    expect(updatedQuests.find((q) => q.id === 'daily-win-1')?.claimed).toBe(
      true,
    );

    const secondClaim = claimQuestReward(updatedQuests, 'daily-win-1');
    expect(secondClaim.claimedXp).toBe(0);
    expect(secondClaim.claimedCoins).toBe(0);
  });
});
