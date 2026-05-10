export const adminEconomyRu = {
  title: 'Настройки экономики',
  table: {
    key: 'Ключ',
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
