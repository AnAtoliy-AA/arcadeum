export const shopRu = {
  meta: {
    title: 'Магазин · Arcadeum',
    description: 'Тратьте монеты и гемы на аватары, значки и другое.',
  },
  title: 'Магазин',
  subtitle: 'Аватары и значки, чтобы выделиться в профиле.',
  sidebar: {
    title: 'Фильтры',
    category: 'Категория',
    rarity: 'Редкость',
    all: 'Все',
    categories: {
      avatar: 'Аватары',
      badge: 'Значки',
      name_color: 'Цвета имени',
      game_skin: 'Скины игр',
    },
    rarities: {
      common: 'Обычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный',
    },
    tabs: { browse: 'Витрина', inventory: 'Инвентарь' },
  },
  grid: {
    emptyCategory: 'Здесь пока пусто. Загляните позже.',
    purchase: {
      title: 'Подтвердить покупку',
      buy: 'Купить',
      cancel: 'Отмена',
      yourBalance: 'У вас {amount} {currency}.',
      free: 'Бесплатно',
      errors: {
        insufficientFunds: 'Недостаточно средств для покупки.',
        unavailable: 'Этот предмет сейчас недоступен.',
        generic: 'Не удалось завершить покупку. Попробуйте ещё раз.',
      },
    },
  },
  inventory: {
    emptyInventory: 'Инвентарь пуст. Посетите магазин, чтобы начать.',
    equip: 'Экипировать',
    unequip: 'Снять',
    sell: 'Продать',
    starterTag: 'Стартовый',
    sell_modal: {
      title: 'Продать предмет',
      sell: 'Продать за {amount} монет',
      cancel: 'Отмена',
      refund: 'Вы получите {amount} монет.',
      errors: {
        starterNotSellable: 'Стартовые предметы нельзя продать.',
        alreadySold: 'Этот предмет уже продан.',
        unequipFirst: 'Снимите предмет перед продажей.',
        generic: 'Не удалось продать предмет. Попробуйте ещё раз.',
      },
    },
  },
  items: {
    avatar: {
      default01: { name: 'Стандартный аватар', desc: 'Стартовый аватар.' },
      fox01: { name: 'Лиса', desc: 'Хитрая лиса.' },
      cat01: { name: 'Кот', desc: 'Любопытный кот.' },
      dragon01: { name: 'Дракон', desc: 'Свирепый дракон.' },
      phoenix01: { name: 'Феникс', desc: 'Возрождающийся феникс.' },
      cosmic01: { name: 'Космос', desc: 'Космическая легенда.' },
    },
    badge: {
      newcomer: { name: 'Новичок', desc: 'Добро пожаловать в Arcadeum.' },
      veteran: { name: 'Ветеран', desc: 'Опытный игрок.' },
      champion: { name: 'Чемпион', desc: 'Заслуженный чемпион.' },
      legend: { name: 'Легенда', desc: 'Легендарный игрок.' },
    },
  },
};
