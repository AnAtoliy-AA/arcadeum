import type { GemsI18n } from './en';

export const gemsRu: GemsI18n = {
  meta: {
    title: 'Магазин кристаллов · Arcadeum',
    description: 'Купите кристаллы для улучшения игрового процесса.',
  },
  store: {
    title: 'Магазин кристаллов',
    buy: 'Купить',
    bonus: 'Бонус',
    buying: 'Покупка…',
    empty: 'Пакеты кристаллов временно недоступны.',
    loadError: 'Не удалось загрузить пакеты кристаллов. Попробуйте снова.',
  },
  pending: {
    title: 'Ожидающие покупки',
    subtitle: 'Завершите проверку для получения кристаллов.',
    verify: 'Проверить',
    verifying: 'Проверка…',
    empty: '',
  },
  convert: {
    title: 'Конвертировать кристаллы в монеты',
    rateLabel:
      '{gemsPerCoin} кристалла = 1 монета (курс: {coinsPerGem} монеты за кристалл)',
    currentGems: 'Ваши кристаллы: {gems}',
    gemsLabel: 'Кристаллы',
    coinsLabel: 'Монеты',
    confirm: 'Конвертировать',
    success: 'Конвертация выполнена!',
    errorInvalidAmount: 'Введите корректное количество больше нуля.',
    errorInsufficientFunds: 'Недостаточно кристаллов для конвертации.',
    errorFailed: 'Ошибка конвертации. Попробуйте снова.',
  },
  errors: {
    insufficientGems: 'Недостаточно кристаллов.',
    conversionFailed: 'Ошибка конвертации. Попробуйте снова.',
    purchaseFailed: 'Ошибка покупки. Попробуйте снова.',
    finalizeFailed: 'Не удалось подтвердить покупку. Попробуйте снова.',
  },
};
