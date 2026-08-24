import { helpRu } from './help/ru';
import { adminAnnouncementsRu } from './admin-announcements/ru';
import { adminTournamentsRu } from './admin-tournaments/ru';
import { walletRu } from './wallet/ru';
import { adminWalletRu } from './admin-wallet/ru';
import { gemsRu } from './gems/ru';
import { adminGemPackagesRu } from './admin-gem-packages/ru';
import { adminEconomyRu } from './admin-economy/ru';
import { dailyRewardsRu } from './daily-rewards/ru';
import { dailyChallengesRu } from './daily-challenges/ru';
import { achievementsRu } from './achievements/ru';
import { shopRu } from './shop/ru';
import { adminShopRu } from './admin-shop/ru';
import { adminGamesRu } from './admin-games/ru';
import { adminBlockedIpsRu } from './admin-blocked-ips/ru';
import { adminUsersRu } from './admin-users/ru';
import { adminBulkRewardsRu } from './admin-bulk-rewards/ru';
import { friendsRu } from './friends/ru';
import { clansRu } from './clans/ru';
import { eventsRu } from './events/ru';
import { seasonsRu } from './seasons/ru';
import { communityRu } from './community/ru';
import { rewardsRu } from './rewards/ru';
import { developersRu } from './developers/ru';
import { blogRu } from './blog/ru';

export const ru = {
  admin: {
    title: 'Админ',
    welcome: 'Добро пожаловать в панель администратора',
    welcomeBody:
      'Панели функций будут появляться здесь по мере готовности. Используйте боковое меню для навигации.',
    signedInAs: 'Вы вошли как {username}',
    nav: {
      dashboard: 'Панель',
      users: 'Пользователи',
      payments: 'Платежи',
      announcements: 'Объявления',
      tournaments: 'Турниры',
      economy: 'Экономика',
      shop: 'Магазин',
      gemPackages: 'Пакеты Гемов',
      games: 'Игры',
      gameRules: 'Правила игр',
      bulkRewards: 'Массовые Награды',
      blockedIps: 'Заблокированные IP',
      geoBlock: 'Геоблокировка',
      comingSoon: 'Скоро',
    },
    dashboard: {
      title: 'Командный Центр',
      subtitle:
        'Состояние системы, ключевые метрики и модули администрирования',
      systemHealth: 'Состояние Системы',
      statusOnline: 'Работает',
      statusDegraded: 'Сбои',
      database: 'База данных',
      collections: 'Коллекции',
      totalDocuments: 'Всего документов',
      dataSize: 'Объем данных (МБ)',
      storageSize: 'Объем диска (МБ)',
      indexSize: 'Объем индексов (МБ)',
      activeModules: 'Активные Модули',
      modulesTitle: 'Административные Модули',
      modulesSubtitle:
        'Прямой доступ к управлению играми, игроками, транзакциями и безопасностью',
      modules: {
        users: {
          title: 'Управление пользователями',
          description: 'Учетные записи игроков, роли, статусы и баны',
        },
        payments: {
          title: 'Платежи и Заметки',
          description:
            'История платежей игроков, транзакции и служебные заметки',
        },
        tournaments: {
          title: 'Турниры',
          description: 'Создание и проведение турниров с призовыми фондами',
        },
        gemPackages: {
          title: 'Пакеты Гемов',
          description: 'Настройка пакетов гемов, цен и бонусных начислений',
        },
        shop: {
          title: 'Магазин и Косметика',
          description: 'Управление предметами инвентаря, редкостями и выдачей',
        },
        economy: {
          title: 'Экономика и Казна',
          description:
            'Мониторинг циркуляции токенов, кранов и сжигания наград',
        },
        bulkRewards: {
          title: 'Массовые Награды',
          description: 'Массовая рассылка валюты и наград выбранным когортам',
        },
        games: {
          title: 'Видимость Игр',
          description: 'Управление доступностью и активностью игровых режимов',
        },
        gameRules: {
          title: 'Правила Игр',
          description: 'Настройка вариантов правил, таймеров ходов и механик',
        },
        announcements: {
          title: 'Объявления',
          description:
            'Публикация системных уведомлений и оповещений о техработах',
        },
        blockedIps: {
          title: 'Заблокированные IP',
          description: 'Просмотр и блокировка вредоносных IP-адресов',
        },
        geoBlock: {
          title: 'Геоблокировка',
          description: 'Настройка территориальных ограничений и юрисдикций',
        },
      },
      openPanel: 'Открыть панель',
      collectionsOverview: 'Статистика коллекций базы данных',
      collectionName: 'Коллекция',
      docsCount: 'Документов',
      sizeMb: 'Размер (МБ)',
      avgDocSize: 'Ср. размер объекта',
      indexesCount: 'Индексы',
      liveStatus: 'Текущий статус',
      environment: 'Окружение',
    },
    error: {
      title: 'Что-то пошло не так',
      body: 'Произошла ошибка при загрузке этой страницы.',
      retry: 'Повторить',
    },
    users: adminUsersRu,
    payments: {
      title: 'Платежи',
      search: { placeholder: 'Поиск по тексту, имени или ID транзакции' },
      filter: {
        visibility: {
          label: 'Видимость',
          all: 'Все',
          public: 'Только публичные',
          private: 'Только приватные',
        },
      },
      table: {
        user: 'Пользователь',
        amount: 'Сумма',
        note: 'Заметка',
        visibility: 'Видимость',
        createdAt: 'Создано',
        transactionId: 'Транзакция',
      },
      chip: {
        public: 'Публичная',
        private: 'Приватная',
        anonymous: 'Аноним',
      },
      empty: {
        noResults: 'Нет платежей по фильтру.',
        noNotes: 'Платежей пока нет.',
      },
      pagination: {
        prev: 'Назад',
        next: 'Вперёд',
        of: 'Страница {current} из {total}',
      },
      totalLabel: '{total} платежей',
    },
    announcements: adminAnnouncementsRu,
    tournaments: adminTournamentsRu,
    wallet: adminWalletRu,
    blockedIps: adminBlockedIpsRu,
    bulkRewards: adminBulkRewardsRu,
  },
  tournaments: {
    title: 'Турниры',
    subtitle: 'Соревнуйтесь с лучшими игроками мира',
    description:
      'Участвуйте в захватывающих турнирах, поднимайтесь по сетке и борьтесь за эксклюзивные призы. Новые турниры добавляются регулярно.',
    features: [
      {
        title: 'Динамические сетки',
        description:
          'Следите за своим прогрессом через турнирные сетки, обновляемые в реальном времени.',
      },
      {
        title: 'Эксклюзивные награды',
        description:
          'Выигрывайте премиум-косметику, бустеры и уникальные сезонные награды.',
      },
      {
        title: 'Подбор по навыкам',
        description:
          'Соревнуйтесь с игроками вашего уровня для честной и интересной игры.',
      },
    ],
    comingSoon: 'Режим турниров скоро появится. Следите за обновлениями!',
    list: {
      loading: 'Загрузка турниров…',
      empty: 'Турниров пока нет. Загляните позже!',
      card: {
        registered: 'Записано {count} / {max}',
        prize: 'Приз',
        entryFee: 'Взнос',
        prizePool: 'Призовой фонд',
        registerCta: 'Зарегистрироваться',
        unregisterCta: 'Отменить регистрацию',
        signInToRegister: 'Войдите, чтобы зарегистрироваться',
        full: 'В лист ожидания',
        registrationClosed: 'Регистрация закрыта',
        confirmRegister: {
          title: 'Подтвердить участие',
          body: 'Этот турнир стоит {fee} монет. Ваш баланс: {balance} монет.',
          confirm: 'Оплатить и зарегистрироваться',
          cancel: 'Отмена',
        },
        confirmUnregister: {
          refund: 'Вам будет возвращено {amount} монет.',
          title: 'Отмена регистрации',
          body: 'Вы уверены?',
          confirm: 'Да, отменить',
          cancelButton: 'Нет, остаться',
        },
        errors: {
          insufficientFunds: 'Недостаточно монет для участия.',
        },
        effectiveStatus: {
          scheduled: 'Запланирован',
          registration_open: 'Регистрация открыта',
          registration_closed: 'Регистрация закрыта',
          live: 'Идёт',
          awaiting_results: 'Ожидание результатов',
          completed: 'Завершён',
          cancelled: 'Отменён',
        },
        gameType: {
          critical_v1: 'Critical',
          sea_battle_v1: 'Морской бой',
        },
      },
    },
  },
  blog: blogRu,
  community: communityRu,
  cookies: {
    title: 'Политика использования файлов cookie',
    lastUpdated: 'Последнее обновление: 16 августа 2026 г.',
    sections: {
      whatAreCookies: {
        title: 'Что такое файлы cookie?',
        content:
          'Файлы cookie — небольшие текстовые файлы, сохраняемые на вашем устройстве при посещении нашей платформы. Они помогают запомнить ваши настройки и оставаться в системе.',
      },
      howWeUse: {
        title: 'Как мы используем файлы cookie',
        intro: 'Мы используем файлы cookie в следующих целях:',
        items: [
          'Обязательные cookie — необходимы для корректной работы платформы.',
          'Файлы cookie настроек — запоминают язык, тему и параметры интерфейса.',
          'Аналитические cookie — помогают нам улучшать платформу.',
        ],
      },
      thirdParty: {
        title: 'Файлы cookie третьих сторон',
        content:
          'Мы не используем файлы cookie для отслеживания на сторонних сайтах.',
      },
      managing: {
        title: 'Управление файлами cookie',
        content:
          'Вы можете отключить или удалить файлы cookie в настройках браузера в любое время.',
      },
      contact: {
        title: 'Вопросы?',
        content:
          'Если у вас есть вопросы об использовании файлов cookie, свяжитесь с нами через страницу поддержки.',
      },
    },
  },
  developers: developersRu,
  help: helpRu,
  leaderboards: {
    title: 'Таблицы лидеров',
    subtitle: 'Узнайте своё место среди лучших игроков',
    description:
      'Отслеживайте свою позицию во всех играх, сравнивайте статистику с друзьями и следите за лучшими игроками. Рейтинги обновляются в реальном времени.',
    live: 'В прямом эфире',
    capturedAt: 'Снимок {time}',
    hero: {
      eyebrow: 'В прямом эфире · Сезон 4',
      title: 'Догоняй таблицу.',
      tagline:
        'Обновляется каждые 30 секунд. Топ-100 игроков готовится к Кубку чемпионов.',
    },
    ticker: { live: 'В эфире' },
    modes: {
      all: { name: 'Все игры', subtitle: 'Сводный рейтинг', icon: '◎' },
      critical_v1: {
        name: 'Critical',
        subtitle: 'Карты с высокими ставками',
        icon: '♠',
      },
      sea_battle_v1: {
        name: 'Морской бой',
        subtitle: 'Морская стратегия',
        icon: '⚓',
      },
      texas_holdem_v1: {
        name: 'Техасский Холдем',
        subtitle: 'Покерные столы',
        icon: '♣',
      },
      glimworm_v1: {
        name: 'Глимворм',
        subtitle: 'Неоновая змейка',
        icon: '🐍',
      },
      tic_tac_toe_v1: {
        name: 'Крестики-нолики',
        subtitle: 'Классика 3 в ряд',
        icon: '✕',
      },
      cascade_v1: {
        name: 'Cascade',
        subtitle: 'Карточный каскад',
        icon: '▥',
      },
      chess_v1: {
        name: 'Шахматы',
        subtitle: 'Классические шахматы',
        icon: '♞',
      },
      checkers_v1: {
        name: 'Шашки',
        subtitle: 'Настольная классика',
        icon: '●',
      },
      cat_dash_v1: { name: 'Cat Dash', subtitle: 'Кошачьи гонки', icon: '🐱' },
      backgammon_v1: {
        name: 'Нарды',
        subtitle: 'Настольная стратегия',
        icon: '🎲',
      },
    },
    cup: {
      eyebrow: 'Турнир',
      title: 'Осенний кубок',
      endsIn: 'Заканчивается через',
      prizePool: 'Призовой фонд',
      participants: 'Участники',
      qualifiedLabel: 'Прошли',
      comingSoon: 'Скоро',
      comingSoonBody: 'Турниры с призовыми фондами появятся в ближайшее время.',
    },
    mythic: {
      label: 'Мифик',
      streak: 'Серия из {count} побед',
      leadOver: '+{delta} над #2',
      recentLabel: 'Последние 12 матчей',
      challenge: '⚔ Вызвать',
      watch: '▶ Смотреть запись',
      follow: 'Подписаться',
      runnerUp: 'Серебро',
      thirdPlace: 'Бронза',
    },
    controls: {
      global: 'Глобальный',
      perGame: 'По играм',
      tournaments: 'Турниры',
      friends: 'Друзья',
      regional: 'Регион',
      searchPlaceholder: 'Найти игрока…',
      jumpToMe: '↓ К моему рангу',
      ranges: {
        today: 'Сегодня',
        week: 'Неделя',
        month: 'Месяц',
        season: 'Сезон',
      },
    },
    table: {
      rank: '#',
      player: 'Игрок',
      region: 'Регион',
      rating: 'Рейтинг',
      record: 'П–П–Н',
      winrate: 'Винрейт',
      form: 'Форма',
      trend: 'Тренд',
    },
    trend: {
      up: 'Вверх на {n}',
      down: 'Вниз на {n}',
      same: 'Без изменений',
    },
    climbers: { title: 'Топ роста' },
    fallers: { title: 'Крупнейшие падения' },
    squads: { title: 'Топ кланов', members: '{count} участников' },
    regions: {
      title: 'По регионам',
      na: 'Северная Америка',
      eu: 'Европа',
      sa: 'Южная Америка',
      asia: 'Азия',
      oceania: 'Океания',
      africa: 'Африка',
      me: 'Ближний Восток',
    },
    rewards: {
      title: 'Лестница наград',
      mythic: 'Мифическая корона + 12 тыс. золота',
      diamond: 'Алмазный осколок + 6 тыс. золота',
      platinum: 'Платиновый кубок + 3 тыс. золота',
      gold: '1 тыс. золота + косметика',
    },
    self: {
      pinned: 'Ваш ранг',
      unranked: 'Без ранга — сыграйте 5 рейтинговых матчей',
      share: 'Поделиться',
    },
    loadMore: 'Показать ещё',
    freshness: {
      updatedAt: 'Обновлено {ago}',
      justNow: 'только что',
      secondsAgo: '{n} с назад',
      minutesAgo: '{n} мин назад',
      hoursAgo: '{n} ч назад',
    },
    profile: {
      eyebrow: 'Игрок',
      placeholder:
        'Полный профиль с историей рейтинга, последними матчами и информацией о клане скоро появится.',
      back: 'Назад к таблице',
    },
    empty: {
      title: 'Рейтингов пока нет',
      body: 'Будьте первым на вершине.',
    },
    errorState: {
      title: 'Не удалось загрузить таблицу лидеров',
      retry: 'Повторить',
    },
    features: [
      {
        title: 'Таблицы друзей',
        description:
          'Смотрите, как вы выглядите на фоне своих друзей и боритесь за первое место.',
      },
      {
        title: 'Глобальный рейтинг',
        description: 'Сражайтесь за первое место в мире во всех наших играх.',
      },
      {
        title: 'История сезонов',
        description:
          'Просматривайте свои прошлые достижения и следите за прогрессом.',
      },
    ],
    comingSoon: 'Глобальные таблицы лидеров скоро появятся!',
  },
  rewards: rewardsRu,
  wallet: walletRu,
  gems: gemsRu,
  adminGemPackages: adminGemPackagesRu,
  adminEconomy: adminEconomyRu,
  dailyRewards: dailyRewardsRu,
  dailyChallenges: dailyChallengesRu,
  achievements: achievementsRu,
  shop: shopRu,
  adminShop: adminShopRu,
  adminGames: adminGamesRu,
  friends: friendsRu,
  clans: clansRu,
  events: eventsRu,
  seasons: seasonsRu,
};
