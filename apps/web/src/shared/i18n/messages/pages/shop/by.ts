export const shopBy = {
  meta: {
    title: 'Крама · Arcadeum',
    description: 'Аватары, значкі, колеры імя і скіны гульняў.',
  },
  topBar: {
    eyebrow: 'Крама касметыкі',
    title: 'Крама',
    nav: {
      shop: 'Крама',
      featured: 'Выбранае',
      inventory: 'Інвентар',
      wallet: 'Кашалёк',
    },
    topUp: 'Папоўніць',
  },
  signIn: {
    title: 'Увайдзіце, каб купляць і экіпіраваць',
    body: 'Каталог даступны гасцям, але для інвентара і пакупак патрэбен акаўнт.',
    cta: 'Увайсці',
  },
  hero: {
    tag: 'Лімітаваны дроп',
    tryOn: 'Прымераць',
    buyNow: 'Купіць',
    bodySuffix: 'Бачна ў лобі, чаце і падчас матчаў.',
  },
  mannequin: {
    tryOn: 'Прымерка',
    stage: { level: 'УЗР {level} · Анлайн', online: 'Анлайн' },
    slots: {
      avatar: {
        label: 'Аватар',
        desc: 'Партрэт профілю ў лобі і чаце.',
        empty: 'Пуста',
      },
      badge: {
        label: 'Значок',
        desc: 'Маленькі значок побач з імем у спісах.',
        empty: 'Пуста',
      },
      name_color: {
        label: 'Колер імя',
        desc: 'Колер або градыент вашага імя.',
        empty: 'Пуста',
      },
      game_skin: {
        label: 'Скін гульні',
        desc: 'Візуальная тэма ўнутры матчаў.',
        empty: 'Пуста',
      },
    },
    action: {
      previewingEyebrow: 'Прымерка',
      selectedSlotEyebrow: 'Абраны слот',
      loadoutEyebrow: 'Ваш набор',
      equippedEyebrow: 'Экіпіравана',
      idleTitle: 'Навядзіце на прадмет, каб прымераць',
      idleBody:
        'Або націсніце слот вышэй, каб адфільтраваць каталог. Продаж вяртае 50% манетамі.',
      buyEquip: 'Купіць і апрануць',
      equip: 'Апрануць',
      unequip: 'Зняць',
      sell: 'Прадаць · 50%',
      clear: 'Зняць выбар',
      slotEmpty: 'Пуста',
    },
    wallet: {
      nextPack: 'Наступны пак · {label}',
      ofTarget: '{current}/{target}',
    },
  },
  row: {
    avatars: {
      title: 'Аватары',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
    },
    badges: {
      title: 'Значкі',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
    },
    colors: {
      title: 'Колеры імя',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
    },
    skins: {
      title: 'Скіны гульняў',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
    },
    legendary: {
      title: 'Легендарныя',
      eyebrow: 'Вышэйшы ўзровень',
      viewAll: 'Усе',
    },
  },
  card: {
    owned: 'Маецца',
    equipped: 'Экіпіравана',
    buyEquip: 'Купіць і апрануць',
  },
  rarities: {
    common: 'Звычайны',
    rare: 'Рэдкі',
    epic: 'Эпічны',
    legendary: 'Легендарны',
  },
  empty: {
    title: 'Крама зараз недаступная',
    body: 'Ужо працуем над гэтым. Паспрабуйце праз хвіліну.',
  },
  purchase: {
    title: 'Пацвердзіць пакупку',
    buy: 'Купіць',
    cancel: 'Адмена',
    close: 'Закрыць',
    yourBalance: 'У вас {amount} {currency}.',
    free: 'Бясплатна',
    successTitle: 'Экіпіравана',
    successBody: '{name} цяпер экіпіравана.',
    errors: {
      insufficientFunds: 'Не хапае сродкаў на пакупку.',
      unavailable: 'Гэты прадмет цяпер недаступны.',
      generic: 'Не атрымалася завяршыць пакупку. Паспрабуйце зноў.',
    },
  },
  sell: {
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
    name_color: {
      slate: { name: 'Сланец', desc: 'Спакойны халаднаваты шэры.' },
      emerald: { name: 'Смарагд', desc: 'Свежы смарагдава-зялёны.' },
      cyan: { name: 'Цыян', desc: 'Электрычны цыян.' },
      violet: { name: 'Фіялка', desc: 'Яркі фіялетавы.' },
      sunset: { name: 'Захад', desc: 'Цёплы градыент захаду.' },
      aurora: { name: 'Аўрора', desc: 'Пераліўны градыент палярнага ззяння.' },
    },
  },
};
