export const walletEn = {
  meta: {
    title: 'Wallet · Arcadeum',
    description: 'View your coins, gems, and transaction history.',
  },
  chip: {
    coinsLabel: 'Coins',
    gemsLabel: 'Gems',
  },
  page: {
    title: 'Your wallet',
    summary: 'Coins are earned through play. Gems are purchased.',
    filters: {
      all: 'All',
      coins: 'Coins',
      gems: 'Gems',
    },
    columns: {
      reason: 'Reason',
      delta: 'Change',
      balanceAfter: 'Balance after',
      createdAt: 'When',
    },
    next: 'Next',
    empty: {
      title: 'No transactions yet',
      description: 'Your wallet activity will appear here.',
    },
    error: {
      title: "Couldn't load your wallet",
      retry: 'Try again',
    },
  },
  reasons: {
    admin_grant: 'Granted by admin',
    admin_deduct: 'Deducted by admin',
    game_win: 'Game win',
    tournament_entry: 'Tournament entry',
    tournament_refund: 'Tournament refund',
    tournament_prize: 'Tournament prize',
    gem_purchase: 'Gems purchased',
    gem_to_coin_conversion_debit: 'Converted gems to coins',
    gem_to_coin_conversion_credit: 'Coins from conversion',
    referral_bonus: 'Referral bonus',
    referral_tier_bonus: 'Referral tier bonus',
  },
  errors: {
    insufficientFunds: 'Insufficient balance.',
    invalidCurrency: 'Unknown currency.',
    invalidAmount: 'Amount must be a positive integer.',
    transactionFailed: 'Transaction failed. Please try again.',
  },
};

export type WalletI18n = typeof walletEn;
