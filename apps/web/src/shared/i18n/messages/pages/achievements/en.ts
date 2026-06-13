export const achievementsEn = {
  title: 'Achievements',
  subtitle: 'Unlock achievements by playing games and reaching milestones.',
  claim: 'Claim',
  claimed: '✓ Claimed',
  locked: '🔒',
  unlocked: '✓',
  xpReward: '+{n} XP',
  progress: '{current} / {target}',
  categories: {
    gameplay: 'Gameplay',
    social: 'Social',
    collection: 'Collection',
    competitive: 'Competitive',
  },
  rarities: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
  },
  errors: {
    alreadyClaimed: 'Already claimed.',
    unauthorized: 'Sign in to view achievements.',
    generic: "Couldn't claim. Please try again.",
  },
  toasts: {
    claimed: 'You claimed {n} XP!',
    unlocked: 'Achievement unlocked: {name}!',
  },
};

export type AchievementsI18n = typeof achievementsEn;
