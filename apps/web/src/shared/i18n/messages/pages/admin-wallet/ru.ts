import type { AdminWalletI18n } from './en';

export const adminWalletRu: AdminWalletI18n = {
  drawer: {
    title: 'Кошелёк',
    openButton: 'Кошелёк',
    sections: {
      balance: 'Баланс',
      grantDeduct: 'Начислить или списать',
      recent: 'Последние транзакции',
    },
  },
  form: {
    currencyLabel: 'Валюта',
    amountLabel: 'Сумма',
    noteLabel: 'Примечание (необязательно)',
    grant: 'Начислить',
    deduct: 'Списать',
    submitting: 'Выполняется…',
    success: 'Готово.',
  },
  errors: {
    insufficient: 'Недостаточно средств для списания указанной суммы.',
    generic: 'Что-то пошло не так. Попробуйте снова.',
  },
};
