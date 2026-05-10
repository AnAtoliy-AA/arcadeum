export const adminEconomyEn = {
  title: 'Economy settings',
  keys: {
    game_win_coin_reward: {
      name: 'Game win reward',
      description:
        'Coins credited to each winner when a game session completes.',
    },
    gem_to_coin_rate: {
      name: 'Gem-to-coin rate',
      description: 'How many coins one gem produces when converted.',
    },
    referral_reward_coins_per: {
      name: 'Per-referral bonus',
      description:
        'Coins credited to a referrer on every successful referral signup.',
    },
    referral_tier_1_bonus_coins: {
      name: 'Tier 1 bonus (3 invites)',
      description:
        'One-time coin bonus when a referrer reaches 3 successful invites.',
    },
    referral_tier_2_bonus_coins: {
      name: 'Tier 2 bonus (5 invites)',
      description:
        'One-time coin bonus when a referrer reaches 5 successful invites.',
    },
    referral_tier_3_bonus_coins: {
      name: 'Tier 3 bonus (10 invites)',
      description:
        'One-time coin bonus when a referrer reaches 10 successful invites.',
    },
  },
  table: {
    key: 'Setting',
    current: 'Current value',
    default: 'Default',
    source: 'Source',
    lastChanged: 'Last changed',
    actions: 'Actions',
  },
  sources: {
    override: 'Admin override',
    env: 'Environment',
    default: 'Code default',
  },
  buttons: {
    edit: 'Edit',
    reset: 'Reset to default',
    history: 'History',
    refreshCache: 'Refresh cache',
  },
  editDialog: {
    title: 'Edit {{key}}',
    currentLabel: 'Current',
    newValueLabel: 'New value',
    save: 'Save',
    cancel: 'Cancel',
  },
  auditDrawer: {
    title: 'History for {{key}}',
    empty: 'No changes yet.',
    from: 'From',
    to: 'To',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue: 'Value must be a positive integer up to 1,000,000.',
    keyNotFound: 'Unknown setting.',
    forbidden: 'You do not have permission.',
    generic: 'Could not save. Please retry.',
  },
  toasts: {
    saved: 'Saved {{key}} = {{value}}.',
    reset: 'Reset {{key}} to default.',
    cacheCleared: 'Cache cleared on this instance.',
  },
};

export type AdminEconomyI18n = typeof adminEconomyEn;
