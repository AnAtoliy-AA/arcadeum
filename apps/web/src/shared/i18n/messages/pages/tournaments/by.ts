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
};
