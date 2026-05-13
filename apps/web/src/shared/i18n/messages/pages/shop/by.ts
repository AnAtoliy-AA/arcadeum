export const shopBy = {
  meta: {
    title: 'Крама · Arcadeum',
    description: 'Трацьце манеты і самацветы на аватары, значкі і іншае.',
  },
  title: 'Крама',
  subtitle: 'Аватары і значкі, каб зрабіць профіль непаўторным.',
  sidebar: {
    title: 'Фільтры',
    category: 'Катэгорыя',
    rarity: 'Рэдкасць',
    all: 'Усе',
    categories: {
      avatar: 'Аватары',
      badge: 'Значкі',
      name_color: 'Колеры імя',
      game_skin: 'Скіны гульняў',
    },
    rarities: {
      common: 'Звычайны',
      rare: 'Рэдкі',
      epic: 'Эпічны',
      legendary: 'Легендарны',
    },
    tabs: { browse: 'Вітрына', inventory: 'Інвентар' },
  },
  grid: {
    emptyCategory: 'Тут пакуль пуста. Завітайце пазней.',
    purchase: {
      title: 'Пацвердзіць пакупку',
      buy: 'Купіць',
      cancel: 'Адмена',
      yourBalance: 'У вас {amount} {currency}.',
      free: 'Бясплатна',
      errors: {
        insufficientFunds: 'Не хапае сродкаў на пакупку.',
        unavailable: 'Гэты прадмет цяпер недаступны.',
        generic: 'Не атрымалася завяршыць пакупку. Паспрабуйце зноў.',
      },
    },
  },
  inventory: {
    emptyInventory: 'Інвентар пусты. Завітайце ў краму, каб пачаць.',
    equip: 'Апрануць',
    unequip: 'Зняць',
    sell: 'Прадаць',
    starterTag: 'Стартавы',
    sell_modal: {
      title: 'Прадаць прадмет',
      sell: 'Прадаць за {amount} манет',
      cancel: 'Адмена',
      refund: 'Вы атрымаеце {amount} манет.',
      errors: {
        starterNotSellable: 'Стартавыя прадметы нельга прадаць.',
        alreadySold: 'Гэты прадмет ужо прададзены.',
        unequipFirst: 'Зніміце прадмет перад продажам.',
        generic: 'Не атрымалася прадаць прадмет. Паспрабуйце зноў.',
      },
    },
  },
  items: {
    avatar: {
      default01: { name: 'Стандартны аватар', desc: 'Стартавы аватар.' },
      fox01: { name: 'Ліс', desc: 'Хітры ліс.' },
      cat01: { name: 'Кот', desc: 'Цікаўны кот.' },
      dragon01: { name: 'Дракон', desc: 'Лютым дракон.' },
      phoenix01: { name: 'Фенікс', desc: 'Адраджэнны фенікс.' },
      cosmic01: { name: 'Касмічны', desc: 'Касмічная легенда.' },
    },
    badge: {
      newcomer: { name: 'Навічок', desc: 'Сардэчна запрашаем у Arcadeum.' },
      veteran: { name: 'Ветэран', desc: 'Вопытны гулец.' },
      champion: { name: 'Чэмпіён', desc: 'Заслужаны чэмпіён.' },
      legend: { name: 'Легенда', desc: 'Легендарны гулец.' },
    },
  },
};
