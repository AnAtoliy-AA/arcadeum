export const adminWalletEn = {
  drawer: {
    title: 'Wallet',
    sections: {
      balance: 'Balance',
      grantDeduct: 'Grant or deduct',
      recent: 'Recent transactions',
    },
  },
  form: {
    currencyLabel: 'Currency',
    amountLabel: 'Amount',
    noteLabel: 'Note (optional)',
    grant: 'Grant',
    deduct: 'Deduct',
    submitting: 'Working…',
    success: 'Done.',
  },
  errors: {
    insufficient: 'Not enough balance to deduct that amount.',
    generic: 'Something went wrong. Please retry.',
  },
};

export type AdminWalletI18n = typeof adminWalletEn;
