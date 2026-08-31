export const rewardsEn = {
  title: 'Rewards Program',
  subtitle: 'Earn coins, unlock cosmetic tiers, and claim daily streaks',
  description:
    'Play matches, complete daily quests, and climb the seasonal reward tiers to unlock exclusive titles, badge borders, and platform coin drops.',
  dailyStreak: {
    title: 'Daily Login Streak',
    subtitle: 'Check in every day to claim bonus coins and mystery boxes',
    day: 'Day {day}',
    claimed: 'Claimed',
    claim: 'Claim Reward',
    ready: 'Ready to Claim',
    streakBonus: 'Day 7 Mystery Crate',
  },
  quests: {
    title: 'Active Quests & Bounties',
    subtitle: 'Complete challenges across all game modes to earn rewards',
    dailyTab: 'Daily Quests',
    weeklyTab: 'Weekly Missions',
    progress: '{current}/{total}',
    items: [
      {
        title: 'First Blood',
        description: 'Win 1 match in any multiplayer game mode',
        reward: '+100 Coins',
        progress: '1/1',
        completed: true,
      },
      {
        title: 'Tactical Mind',
        description: 'Play 3 games of Chess or Checkers',
        reward: '+250 Coins',
        progress: '2/3',
        completed: false,
      },
      {
        title: 'Explosion Survivor',
        description: 'Defuse 2 bombs in Critical without detonating',
        reward: '+300 Coins + Badge',
        progress: '1/2',
        completed: false,
      },
      {
        title: 'Social Champion',
        description: 'Invite a friend to play a match in a private room',
        reward: '+500 Coins',
        progress: '0/1',
        completed: false,
      },
    ],
  },
  tiers: {
    title: 'Seasonal Reward Tiers',
    subtitle:
      'Level up your account to unlock multipliers and cosmetic prestige',
    levels: [
      {
        name: 'Bronze',
        badge: '🥉',
        requirement: '0 XP',
        perks: [
          'Standard matchmaking',
          'Base coin earn rate (1.0x)',
          'Standard chat tag',
        ],
      },
      {
        name: 'Silver',
        badge: '🥈',
        requirement: '1,000 XP',
        perks: [
          '5% Coin boost multiplier',
          'Silver profile badge',
          '2 daily re-rolls on quests',
        ],
      },
      {
        name: 'Gold',
        badge: '🥇',
        requirement: '3,500 XP',
        perks: [
          '15% Coin boost multiplier',
          'Gold animated border',
          'Exclusive tournament access',
        ],
      },
      {
        name: 'Platinum',
        badge: '💎',
        requirement: '7,500 XP',
        perks: [
          '25% Coin boost multiplier',
          'Platinum avatar glow',
          'Priority matchmaking queue',
        ],
      },
      {
        name: 'Mythic',
        badge: '👑',
        requirement: '15,000 XP',
        perks: [
          '50% Coin boost multiplier',
          'Mythic aura cosmetic',
          'Custom room host themes',
        ],
      },
    ],
  },
  referralHero: {
    title: 'Invite Friends, Earn Together',
    description:
      'Give your friends 200 welcome coins when they sign up with your referral code, and earn 500 bonus coins + 10% of their quest rewards.',
    cta: 'Get Referral Link',
  },
  faq: {
    title: 'Rewards FAQ',
    items: [
      {
        question: 'When do daily login streaks reset?',
        answer:
          'Daily streaks reset at 00:00 UTC. You have a 24-hour window each calendar day to claim your reward before the streak returns to Day 1.',
      },
      {
        question: 'How do I earn XP to level up reward tiers?',
        answer:
          'You earn XP automatically by playing multiplayer matches (100 XP per win, 40 XP per participation), completing daily quests, and winning tournament brackets.',
      },
      {
        question: 'Do reward tier perks expire?',
        answer:
          'Tier badges and coin multipliers remain active for the entirety of the ongoing 3-month season. At the start of a new season, a soft tier reset takes place with special legacy rewards.',
      },
    ],
  },
  cta: {
    title: 'Ready to Claim Your Loot?',
    description:
      'Jump into a game room now and start racking up coins and quest progress.',
    button: 'Play Free Now',
  },
  socialRewards: {
    title: 'Social Network Rewards',
    subtitle: 'Subscribe and follow our official channels to claim free gems.',
    badge: 'GEMS REWARD',
    claim: 'Claim +{n} 💎',
    claimed: 'Claimed ✓',
    followAndClaim: 'Subscribe & Claim +{n} 💎',
    toastSuccess: 'Claimed +{n} Gem successfully!',
    errorAlreadyClaimed: 'Already claimed!',
    errorUnauthorized: 'Please sign in to claim rewards.',
    errorGeneric: 'Failed to claim reward. Try again.',
  },
};
