export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly';
  actionType: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface BattlePassTierProgress {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPct: number;
  totalXp: number;
  isMaxTier: boolean;
}

export function calculateBattlePassLevel(
  totalXp: number,
  xpPerTier = 300,
  maxTier = 50,
): BattlePassTierProgress {
  const safeTotalXp = Math.max(0, totalXp);
  const calculatedLevel = Math.floor(safeTotalXp / xpPerTier) + 1;
  const level = Math.min(maxTier, calculatedLevel);
  const isMaxTier = level >= maxTier;

  const currentLevelXp = isMaxTier ? xpPerTier : safeTotalXp % xpPerTier;
  const progressPct = isMaxTier
    ? 100
    : Math.min(100, Math.round((currentLevelXp / xpPerTier) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp: xpPerTier,
    progressPct,
    totalXp: safeTotalXp,
    isMaxTier,
  };
}

export function updateQuestProgress(
  quests: QuestDefinition[],
  actionType: string,
  amount = 1,
): QuestDefinition[] {
  return quests.map((q) => {
    if (q.completed || q.actionType !== actionType) {
      return q;
    }

    const nextCount = Math.min(q.targetCount, q.currentCount + amount);
    const completed = nextCount >= q.targetCount;

    return {
      ...q,
      currentCount: nextCount,
      completed,
    };
  });
}

export function claimQuestReward(
  quests: QuestDefinition[],
  questId: string,
): {
  updatedQuests: QuestDefinition[];
  claimedXp: number;
  claimedCoins: number;
} {
  let claimedXp = 0;
  let claimedCoins = 0;

  const updatedQuests = quests.map((q) => {
    if (q.id === questId && q.completed && !q.claimed) {
      claimedXp = q.rewardXp;
      claimedCoins = q.rewardCoins;
      return { ...q, claimed: true };
    }
    return q;
  });

  return { updatedQuests, claimedXp, claimedCoins };
}

export function getDefaultDailyQuests(): QuestDefinition[] {
  return [
    {
      id: 'daily-play-3',
      title: 'Daily Contender',
      description: 'Play 3 matches in any game',
      category: 'daily',
      actionType: 'play_match',
      targetCount: 3,
      currentCount: 0,
      rewardXp: 150,
      rewardCoins: 50,
      completed: false,
      claimed: false,
    },
    {
      id: 'daily-win-1',
      title: 'First Blood',
      description: 'Win 1 ranked or casual match',
      category: 'daily',
      actionType: 'win_match',
      targetCount: 1,
      currentCount: 0,
      rewardXp: 200,
      rewardCoins: 75,
      completed: false,
      claimed: false,
    },
    {
      id: 'daily-emote-2',
      title: 'Good Sportsmanship',
      description: 'Send 2 in-game reaction emotes',
      category: 'daily',
      actionType: 'send_emote',
      targetCount: 2,
      currentCount: 0,
      rewardXp: 100,
      rewardCoins: 25,
      completed: false,
      claimed: false,
    },
  ];
}

export function getDefaultWeeklyQuests(): QuestDefinition[] {
  return [
    {
      id: 'weekly-wins-10',
      title: 'Grandmaster in Training',
      description: 'Win 10 matches this week',
      category: 'weekly',
      actionType: 'win_match',
      targetCount: 10,
      currentCount: 0,
      rewardXp: 800,
      rewardCoins: 300,
      completed: false,
      claimed: false,
    },
    {
      id: 'weekly-themes-5',
      title: 'Chameleon',
      description: 'Play 5 matches with custom visual themes',
      category: 'weekly',
      actionType: 'play_theme_match',
      targetCount: 5,
      currentCount: 0,
      rewardXp: 600,
      rewardCoins: 200,
      completed: false,
      claimed: false,
    },
  ];
}
