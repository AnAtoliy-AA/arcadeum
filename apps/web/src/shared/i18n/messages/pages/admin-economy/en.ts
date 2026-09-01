export const adminEconomyEn = {
  title: 'Economy settings',
  subtitle:
    'Override runtime economy values. Changes take effect after the cache TTL (default 60 s) or after refreshing the cache.',
  loading: 'Loading…',
  empty: 'No economy settings found.',
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
    daily_reward_day_1: {
      name: 'Daily reward — Day 1',
      description: 'Coins awarded for the first day of the 7-day daily streak.',
    },
    daily_reward_day_2: {
      name: 'Daily reward — Day 2',
      description:
        'Coins awarded for the second day of the 7-day daily streak.',
    },
    daily_reward_day_3: {
      name: 'Daily reward — Day 3',
      description: 'Coins awarded for the third day of the 7-day daily streak.',
    },
    daily_reward_day_4: {
      name: 'Daily reward — Day 4',
      description:
        'Coins awarded for the fourth day of the 7-day daily streak.',
    },
    daily_reward_day_5: {
      name: 'Daily reward — Day 5',
      description: 'Coins awarded for the fifth day of the 7-day daily streak.',
    },
    daily_reward_day_6: {
      name: 'Daily reward — Day 6',
      description: 'Coins awarded for the sixth day of the 7-day daily streak.',
    },
    daily_reward_day_7: {
      name: 'Daily reward — Day 7',
      description:
        'Coins awarded for the seventh day of the 7-day daily streak.',
    },
    daily_reward_day_7_bonus_gems: {
      name: 'Daily reward — Day 7 gem bonus',
      description:
        'Gems awarded in addition to coins on Day 7 of the daily streak.',
    },
    shop_allow_gems: {
      name: 'Allow gem purchases in shop',
      description: 'Toggle whether users can purchase items with gems.',
    },
    shop_allow_arcadeum: {
      name: 'Allow ARC purchases in shop',
      description:
        'Toggle whether users can purchase items with Arcadeum tokens.',
    },
    gems_allow_arcadeum: {
      name: 'Allow ARC gem purchases',
      description:
        'Toggle whether users can purchase gems with Arcadeum tokens.',
    },
    gem_to_usd_rate: {
      name: 'Gem-to-USD rate',
      description: 'How many USD one gem is worth.',
    },
    arcadeum_discount_percent: {
      name: 'ARC discount percent',
      description: 'Percentage discount when paying with Arcadeum tokens.',
    },
    geo_block_enabled: {
      name: 'Geo-block enabled',
      description: 'Toggle geo-blocking for restricted countries.',
    },
    vpn_detection_enabled: {
      name: 'VPN detection enabled',
      description: 'Toggle VPN detection enforcement.',
    },
    signup_reward_coins: {
      name: 'Signup reward — coins',
      description: 'Coins credited to new users upon registration.',
    },
    signup_reward_gems: {
      name: 'Signup reward — gems',
      description: 'Gems credited to new users upon registration.',
    },
    social_reward_gems: {
      name: 'Social subscription reward — gems',
      description:
        'Gems credited to users per social network subscription/follow.',
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
    reset: 'Reset to default',
    enable: 'Enable',
    disable: 'Disable',
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
    invalidValue: 'Value must be a non-negative integer up to 1,000,000.',
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
