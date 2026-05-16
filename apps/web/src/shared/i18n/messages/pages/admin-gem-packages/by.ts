import type { AdminGemPackagesI18n } from './en';

export const adminGemPackagesBy: AdminGemPackagesI18n = {
  title: 'Пакеты каштоўных камянёў',
  actions: {
    new: '+ Новы пакет',
    edit: 'Рэдагаваць',
    delete: 'Выдаліць',
    cancel: 'Адмена',
    save: 'Захаваць',
  },
  table: {
    name: 'Назва',
    gems: 'Камяні',
    bonusGems: 'Бонус',
    price: 'Кошт',
    currency: 'Валюта',
    status: 'Статус',
    actions: 'Дзеянні',
    active: 'Актыўны',
    inactive: 'Неактыўны',
  },
  form: {
    sections: {
      details: 'Дэталі пакета',
    },
    name: 'Назва пакета',
    namePlaceholder: 'напр., Стартавы набор',
    gems: 'Камяні',
    gemsPlaceholder: 'напр., 100',
    bonusGems: 'Бонусныя камяні',
    bonusGemsPlaceholder: '0',
    priceUsd: 'Кошт (USD)',
    pricePlaceholder: 'напр., 4.99',
    isActive: 'Актыўны',
  },
  empty: {
    noResults: 'Няма пакетаў, якія адпавядаюць фільтрам.',
    noPackages: 'Пакеты каштоўных камянёў яшчэ не створаны.',
  },
  errors: {
    loadFailed: 'Не атрымалася загрузіць пакеты.',
    saveFailed: 'Не атрымалася захаваць пакет.',
    deleteFailed: 'Не атрымалася выдаліць пакет.',
    nameRequired: 'Назва пакета абавязковая.',
    gemsRequired: 'Колькасць камянёў абавязковая.',
    priceRequired: 'Кошт абавязковы.',
    generic: 'Нешта пайшло не так. Паспрабуйце яшчэ раз.',
  },
  confirm: {
    deleteTitle: 'Выдаліць пакет',
    deleteBody:
      'Вы ўпэўнены, што хочаце выдаліць «{name}»? Гэта дзеянне нельга адмяніць.',
    deleteConfirm: 'Выдаліць',
    deleteCancel: 'Адмена',
  },
};
