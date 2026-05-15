import type { AdminGemPackagesI18n } from './en';

export const adminGemPackagesRu: AdminGemPackagesI18n = {
  title: 'Пакеты кристаллов',
  actions: {
    new: '+ Новый пакет',
    edit: 'Редактировать',
    delete: 'Удалить',
    cancel: 'Отмена',
    save: 'Сохранить',
  },
  table: {
    name: 'Название',
    gems: 'Кристаллы',
    bonusGems: 'Бонус',
    price: 'Цена',
    currency: 'Валюта',
    status: 'Статус',
    actions: 'Действия',
    active: 'Активен',
    inactive: 'Неактивен',
  },
  form: {
    sections: {
      details: 'Детали пакета',
    },
    name: 'Название пакета',
    namePlaceholder: 'например, Стартовый набор',
    gems: 'Кристаллы',
    gemsPlaceholder: 'например, 100',
    bonusGems: 'Бонусные кристаллы',
    bonusGemsPlaceholder: '0',
    priceUsd: 'Цена (USD)',
    pricePlaceholder: 'например, 4.99',
    isActive: 'Активен',
  },
  empty: {
    noResults: 'Нет пакетов, соответствующих фильтрам.',
    noPackages: 'Пакеты кристаллов ещё не созданы.',
  },
  errors: {
    loadFailed: 'Не удалось загрузить пакеты кристаллов.',
    saveFailed: 'Не удалось сохранить пакет.',
    deleteFailed: 'Не удалось удалить пакет.',
    nameRequired: 'Название пакета обязательно.',
    gemsRequired: 'Количество кристаллов обязательно.',
    priceRequired: 'Цена обязательна.',
    generic: 'Что-то пошло не так. Попробуйте снова.',
  },
  confirm: {
    deleteTitle: 'Удалить пакет',
    deleteBody:
      'Вы уверены, что хотите удалить «{name}»? Это действие нельзя отменить.',
    deleteConfirm: 'Удалить',
    deleteCancel: 'Отмена',
  },
};
