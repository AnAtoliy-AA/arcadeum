export const adminBulkRewardsRu = {
  title: 'Массовые Награды',
  subtitle:
    'Отправить награды (монеты, гемы, arcadeum или предметы) всем зарегистрированным пользователям.',
  form: {
    type: {
      label: 'Тип Награды',
      coinsLabel: 'Монеты',
      gemsLabel: 'Гемы',
      arcadeumLabel: 'Arcadeum',
      itemLabel: 'Предмет',
    },
    amount: {
      label: 'Количество',
      placeholder: 'Введите количество',
    },
    itemId: {
      label: 'ID Предмета',
      placeholder: 'Введите ID предмета из каталога',
    },
    reason: {
      label: 'Причина (необязательно)',
      placeholder: 'напр. Праздничный бонус, Компенсация',
    },
    submit: 'Отправить Всем Пользователям',
    submitting: 'Отправка...',
  },
  result: {
    success: 'Награды успешно отправлены!',
    partial: 'Награды частично отправлены.',
    statusFailed: 'Не удалось отправить награды.',
    total: 'Всего пользователей',
    successful: 'Успешные',
    failed: 'Неудачные',
    errors: 'Ошибки',
  },
  confirm: {
    title: 'Подтвердить Массовую Награду',
    message:
      'Это отправит {amount} {type} всем зарегистрированным пользователям. Вы уверены?',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
  },
  validation: {
    amountRequired: 'Количество обязательно',
    itemIdRequired: 'ID предмета обязателен для наград в виде предметов',
    invalidAmount: 'Количество должно быть от 1 до 1 000 000',
  },
};

export type AdminBulkRewardsI18n = typeof adminBulkRewardsRu;
