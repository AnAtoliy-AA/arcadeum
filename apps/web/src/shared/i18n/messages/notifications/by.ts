import type { DeepPartial } from '../../base-types';
import type { en } from './en';

export const by: DeepPartial<typeof en> = {
  bell: {
    aria: 'Апавяшчэнні',
    empty: 'Пакуль няма апавяшчэнняў',
    title: 'Апавяшчэнні',
    markAllRead: 'Адзначыць усе прачытанымі',
  },
  settings: {
    title: 'Апавяшчэнні',
    description:
      'Выберыце, якія апавяшчэнні атрымліваць. Усё выключана па змаўчанні - уключыце толькі тое, пра што хочаце ведаць.',
    permission: {
      granted: 'Апавяшчэнні ўключаны ў вашым браўзеры.',
      denied: 'Браўзер заблакаваў апавяшчэнні. Уключыце іх у наладах сайта.',
      enable: 'Уключыць апавяшчэнні браўзера',
    },
    iosInstallHint:
      'На iOS дадайце Arcadeum на галоўны экран, каб атрымліваць апавяшчэнні. Націсніце «Падзяліцца», затым «На экран Дамоў».',
  },
  categories: {
    daily_reward_ready: {
      label: 'Узнагарода дня гатовая',
      description: 'Паведамляе, калі адкрываецца акно атрымання ўзнагароды.',
    },
    tournament_starting_soon: {
      label: 'Турнір хутка пачнецца',
      description:
        'Папярэджвае прыкладна за 10 хвілін да пачатку турніру, на які вы зарэгістраваны.',
    },
    tournament_registration_opened: {
      label: 'Новы турнір',
      description:
        'Паведамляе, калі адкрываецца рэгістрацыя на новае мерапрыемства.',
    },
    announcement_new: {
      label: 'Новыя анонсы',
      description: 'Патчноўты, рэлізы і іншыя агульныя анонсы.',
    },
    friend_request: {
      label: 'Запыты ў сябры',
      description: 'Паведамляе, калі хтосьці адпраўляе запыт у сябры.',
    },
    friend_accepted: {
      label: 'Запыт у сябры прыняты',
      description: 'Паведамляе, калі хтосьці прымае ваш запыт у сябры.',
    },
    game_invitation: {
      label: 'Запрашэнні ў гульню',
      description: 'Паведамляе, калі хтосьці запрашае вас у ігравы пакой.',
    },
    gift_received: {
      label: 'Падарункі',
      description: 'Паведамляе, калі хтосьці дорыць вам падарунак.',
    },
  },
  daily_reward_ready: {
    title: 'Узнагарода дня гатовая',
    body: 'Не губіце серыю - забярыце ўзнагароду.',
  },
  tournament_starting_soon: {
    title: '{{name}} пачнецца праз {{minutes}} хв',
    body: 'Паспейце далучыцца да закрыцця сеткі.',
  },
  tournament_registration_opened: {
    title: 'Новы турнір: {{name}}',
    body: 'Рэгістрацыя адкрыта. Націсніце, каб паглядзець.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
  friend_request: {
    title: 'Новы запыт у сябры',
    body: '{{username}} хоча стаць вашым сябром.',
  },
  friend_accepted: {
    title: 'Запыт у сябры прыняты',
    body: '{{username}} прыняў ваш запыт у сябры.',
  },
  game_invitation: {
    title: 'Запрашэнне ў гульню',
    body: '{{hostName}} запрасіў вас пагуляць у {{gameId}}.',
  },
  rematch_accepted: {
    title: 'Рэванш прыняты',
    body: '{{opponentName}} прыняў рэванш. Далучайцеся да гульні!',
  },
  rematch_declined: {
    title: 'Рэванш адхілены',
    body: '{{opponentName}} адхіліў рэванш.',
  },
  gift_received: {
    title: 'Падарунак ад {{senderName}}',
    body: '{{itemName}}: {{message}}',
  },
};
