import type { WalletI18n } from './en';

export const walletRu: WalletI18n = {
  meta: {
    title: 'Кошелёк · Arcadeum',
    description: 'Просматривайте монеты, кристаллы и историю транзакций.',
  },
  chip: {
    coinsLabel: 'Монеты',
    gemsLabel: 'Кристаллы',
  },
  page: {
    title: 'Ваш кошелёк',
    summary: 'Монеты зарабатываются в игре. Кристаллы приобретаются.',
    filters: {
      all: 'Все',
      coins: 'Монеты',
      gems: 'Кристаллы',
    },
    columns: {
      reason: 'Причина',
      delta: 'Изменение',
      balanceAfter: 'Баланс после',
      createdAt: 'Когда',
    },
    next: 'Далее',
    empty: {
      title: 'Транзакций пока нет',
      description: 'Ваша активность в кошельке отобразится здесь.',
    },
    error: {
      title: 'Не удалось загрузить кошелёк',
      retry: 'Повторить',
    },
  },
  reasons: {
    admin_grant: 'Выдано администратором',
    admin_deduct: 'Списано администратором',
  },
  errors: {
    insufficientFunds: 'Недостаточно средств.',
    invalidCurrency: 'Неизвестная валюта.',
    invalidAmount: 'Сумма должна быть положительным целым числом.',
    transactionFailed: 'Транзакция не выполнена. Попробуйте снова.',
  },
};
