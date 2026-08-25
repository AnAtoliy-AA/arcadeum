import { helpBy } from './help/by';
import { adminAnnouncementsBy } from './admin-announcements/by';
import { adminTournamentsBy } from './admin-tournaments/by';
import { walletBy } from './wallet/by';
import { adminWalletBy } from './admin-wallet/by';
import { gemsBy } from './gems/by';
import { adminGemPackagesBy } from './admin-gem-packages/by';
import { adminEconomyBy } from './admin-economy/by';
import { adminStatisticsBy } from './admin-statistics/by';
import { dailyRewardsBy } from './daily-rewards/by';
import { dailyChallengesBy } from './daily-challenges/by';
import { achievementsBy } from './achievements/by';
import { shopBy } from './shop/by';
import { adminShopBy } from './admin-shop/by';
import { adminGamesBy } from './admin-games/by';
import { adminBlockedIpsBy } from './admin-blocked-ips/by';
import { adminUsersBy } from './admin-users/by';
import { adminBulkRewardsBy } from './admin-bulk-rewards/by';
import { friendsBy } from './friends/by';
import { clansBy } from './clans/by';
import { eventsBy } from './events/by';
import { seasonsBy } from './seasons/by';
import { communityBy } from './community/by';
import { rewardsBy } from './rewards/by';
import { developersBy } from './developers/by';
import { blogBy } from './blog/by';
import { changelogBy } from './changelog/by';
import { roadmapBy } from './roadmap/by';

export const by = {
  admin: {
    title: 'Адмін',
    welcome: 'Сардэчна запрашаем у панэль адміністратара',
    welcomeBody:
      "Панэлі функцый будуць з'яўляцца тут па меры гатоўнасці. Выкарыстоўвайце бакавое меню для навігацыі.",
    signedInAs: 'Вы ўвайшлі як {username}',
    nav: {
      dashboard: 'Панэль',
      statistics: 'Статыстыка',
      users: 'Карыстальнікі',
      payments: 'Плацяжы',
      announcements: "Аб'явы",
      tournaments: 'Турніры',
      economy: 'Эканоміка',
      shop: 'Крама',
      gemPackages: 'Пакеты Гемаў',
      games: 'Гульні',
      gameRules: 'Правілы гульняў',
      bulkRewards: 'Масавыя Ўзнагароды',
      blockedIps: 'Заблакіраваныя IP',
      geoBlock: 'Геаблакіроўка',
      comingSoon: 'Хутка',
    },
    statistics: adminStatisticsBy,
    dashboard: {
      title: 'Камандны Цэнтр',
      subtitle: 'Стан сістэмы, ключавыя метрыкі і модулі адміністравання',
      systemHealth: 'Стан Сістэмы',
      statusOnline: 'Працуе',
      statusDegraded: 'Збоі',
      database: 'База дадзеных',
      collections: 'Калекцыі',
      totalDocuments: 'Усяго дакументаў',
      dataSize: 'Аб’ём дадзеных (МБ)',
      storageSize: 'Аб’ём дыска (МБ)',
      indexSize: 'Аб’ём індэксаў (МБ)',
      activeModules: 'Актыўныя Модулі',
      modulesTitle: 'Адміністрацыйныя Модулі',
      modulesSubtitle:
        'Прамы доступ да кіравання гульнямі, гульцамі, транзакцыямі і бяспекай',
      modules: {
        statistics: {
          title: 'Аналітыка Платформы',
          description:
            'Дадзеныя па MAU, DAU, утрыманні гульцоў, гульнявым часе і выручцы',
        },
        users: {
          title: 'Кіраванне карыстальнікамі',
          description: 'Уліковыя запісы гульцоў, ролі, статусы і баны',
        },
        payments: {
          title: 'Плацяжы і Нататкі',
          description:
            'Гісторыя плацяжоў гульцоў, транзакцыі і службовыя нататкі',
        },
        tournaments: {
          title: 'Турніры',
          description: 'Стварэнне і правядзенне турніраў з прызавымі фондамі',
        },
        gemPackages: {
          title: 'Пакеты Гемаў',
          description: 'Налада пакетаў гемаў, коштаў і бонусаў',
        },
        shop: {
          title: 'Крама і Касметыка',
          description: 'Кіраванне прадметамі інвентара, рэдкасцямі і выдачай',
        },
        economy: {
          title: 'Эканоміка і Казна',
          description:
            'Маніторынг цыркуляцыі токенаў, кранаў і спальвання ўзнагарод',
        },
        bulkRewards: {
          title: 'Масавыя Ўзнагароды',
          description: 'Масавая рассылка валюты і ўзнагарод гульцам',
        },
        games: {
          title: 'Бачнасць Гульняў',
          description: 'Кіраванне даступнасцю і актыўнасцю гульнявых рэжымаў',
        },
        gameRules: {
          title: 'Правілы Гульняў',
          description: 'Налада варыянтаў правіл, таймаўтаў хадоў і механік',
        },
        announcements: {
          title: "Аб'явы",
          description:
            'Публікацыя сістэмных апавяшчэнняў і паведамленняў аб тэхработах',
        },
        blockedIps: {
          title: 'Заблакіраваныя IP',
          description: 'Прагляд і блакіроўка шкодных IP-адрасоў',
        },
        geoBlock: {
          title: 'Геаблакіроўка',
          description: 'Налада тэрытарыяльных абмежаванняў і юрысдыкцый',
        },
      },
      openPanel: 'Адкрыць панэль',
      collectionsOverview: 'Статыстыка калекцый базы дадзеных',
      collectionName: 'Калекцыя',
      docsCount: 'Дакументаў',
      sizeMb: 'Памер (МБ)',
      avgDocSize: 'Сяр. памер аб’екта',
      indexesCount: 'Індэксы',
      liveStatus: 'Бягучы статус',
      environment: 'Асяроддзе',
    },
    error: {
      title: 'Нешта пайшло не так',
      body: 'Адбылася памылка пры загрузцы гэтай старонкі.',
      retry: 'Паўтарыць',
    },
    users: adminUsersBy,
    payments: {
      title: 'Плацяжы',
      search: { placeholder: 'Пошук па нататцы, імі або ID транзакцыі' },
      filter: {
        visibility: {
          label: 'Бачнасць',
          all: 'Усе',
          public: 'Толькі публічныя',
          private: 'Толькі прыватныя',
        },
      },
      table: {
        user: 'Карыстальнік',
        amount: 'Сума',
        note: 'Нататка',
        visibility: 'Бачнасць',
        createdAt: 'Створана',
        transactionId: 'Транзакцыя',
      },
      chip: {
        public: 'Публічная',
        private: 'Прыватная',
        anonymous: 'Ананімны',
      },
      empty: {
        noResults: 'Няма плацяжоў па фільтру.',
        noNotes: 'Плацяжоў пакуль няма.',
      },
      pagination: {
        prev: 'Назад',
        next: 'Наперад',
        of: 'Старонка {current} з {total}',
      },
      totalLabel: '{total} плацяжоў',
    },
    announcements: adminAnnouncementsBy,
    tournaments: adminTournamentsBy,
    wallet: adminWalletBy,
    blockedIps: adminBlockedIpsBy,
    bulkRewards: adminBulkRewardsBy,
  },
  tournaments: {
    title: 'Турніры',
    subtitle: 'Змагайцеся з лепшымі гульцамі свету',
    description:
      'Удзельнічайце ў захапляльных турнірах, падымайцеся па сетцы і змагайцеся за эксклюзіўныя прызы. Новыя турніры дадаюцца рэгулярна.',
    features: [
      {
        title: 'Дынамічныя сеткі',
        description:
          'Сачыце за сваім прагрэсам праз турнірныя сеткі, якія абнаўляюцца ў рэжыме рэальнага часу.',
      },
      {
        title: 'Эксклюзіўныя ўзнагароды',
        description:
          'Выйгравайце прэміум-касметыку, бустэры і ўнікальныя сезонныя ўзнагароды.',
      },
      {
        title: 'Падбор па навыках',
        description:
          'Змагайцеся з гульцамі вашага ўзроўню для сумленнай і цікавай гульні.',
      },
    ],
    comingSoon: "Рэжым турніраў хутка з'явіцца. Сачыце за абнаўленнямі!",
    list: {
      loading: 'Загрузка турніраў…',
      empty: 'Турніраў пакуль няма. Зазірніце пазней!',
      card: {
        registered: 'Запісана {count} / {max}',
        prize: 'Прыз',
        entryFee: 'Узнос',
        prizePool: 'Прызавы фонд',
        registerCta: 'Запісацца',
        unregisterCta: 'Адмяніць запіс',
        signInToRegister: 'Увайдзіце, каб запісацца',
        full: 'У спіс чакання',
        registrationClosed: 'Рэгістрацыя закрыта',
        confirmRegister: {
          title: 'Пацвердзіць удзел',
          body: 'Гэты турнір каштуе {fee} манет. Ваш баланс: {balance} манет.',
          confirm: 'Аплаціць і запісацца',
          cancel: 'Адмена',
        },
        confirmUnregister: {
          refund: 'Вам будзе вернута {amount} манет.',
          title: 'Адмена рэгістрацыі',
          body: 'Вы ўпэўнены?',
          confirm: 'Так, адмяніць',
          cancelButton: 'Не, застацца',
        },
        errors: {
          insufficientFunds: 'Недастаткова манет для ўдзелу.',
        },
        effectiveStatus: {
          scheduled: 'Запланаваны',
          registration_open: 'Рэгістрацыя адкрыта',
          registration_closed: 'Рэгістрацыя закрыта',
          live: 'Ідзе',
          awaiting_results: 'Чакаем вынікі',
          completed: 'Завершаны',
          cancelled: 'Адменены',
        },
        gameType: {
          critical_v1: 'Critical',
          sea_battle_v1: 'Марскі бой',
        },
      },
    },
  },
  blog: blogBy,
  community: communityBy,
  cookies: {
    title: 'Палітыка выкарыстання файлаў cookie',
    lastUpdated: 'Апошняе абнаўленне: 16 жніўня 2026 г.',
    sections: {
      whatAreCookies: {
        title: 'Што такое файлы cookie?',
        content:
          'Файлы cookie — невялікія тэкставыя файлы, якія захоўваюцца на вашай прыладзе пры наведванні нашай платформы. Яны дапамагаюць запамінаць вашы налады.',
      },
      howWeUse: {
        title: 'Як мы выкарыстоўваем файлы cookie',
        intro: 'Мы выкарыстоўваем файлы cookie для наступных мэт:',
        items: [
          'Абавязковыя cookie — неабходныя для карэктнай працы платформы.',
          'Файлы cookie налад — запамінаюць мову, тэму і параметры інтэрфейсу.',
          'Аналітычныя cookie — дапамагаюць нам паляпшаць платформу.',
        ],
      },
      thirdParty: {
        title: 'Файлы cookie трэціх бакоў',
        content:
          'Мы не выкарыстоўваем файлы cookie для адсочвання на старонніх сайтах.',
      },
      managing: {
        title: 'Кіраванне файламі cookie',
        content:
          'Вы можаце адключыць або выдаліць файлы cookie ў наладах браўзера ў любы час.',
      },
      contact: {
        title: 'Пытанні?',
        content:
          'Калі ў вас ёсць пытанні аб выкарыстанні файлаў cookie, звяжыцеся з намі праз старонку падтрымкі.',
      },
    },
  },
  developers: developersBy,
  help: helpBy,
  leaderboards: {
    title: 'Табліцы лідараў',
    subtitle: 'Даведайцеся сваё месца сярод лепшых гульцоў',
    description:
      'Адсочвайце сваю пазіцыю ва ўсіх гульнях, параўноўвайце статыстыку з сябрамі і сачыце за лепшымі гульцамі. Рэйтынгі абнаўляюцца ў рэжыме рэальнага часу.',
    live: 'У прамым эфіры',
    capturedAt: 'Здымак {time}',
    hero: {
      eyebrow: 'У прамым эфіры · Сезон 4',
      title: 'Даганяй табліцу.',
      tagline:
        'Абнаўляецца кожныя 30 секунд. Топ-100 гульцоў рыхтуецца да Кубка чэмпіёнаў.',
    },
    ticker: { live: 'У эфіры' },
    modes: {
      all: { name: 'Усе гульні', subtitle: 'Зводны рэйтынг', icon: '◎' },
      critical_v1: {
        name: 'Critical',
        subtitle: 'Карты з высокімі стаўкамі',
        icon: '♠',
      },
      sea_battle_v1: {
        name: 'Марскі бой',
        subtitle: 'Марская стратэгія',
        icon: '⚓',
      },
      texas_holdem_v1: {
        name: 'Тэхаскі Холдэн',
        subtitle: 'Покерныя сталы',
        icon: '♣',
      },
      glimworm_v1: {
        name: 'Глімворм',
        subtitle: 'Неонавая змейка',
        icon: '🐍',
      },
      tic_tac_toe_v1: {
        name: 'Крыжыкі-нулікі',
        subtitle: 'Класічныя крыжыкі-нулікі',
        icon: '✕',
      },
      cascade_v1: {
        name: 'Cascade',
        subtitle: 'Картачны каскад',
        icon: '▥',
      },
      chess_v1: { name: 'Шахматы', subtitle: 'Класічныя шахматы', icon: '♞' },
      checkers_v1: { name: 'Шашкі', subtitle: 'Настольная класіка', icon: '●' },
      cat_dash_v1: { name: 'Cat Dash', subtitle: 'Каціныя гонкі', icon: '🐱' },
      backgammon_v1: {
        name: 'Нарды',
        subtitle: 'Настольная стратэгія',
        icon: '🎲',
      },
    },
    cup: {
      eyebrow: 'Турнір',
      title: 'Восеньскі кубак',
      endsIn: 'Заканчваецца праз',
      prizePool: 'Прызавы фонд',
      participants: 'Удзельнікі',
      qualifiedLabel: 'Прайшлі',
      comingSoon: 'Хутка',
      comingSoonBody: "Турніры з прызавымі фондамі з'явяцца ўжо хутка.",
    },
    mythic: {
      label: 'Мітык',
      streak: 'Серыя з {count} гульняў',
      leadOver: '+{delta} над #2',
      recentLabel: 'Апошнія 12 матчаў',
      challenge: '⚔ Выклікаць',
      watch: '▶ Глядзець паўтор',
      follow: 'Падпісацца',
      runnerUp: 'Срэбра',
      thirdPlace: 'Бронза',
    },
    controls: {
      global: 'Глабальны',
      perGame: 'Па гульнях',
      tournaments: 'Турніры',
      friends: 'Сябры',
      regional: 'Рэгіянальны',
      searchPlaceholder: 'Знайсці гульца…',
      jumpToMe: '↓ Да майго рангу',
      ranges: {
        today: 'Сёння',
        week: 'Тыдзень',
        month: 'Месяц',
        season: 'Сезон',
      },
    },
    table: {
      rank: '#',
      player: 'Гулец',
      region: 'Рэгіён',
      rating: 'Рэйтынг',
      record: 'П–П–Н',
      winrate: 'Вінрэйт',
      form: 'Форма',
      trend: 'Трэнд',
    },
    trend: {
      up: 'Уверх на {n}',
      down: 'Уніз на {n}',
      same: 'Без зменаў',
    },
    climbers: { title: 'Топ росту' },
    fallers: { title: 'Найбуйнейшыя падзенні' },
    squads: { title: 'Топ кланаў', members: '{count} удзельнікаў' },
    regions: {
      title: 'Па рэгіёнах',
      na: 'Паўночная Амерыка',
      eu: 'Еўропа',
      sa: 'Паўднёвая Амерыка',
      asia: 'Азія',
      oceania: 'Акіянія',
      africa: 'Афрыка',
      me: 'Блізкі Усход',
    },
    rewards: {
      title: 'Лесвіца ўзнагарод',
      mythic: 'Мітычная карона + 12 тыс. золата',
      diamond: 'Алмазны асколак + 6 тыс. золата',
      platinum: 'Платынавы кубак + 3 тыс. золата',
      gold: '1 тыс. золата + касметыка',
    },
    self: {
      pinned: 'Ваш ранг',
      unranked: 'Без рангу — згуляйце 5 рэйтынгавых матчаў',
      share: 'Падзяліцца',
    },
    loadMore: 'Загрузіць яшчэ',
    freshness: {
      updatedAt: 'Абноўлена {ago}',
      justNow: 'толькі што',
      secondsAgo: '{n} с таму',
      minutesAgo: '{n} хв таму',
      hoursAgo: '{n} г таму',
    },
    profile: {
      eyebrow: 'Гулец',
      placeholder:
        "Поўны профіль з гісторыяй рэйтынгу, апошнімі матчамі і інфармацыяй пра клан хутка з'явіцца.",
      back: 'Назад да табліцы',
    },
    empty: {
      title: 'Рэйтынгаў пакуль няма',
      body: 'Будзьце першым на вяршыні.',
    },
    errorState: {
      title: 'Не атрымалася загрузіць табліцу лідараў',
      retry: 'Паўтарыць',
    },
    features: [
      {
        title: 'Табліцы сяброў',
        description:
          'Глядзіце, як вы выглядаеце на фоне сваіх сяброў і змагайцеся за першае месца.',
      },
      {
        title: 'Глабальны рэйтынг',
        description:
          'Змагайцеся за першае месца ў свеце ва ўсіх нашых гульнях.',
      },
      {
        title: 'Гісторыя сезонаў',
        description:
          'Праглядайце свае мінулыя дасягненні і сачыце за прагрэсам.',
      },
    ],
    comingSoon: "Глабальнае табліцы лідараў хутка з'явяцца!",
  },
  rewards: rewardsBy,
  wallet: walletBy,
  gems: gemsBy,
  adminGemPackages: adminGemPackagesBy,
  adminEconomy: adminEconomyBy,
  dailyRewards: dailyRewardsBy,
  dailyChallenges: dailyChallengesBy,
  achievements: achievementsBy,
  shop: shopBy,
  adminShop: adminShopBy,
  adminGames: adminGamesBy,
  friends: friendsBy,
  clans: clansBy,
  events: eventsBy,
  seasons: seasonsBy,
  changelog: changelogBy,
  roadmap: roadmapBy,
};
