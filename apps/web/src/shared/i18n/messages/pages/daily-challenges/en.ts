export const dailyChallengesEn = {
  title: 'Daily Challenges',
  subtitle: 'Complete challenges to earn rewards. New challenges every day.',
  claim: 'Claim',
  claimed: '✓ Claimed',
  allCompleted: 'All challenges completed! Come back tomorrow.',
  progress: '{current} / {target}',
  rewards: {
    coins: '{n} coins',
    gems: '{n} gems',
  },
  errors: {
    alreadyClaimed: 'Already claimed.',
    unauthorized: 'Sign in to claim your reward.',
    generic: "Couldn't claim. Please try again.",
  },
  toasts: {
    claimed: 'You claimed {n} {type}!',
  },
};

export type DailyChallengesI18n = typeof dailyChallengesEn;
