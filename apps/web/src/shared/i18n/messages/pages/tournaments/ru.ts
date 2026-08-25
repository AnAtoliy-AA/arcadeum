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
};
