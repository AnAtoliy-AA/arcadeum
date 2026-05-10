// Mobile supports en / es / fr only (ru and by are web-only locales).
// Keys mirror the web wallet namespace (apps/web/src/shared/i18n/messages/pages/wallet/).
import type { TranslationMap } from '../types';

export const walletMessages = {
  en: {
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
      empty: {
        title: 'No transactions yet',
        description: 'Your wallet activity will appear here.',
      },
      error: {
        title: "Couldn't load your wallet",
        retry: 'Try again',
      },
      loadMore: 'Load more',
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
    },
    errors: {
      insufficientFunds: 'Insufficient balance.',
      invalidCurrency: 'Unknown currency.',
      invalidAmount: 'Amount must be a positive integer.',
      transactionFailed: 'Transaction failed. Please try again.',
    },
  },
  es: {
    chip: {
      coinsLabel: 'Monedas',
      gemsLabel: 'Gemas',
    },
    page: {
      title: 'Tu cartera',
      summary: 'Las monedas se ganan jugando. Las gemas se compran.',
      filters: {
        all: 'Todas',
        coins: 'Monedas',
        gems: 'Gemas',
      },
      empty: {
        title: 'Sin transacciones aún',
        description: 'Tu actividad en la cartera aparecerá aquí.',
      },
      error: {
        title: 'No se pudo cargar tu cartera',
        retry: 'Reintentar',
      },
      loadMore: 'Cargar más',
    },
    reasons: {
      admin_grant: 'Otorgado por el administrador',
      admin_deduct: 'Deducido por el administrador',
      game_win: 'Victoria en partida',
      tournament_entry: 'Inscripción al torneo',
      tournament_refund: 'Reembolso del torneo',
      tournament_prize: 'Premio del torneo',
      gem_purchase: 'Gemas compradas',
      gem_to_coin_conversion_debit: 'Gemas convertidas a monedas',
      gem_to_coin_conversion_credit: 'Monedas de la conversión',
    },
    errors: {
      insufficientFunds: 'Saldo insuficiente.',
      invalidCurrency: 'Moneda desconocida.',
      invalidAmount: 'La cantidad debe ser un entero positivo.',
      transactionFailed: 'Transacción fallida. Por favor, inténtalo de nuevo.',
    },
  },
  fr: {
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
      empty: {
        title: 'Aucune transaction pour le moment',
        description: 'Votre activité de portefeuille apparaîtra ici.',
      },
      error: {
        title: 'Impossible de charger votre portefeuille',
        retry: 'Réessayer',
      },
      loadMore: 'Charger plus',
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
    },
    errors: {
      insufficientFunds: 'Solde insuffisant.',
      invalidCurrency: 'Devise inconnue.',
      invalidAmount: 'Le montant doit être un entier positif.',
      transactionFailed: 'Transaction échouée. Veuillez réessayer.',
    },
  },
} as const satisfies Pick<TranslationMap, 'en' | 'es' | 'fr'>;
