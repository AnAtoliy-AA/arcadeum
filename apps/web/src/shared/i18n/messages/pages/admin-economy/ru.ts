export const adminEconomyRu = {
  title: 'Настройки экономики',
  keys: {
    game_win_coin_reward: {
      name: 'Награда за победу',
      description:
        'Монеты, начисляемые каждому победителю по завершении игровой сессии.',
    },
    gem_to_coin_rate: {
      name: 'Курс гемов в монеты',
      description: 'Сколько монет даёт один гем при конвертации.',
    },
    referral_reward_coins_per: {
      name: 'Бонус за приглашение',
      description: 'Монеты, начисляемые пригласившему за каждого нового друга.',
    },
    referral_tier_1_bonus_coins: {
      name: 'Бонус уровня 1 (3 друга)',
      description:
        'Разовый бонус монет, когда пригласивший достигает 3 успешных приглашений.',
    },
    referral_tier_2_bonus_coins: {
      name: 'Бонус уровня 2 (5 друзей)',
      description:
        'Разовый бонус монет, когда пригласивший достигает 5 успешных приглашений.',
    },
    referral_tier_3_bonus_coins: {
      name: 'Бонус уровня 3 (10 друзей)',
      description:
        'Разовый бонус монет, когда пригласивший достигает 10 успешных приглашений.',
    },
  },
  table: {
    key: 'Настройка',
    current: 'Текущее значение',
    default: 'По умолчанию',
    source: 'Источник',
    lastChanged: 'Последнее изменен��е',
    actions: 'Действия',
  },
  sources: {
    override: 'Переопределено админом',
    env: 'Переменная среды',
    default: 'Значение по умолчанию',
  },
  buttons: {
    edit: 'Редактировать',
    reset: 'Сбросить до умолчания',
    history: 'История',
    refreshCache: 'Обновить кеш',
  },
  editDialog: {
    title: 'Редактировать {{key}}',
    currentLabel: 'Текущее',
    newValueLabel: 'Новое значение',
    save: 'Сохранить',
    cancel: 'Отмена',
  },
  auditDrawer: {
    title: 'История: {{key}}',
    empty: 'Изменений пока нет.',
    from: 'Из',
    to: 'В',
    changedBy: '{{name}}',
    changedAt: '{{date}}',
  },
  errors: {
    invalidValue:
      'Значение должно быть положительным целым числом не более 1 000 000.',
    keyNotFound: 'Неизвестная настройка.',
    forbidden: 'У вас нет прав.',
    generic: 'Не удалось сохранить. Повторите попытку.',
  },
  toasts: {
    saved: 'Сохранено {{key}} = {{value}}.',
    reset: 'Сброшено {{key}} до умолчания.',
    cacheCleared: 'Кеш очищен на этом ��кземпляре.',
  },
};
