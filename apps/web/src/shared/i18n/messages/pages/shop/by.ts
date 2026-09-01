import { shopItemsBy } from './by-items';

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
      inventory: 'Інвентар',
      wallet: 'Кашалёк',
      rewards: 'Узнагароды',
    },
    topUp: 'Папоўніць',
  },
  freeRewardsBanner: {
    title: 'Бясплатныя ўзнагароды і квэсты',
    subtitle:
      'Падпішыцеся на нашы афіцыйныя сацсеткі, каб атрымаць бясплатныя гемы!',
    cta: 'Забраць гемы',
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
      banner: {
        label: 'Банер',
        desc: 'Поўны фон сцэны вашага профілю і лобі.',
        empty: 'Пуста',
      },
      aura: {
        label: 'Аўра',
        desc: 'Зіхатлівыя промні, што кружаць вакол аватара ў лобі і матчах.',
        empty: 'Пуста',
      },
      frame: {
        label: 'Рамка',
        desc: 'Дэкаратыўнае кальцо вакол вашага аватара.',
        empty: 'Пуста',
      },
      background: {
        label: 'Фон',
        desc: 'Каляровая заліўка за аватарам.',
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
      collapse: 'Згарнуць',
    },
    badges: {
      title: 'Значкі',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    colors: {
      title: 'Колеры імя',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    skins: {
      title: 'Скіны гульняў',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    banners: {
      title: 'Банеры',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    auras: {
      title: 'Аўры',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    frames: {
      title: 'Рамкі',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    backgrounds: {
      title: 'Фоны',
      eyebrow: '{count} прадметаў',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
    legendary: {
      title: 'Легендарныя',
      eyebrow: 'Вышэйшы ўзровень',
      viewAll: 'Усе',
      collapse: 'Згарнуць',
    },
  },
  card: {
    owned: 'Маецца',
    equipped: 'Экіпіравана',
    buyEquip: 'Купіць і апрануць',
    equip: 'Апрануць',
    unequip: 'Зняць',
    sell: 'Прадаць · 50%',
  },
  inventory: {
    title: 'Інвентар',
    eyebrow: '{count} прадметаў',
    empty: 'У вас пакуль нічога няма.',
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
    buy: 'Купить',
    cancel: 'Адмена',
    close: 'Закрыць',
    yourBalance: 'У вас {amount} {currency}.',
    free: 'Бясплатна',
    successTitle: 'Экипировано',
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
  items: shopItemsBy,
};
