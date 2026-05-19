export const adminGamesEn = {
  title: 'Games & variants visibility',
  subtitle:
    'Restrict who can see and play each game or built-in variant. Changes take effect within 30 seconds.',
  loading: 'Loading…',
  empty: 'No games registered.',
  game: 'Game',
  variants: 'Variants',
  tier: 'Visibility',
  save: 'Save',
  saving: 'Saving…',
  saveSuccess: 'Saved',
  saveFailed: 'Could not save',
  tiers: {
    all: 'All players',
    premium_plus: 'Premium+',
    vip_plus: 'VIP+',
  },
};

export type AdminGamesMessages = typeof adminGamesEn;
