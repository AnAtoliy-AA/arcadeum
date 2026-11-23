import type { TournamentsI18n } from './en';

export const tournamentsBy: TournamentsI18n = {
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
      viewBracket: 'Паглядзець сетку',
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
  bracket: {
    title: 'Сетка',
    loading: 'Загрузка сеткі…',
    empty: 'Сетка яшчэ не сфарміравана.',
    tbd: 'TBD',
    winner: 'Пераможца',
    backToList: 'Назад да турніраў',
    errors: {
      locked: 'Сетка замацавана: ужо ёсць згуляныя матчы.',
      notEnoughPlayers: 'Недастаткова ўдзельнікаў для фарміравання сеткі.',
    },
  },
  blitzBanner: {
    ariaLabel: 'Штотыднёвы Бліц-Кубак Марскога Бою',
    kicker: 'Штотыднёвы Марскі Чэмпіянат',
    statusLive: 'Кубак ідзе зараз',
    statusOpen: 'Рэгістрацыя адкрыта',
    statusClosed: 'Рэгістрацыя закрыта',
    statusUpcoming: 'Хутка пачнецца',
    statusRegistered: 'Вы запісаныя',
    formatDetails: '{count} капітанаў • На выбыванне',
    captainsReady: 'Капітанаў гатова',
    startsIn: 'Да старту',
    battleStatus: 'Статус бітвы',
    playingNow: 'ІДЗЕ БІТВА',
    signInNotice: 'Увайдзіце, каб удзельнічаць у Бліц-Кубку',
    leaveCup: 'Пакінуць Бліц-Кубак',
    registerCup: 'Удзельнічаць у Бліц-Кубку',
    tournamentFull: 'Месцаў няма',
    viewBracket: 'Адкрыць сетку',
    allTournaments: 'Усе турніры',
    openModal: 'Сетка і склад флоту',
    modalTitle: 'Бліц-Кубак Марскога Бою',
    tabBracket: 'Турнірная сетка',
    tabRoster: 'Спіс капітанаў',
    tabIntel: 'Правілы і рэгламент',
    bracketPendingTitle: 'Жарабяванне пачнецца хутка',
    bracketPendingDesc:
      'Турнірная сетка сфарміруецца аўтаматычна адразу пасля завяршэння рэгістрацыі. Бітва пачнецца ў прызначаны час.',
    rosterTitle: 'Зарэгістраваныя камандзіры',
    rosterSubtitle: '{count} з {max} баявых пазіцый занята',
    rosterWaitlist: 'Ліст чакання',
    rosterYou: 'Ваш флагман',
    rosterEmpty: 'Пакуль няма запісаных капітанаў. Будзьце першым!',
    captainSeed: 'Нумар #{seed}',
    intelFormat: 'Фармат кубка',
    intelFormatDesc:
      'Марскі бой на выбыванне (Single Elimination). Перамагайце ў раўндах, каб выйсці ў фінал.',
    intelFleet: 'Разгортванне флоту',
    intelFleetDesc:
      'Класічнае поле 10x10 і 5 караблёў: Авіяносец, Лінкор, Крэйсер, Падлодка, Эсмінец.',
    intelClock: 'Кантроль часу',
    intelClockDesc: 'Хуткі таймер ходу 30 секунд з аўтаматычным рэжымам залпу.',
    intelRewards: 'Узнагароды пераможцам',
    intelRewardsDesc:
      'Пераможца кубка атрымлівае 500 манет, ганаровы трафей Адмірала і месца на вяршыні табліцы лідараў.',
    fullPageView: 'Старонка турніру',
    closeModal: 'Закрыць',
  },
  weeklyCups: {
    checkers: {
      ariaLabel: 'Шашкі: Штотыднёвы Кубак',
      kicker: 'Штотыднёвы шашачны чэмпіянат',
      formatDetails: '{count} гульцоў • На выбыванне',
      captainsReady: 'Гульцоў гатова',
      battleStatus: 'Статус матчаў',
      signInNotice: 'Увайдзіце, каб удзельнічаць у кубку',
      leaveCup: 'Выйсці з кубка',
      registerCup: 'Запісацца на кубак',
      modalTitle: 'Шашкі: Штотыднёвы Кубак',
      bracketPendingDesc:
        'Сетка сфарміруецца аўтаматычна пасля закрыцця рэгістрацыі. Матчы пачнуцца ў прызначаную гадзіну.',
      rosterTitle: 'Зарэгістраваныя гульцы',
      rosterSubtitle: 'Занята месцаў: {count} з {max}',
      rosterYou: 'Ваша месца',
      rosterEmpty: 'Пакуль ніхто не запісаўся. Станьце першым!',
      intelFormatDesc:
        'Шашкі на выбыванне. Выйгравайце матчы і прасоўвайцеся па сетцы да гранд-фіналу.',
      intelFleet: 'Дошка і правілы',
      intelFleetDesc:
        'Класічныя правілы шашак на стандартнай дошцы, як у звычайным рэйтынгавым матчы.',
      intelClock: 'Гадзіннік на ход',
      intelClockDesc:
        'Матчы гуляюцца з таймерам на ход, таму сачыце за гадзіннікам.',
      intelRewardsDesc:
        'Пераможца кубка атрымлівае 400 манет, трафей Кароны і месца на вяршыні табліцы лідараў па шашках.',
    },
  },
};
