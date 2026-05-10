export const WALLET_CURRENCIES = ['coins', 'gems'] as const;
export type WalletCurrency = (typeof WALLET_CURRENCIES)[number];

export const WALLET_REASONS = [
  'admin_grant',
  'admin_deduct',
  'game_win',
  'tournament_entry',
  'tournament_refund',
  'tournament_prize',
  'gem_purchase',
  'gem_to_coin_conversion_debit',
  'gem_to_coin_conversion_credit',
] as const;
export type WalletReason = (typeof WALLET_REASONS)[number];
