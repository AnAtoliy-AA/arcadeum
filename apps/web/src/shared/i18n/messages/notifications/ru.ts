import type { DeepPartial } from '../../base-types';
import type { en } from './en';

export const ru: DeepPartial<typeof en> = {
  bell: {
    aria: 'Уведомления',
    empty: 'Пока нет уведомлений',
    title: 'Уведомления',
    markAllRead: 'Отметить все прочитанными',
  },
  settings: {
    title: 'Уведомления',
    description:
      'Выберите, какие уведомления получать. Всё выключено по умолчанию - включите только то, о чём хотите узнавать.',
    permission: {
      granted: 'Уведомления включены в вашем браузере.',
      denied:
        'Браузер заблокировал уведомления. Включите их в настройках сайта.',
      enable: 'Включить уведомления браузера',
    },
    iosInstallHint:
      'На iOS добавьте Arcadeum на главный экран, чтобы получать уведомления. Нажмите «Поделиться», затем «На экран Домой».',
  },
  categories: {
    daily_reward_ready: {
      label: 'Ежедневная награда готова',
      description: 'Сообщает, когда открывается окно для получения награды.',
    },
    tournament_starting_soon: {
      label: 'Турнир скоро начнётся',
      description:
        'Напоминает примерно за 10 минут до начала турнира, на который вы зарегистрированы.',
    },
    tournament_registration_opened: {
      label: 'Новый турнир',
      description: 'Сообщает, когда открывается регистрация на новое событие.',
    },
    announcement_new: {
      label: 'Новые анонсы',
      description: 'Патчноуты, релизы и другие общие объявления.',
    },
    friend_request: {
      label: 'Заявки в друзья',
      description: 'Уведомляет, когда кто-то отправляет заявку в друзья.',
    },
    friend_accepted: {
      label: 'Заявка в друзья принята',
      description: 'Уведомляет, когда кто-то принимает вашу заявку в друзья.',
    },
    game_invitation: {
      label: 'Приглашения в игру',
      description: 'Уведомляет, когда кто-то приглашает вас в игровую комнату.',
    },
    gift_received: {
      label: 'Подарки',
      description: 'Уведомляет, когда кто-то дарит вам подарок.',
    },
  },
  daily_reward_ready: {
    title: 'Награда дня готова',
    body: 'Не теряйте серию - заберите награду.',
  },
  tournament_starting_soon: {
    title: '{{name}} начнётся через {{minutes}} мин',
    body: 'Успейте присоединиться до закрытия сетки.',
  },
  tournament_registration_opened: {
    title: 'Новый турнир: {{name}}',
    body: 'Регистрация открыта. Нажмите, чтобы посмотреть.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
  friend_request: {
    title: 'Новая заявка в друзья',
    body: '{{username}} хочет добавить вас в друзья.',
  },
  friend_accepted: {
    title: 'Заявка в друзья принята',
    body: '{{username}} принял вашу заявку в друзья.',
  },
  game_invitation: {
    title: 'Приглашение в игру',
    body: '{{hostName}} пригласил вас в игру {{gameId}}.',
  },
  rematch_accepted: {
    title: 'Реванш принят',
    body: '{{opponentName}} принял реванш. Войдите в игру!',
  },
  rematch_declined: {
    title: 'Реванш отклонён',
    body: '{{opponentName}} отклонил реванш.',
  },
  gift_received: {
    title: 'Подарок от {{senderName}}',
    body: '{{itemName}}: {{message}}',
  },
};
