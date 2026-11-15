import type { TournamentsI18n } from './en';

export const tournamentsRu: TournamentsI18n = {
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
      viewBracket: 'Открыть сетку',
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
  bracket: {
    title: 'Сетка',
    loading: 'Загрузка сетки…',
    empty: 'Сетка ещё не сформирована.',
    tbd: 'TBD',
    winner: 'Победитель',
    backToList: 'Назад к турнирам',
    errors: {
      locked: 'Сетка зафиксирована: уже есть сыгранные матчи.',
      notEnoughPlayers: 'Недостаточно участников для формирования сетки.',
    },
  },
  blitzBanner: {
    ariaLabel: 'Еженедельный Блиц-Кубок Морского Боя',
    kicker: 'Еженедельный Морской Чемпионат',
    statusLive: 'Кубок в процессе',
    statusOpen: 'Регистрация открыта',
    statusClosed: 'Регистрация закрыта',
    statusUpcoming: 'Скоро начнётся',
    statusRegistered: 'Вы записаны',
    formatDetails: '{count} капитанов • На выбывание',
    captainsReady: 'Капитанов готово',
    startsIn: 'До старта',
    battleStatus: 'Статус битвы',
    playingNow: 'ИДЁТ БИТВА',
    signInNotice: 'Войдите, чтобы участвовать в Блиц-Кубке',
    leaveCup: 'Покинуть Блиц-Кубок',
    registerCup: 'Участвовать в Блиц-Кубке',
    tournamentFull: 'Мест нет',
    viewBracket: 'Открыть сетку',
    allTournaments: 'Все турниры',
    openModal: 'Сетка и состав флота',
    modalTitle: 'Блиц-Кубок Морского Боя',
    tabBracket: 'Турнирная сетка',
    tabRoster: 'Список капитанов',
    tabIntel: 'Правила и регламент',
    bracketPendingTitle: 'Жеребьёвка начнётся скоро',
    bracketPendingDesc:
      'Турнирная сетка сформируется автоматически сразу после завершения регистрации. Битва начнётся в назначенное время.',
    rosterTitle: 'Зарегистрированные командиры',
    rosterSubtitle: '{count} из {max} боевых позиций занято',
    rosterWaitlist: 'Лист ожидания',
    rosterYou: 'Ваш флагман',
    rosterEmpty: 'Пока нет записавшихся капитанов. Станьте первым!',
    captainSeed: 'Номер #{seed}',
    intelFormat: 'Формат кубка',
    intelFormatDesc:
      'Морской бой на выбывание (Single Elimination). Побеждайте в раундах, чтобы выйти в финал.',
    intelFleet: 'Развёртывание флота',
    intelFleetDesc:
      'Классическое поле 10x10 и 5 кораблей: Авианосец, Линкор, Крейсер, Подлодка, Эсминец.',
    intelClock: 'Контроль времени',
    intelClockDesc:
      'Быстрый таймер хода 30 секунд с автоматическим режимом залпа.',
    intelRewards: 'Награды победителям',
    intelRewardsDesc:
      'Победитель кубка получает 500 монет, почётный трофей Адмирала и место на вершине таблицы лидеров.',
    fullPageView: 'Страница турнира',
    closeModal: 'Закрыть',
  },
};
