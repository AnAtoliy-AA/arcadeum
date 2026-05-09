import type { AdminWalletI18n } from './en';

export const adminWalletFr: AdminWalletI18n = {
  drawer: {
    title: 'Portefeuille',
    openButton: 'Portefeuille',
    sections: {
      balance: 'Solde',
      grantDeduct: 'Accorder ou déduire',
      recent: 'Transactions récentes',
    },
  },
  form: {
    currencyLabel: 'Devise',
    amountLabel: 'Montant',
    noteLabel: 'Note (facultatif)',
    grant: 'Accorder',
    deduct: 'Déduire',
    submitting: 'En cours…',
    success: 'Terminé.',
  },
  errors: {
    insufficient: 'Solde insuffisant pour déduire ce montant.',
    generic: "Une erreur s'est produite. Veuillez réessayer.",
  },
};
