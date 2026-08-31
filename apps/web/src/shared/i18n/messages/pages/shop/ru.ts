import { shopItemsRu } from './ru-items';

export const shopRu = {
  meta: {
    title: 'Магазин · Arcadeum',
    description: 'Аватары, значки, цвета имени и темы матча.',
  },
  topBar: {
    eyebrow: 'Рынок косметики',
    title: 'Магазин',
    nav: {
      shop: 'Магазин',
      inventory: 'Склад',
      wallet: 'Кошелёк',
      rewards: 'Награды',
    },
    topUp: 'Пополнить',
  },
  freeRewardsBanner: {
    title: 'Бесплатные награды и квесты',
    subtitle:
      'Подпишитесь на наши официальные соцсети, чтобы получить бесплатные гемы!',
    cta: 'Забрать гемы',
  },
  signIn: {
    title: 'Войдите, чтобы покупать и экипировать предметы',
    body: 'Вы можете просматривать каталог как гость, но для склада и покупок требуется аккаунт.',
    cta: 'Войти',
  },
  hero: {
    tag: 'Лимитированный дроп',
    tryOn: 'Примерить',
    buyNow: 'Купить сейчас',
    bodySuffix: 'Отображается в лобби, чате и во время матчей.',
  },
  mannequin: {
    tryOn: 'Примерка',
    stage: { level: 'УР {level} · В сети', online: 'В сети' },
    slots: {
      avatar: {
        label: 'Аватар',
        desc: 'Портрет профиля, отображаемый в лобби и чате.',
        empty: 'Пусто',
      },
      badge: {
        label: 'Значок',
        desc: 'Небольшая иконка рядом с вашим именем в списках.',
        empty: 'Пусто',
      },
      name_color: {
        label: 'Цвет имени',
        desc: 'Цвет или градиент вашего ника.',
        empty: 'Пусто',
      },
      game_skin: {
        label: 'Тема матча',
        desc: 'Визуальная тема внутри игровых комнат.',
        empty: 'Пусто',
      },
      banner: {
        label: 'Баннер',
        desc: 'Задний фон профиля и подиума в лобби.',
        empty: 'Пусто',
      },
      aura: {
        label: 'Аура',
        desc: 'Световые лучи вокруг аватара в лобби и во время матчей.',
        empty: 'Пусто',
      },
      frame: {
        label: 'Рамка',
        desc: 'Декоративное кольцо вокруг вашего аватара.',
        empty: 'Пусто',
      },
      background: {
        label: 'Фон',
        desc: 'Цветная подложка под аватаром внутри рамки.',
        empty: 'Пусто',
      },
    },
    action: {
      previewingEyebrow: 'Просмотр',
      selectedSlotEyebrow: 'Выбранный слот',
      loadoutEyebrow: 'Ваша экипировка',
      equippedEyebrow: 'Надето',
      idleTitle: 'Наведите на предмет для примерки',
      idleBody:
        'Или нажмите на слот выше, чтобы отфильтровать каталог. Продажа возвращает 50% стоимости в монетах.',
      buyEquip: 'Купить и надеть',
      equip: 'Надеть',
      unequip: 'Снять',
      sell: 'Продать · 50%',
      clear: 'Сбросить выбор',
      slotEmpty: 'Пусто',
    },
    wallet: {
      nextPack: 'След. набор · {label}',
      ofTarget: '{current}/{target}',
    },
  },
  row: {
    avatars: {
      title: 'Аватары',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    badges: {
      title: 'Значки',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    colors: {
      title: 'Цвета имени',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    skins: {
      title: 'Темы матча',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    banners: {
      title: 'Баннеры',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    auras: {
      title: 'Ауры',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    frames: {
      title: 'Рамки',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    backgrounds: {
      title: 'Фоны',
      eyebrow: 'Предметов: {count}',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
    legendary: {
      title: 'Легендарные',
      eyebrow: 'Высшая редкость',
      viewAll: 'Все',
      collapse: 'Свернуть',
    },
  },
  card: {
    owned: 'Куплено',
    equipped: 'Надето',
    buyEquip: 'Купить и надеть',
    equip: 'Надеть',
    unequip: 'Снять',
    sell: 'Продать · 50%',
  },
  inventory: {
    title: 'Склад',
    eyebrow: 'Куплено: {count}',
    empty: 'У вас пока ничего нет.',
  },
  rarities: {
    common: 'Обычный',
    rare: 'Редкий',
    epic: 'Эпический',
    legendary: 'Легендарный',
  },
  empty: {
    title: 'Магазин сейчас недоступен',
    body: 'Мы уже работаем над этим. Попробуйте через минуту.',
  },
  purchase: {
    title: 'Подтвердите покупку',
    buy: 'Купить',
    cancel: 'Отмена',
    close: 'Закрыть',
    yourBalance: 'У вас {amount} {currency}.',
    free: 'Бесплатно',
    successTitle: 'Экипировано',
    successBody: 'Предмет {name} успешно надет.',
    errors: {
      insufficientFunds: 'Недостаточно средств для покупки.',
      unavailable: 'Этот предмет сейчас недоступен.',
      generic: 'Не удалось совершить покупку. Попробуйте ещё раз.',
    },
  },
  sell: {
    title: 'Продать предмет',
    sell: 'Продать за {amount} монет',
    cancel: 'Отмена',
    refund: 'Вы получите назад {amount} монет.',
    errors: {
      starterNotSellable: 'Стартовые предметы нельзя продать.',
      alreadySold: 'Этот предмет уже продан.',
      unequipFirst: 'Снимите предмет перед продажей.',
      generic: 'Не удалось продать предмет. Попробуйте ещё раз.',
    },
  },
  items: shopItemsRu,
};
