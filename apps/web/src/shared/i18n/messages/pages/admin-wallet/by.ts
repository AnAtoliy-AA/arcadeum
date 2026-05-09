import type { AdminWalletI18n } from './en';

export const adminWalletBy: AdminWalletI18n = {
  drawer: {
    title: 'Кашалёк',
    sections: {
      balance: 'Баланс',
      grantDeduct: 'Налічыць або спісаць',
      recent: 'Апошнія транзакцыі',
    },
  },
  form: {
    currencyLabel: 'Валюта',
    amountLabel: 'Сума',
    noteLabel: 'Заўвага (неабавязкова)',
    grant: 'Налічыць',
    deduct: 'Спісаць',
    submitting: 'Выконваецца…',
    success: 'Гатова.',
  },
  errors: {
    insufficient: 'Недастаткова сродкаў для спісання ўказанай сумы.',
    generic: 'Нешта пайшло не так. Паспрабуйце яшчэ раз.',
  },
};
