import type { WalletI18n } from './en';

export const walletFr: WalletI18n = {
  meta: {
    title: 'Portefeuille · Arcadeum',
    description: 'Consultez vos pièces, gemmes et historique des transactions.',
  },
  chip: {
    coinsLabel: 'Pièces',
    gemsLabel: 'Gemmes',
  },
  page: {
    title: 'Votre portefeuille',
    summary: 'Les pièces sont gagnées en jouant. Les gemmes sont achetées.',
    filters: {
      all: 'Toutes',
      coins: 'Pièces',
      gems: 'Gemmes',
    },
    columns: {
      reason: 'Raison',
      delta: 'Variation',
      balanceAfter: 'Solde après',
      createdAt: 'Quand',
    },
    next: 'Suivant',
    empty: {
      title: 'Aucune transaction pour le moment',
      description: 'Votre activité de portefeuille apparaîtra ici.',
    },
    error: {
      title: 'Impossible de charger votre portefeuille',
      retry: 'Réessayer',
    },
  },
  reasons: {
    admin_grant: "Accordé par l'administrateur",
    admin_deduct: "Déduit par l'administrateur",
    game_win: 'Victoire en jeu',
    tournament_entry: 'Inscription au tournoi',
    tournament_refund: 'Remboursement du tournoi',
    tournament_prize: 'Prix du tournoi',
    gem_purchase: 'Gemmes achetées',
    gem_to_coin_conversion_debit: 'Gemmes converties en pièces',
    gem_to_coin_conversion_credit: 'Pièces issues de la conversion',
    referral_bonus: 'Bonus de parrainage',
    referral_tier_bonus: 'Bonus de palier de parrainage',
  },
  errors: {
    insufficientFunds: 'Solde insuffisant.',
    invalidCurrency: 'Devise inconnue.',
    invalidAmount: 'Le montant doit être un entier positif.',
    transactionFailed: 'Transaction échouée. Veuillez réessayer.',
  },
};
