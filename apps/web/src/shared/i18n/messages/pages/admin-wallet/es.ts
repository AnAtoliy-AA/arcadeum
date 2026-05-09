import type { AdminWalletI18n } from './en';

export const adminWalletEs: AdminWalletI18n = {
  drawer: {
    title: 'Cartera',
    sections: {
      balance: 'Saldo',
      grantDeduct: 'Otorgar o deducir',
      recent: 'Transacciones recientes',
    },
  },
  form: {
    currencyLabel: 'Moneda',
    amountLabel: 'Cantidad',
    noteLabel: 'Nota (opcional)',
    grant: 'Otorgar',
    deduct: 'Deducir',
    submitting: 'Procesando…',
    success: 'Listo.',
  },
  errors: {
    insufficient: 'Saldo insuficiente para deducir esa cantidad.',
    generic: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  },
};
