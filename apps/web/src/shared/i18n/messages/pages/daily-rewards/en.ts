export const dailyRewardsEn = {
  title: 'Daily reward',
  subtitle:
    'Claim your reward once per day to keep your 7-day streak going. Miss a day and you start over at Day 1. Day 7 also awards a gem bonus.',
  claim: 'Claim {n} coins',
  gemBonusSuffix: ' + {n} 💎',
  claimed: 'Come back tomorrow',
  nextResetIn: 'Resets in {time}',
  streakLabel: 'Streak: {n} / 7',
  dayLabel: 'Day {n}',
  errors: {
    alreadyClaimed: "You've already claimed today's reward.",
    unauthorized: 'Sign in to claim your daily reward.',
    generic: "Couldn't claim. Please try again.",
  },
  toasts: {
    claimed: 'You claimed {n} coins!',
    gemBonusSuffix: ' + {n} 💎',
  },
};

export type DailyRewardsI18n = typeof dailyRewardsEn;
