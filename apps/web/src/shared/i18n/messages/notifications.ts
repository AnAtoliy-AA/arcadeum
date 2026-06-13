import type { DeepPartial } from '../base-types';

/**
 * SOURCE OF TRUTH for notification i18n strings (web + BE both render
 * from the same key/copy). Keep apps/be/src/notifications/i18n/notifications-messages.ts
 * in sync — the BE copy exists so push payloads can be rendered server-side.
 *
 * Categories used by the dispatcher are tracked in
 * apps/be/src/notifications/notification-categories.ts.
 */

export const en = {
  bell: {
    aria: 'Notifications',
    empty: 'No notifications yet',
    title: 'Notifications',
    markAllRead: 'Mark all read',
  },
  settings: {
    title: 'Notifications',
    description:
      'Pick which notifications you want. Everything is off by default — turn on only what you want to be alerted about.',
    permission: {
      granted: 'Notifications are enabled in your browser.',
      denied:
        'Your browser has blocked notifications. Update site settings to enable.',
      enable: 'Enable browser notifications',
    },
    iosInstallHint:
      'On iOS you need to add Arcadeum to your home screen before notifications can work. Tap the Share button, then "Add to Home Screen".',
  },
  categories: {
    daily_reward_ready: {
      label: 'Daily reward ready',
      description: 'Tells you when your streak window opens.',
    },
    tournament_starting_soon: {
      label: 'Tournament starting soon',
      description:
        'Alerts you ~10 minutes before a tournament you’re registered for begins.',
    },
    tournament_registration_opened: {
      label: 'New tournament published',
      description: 'Lets you know when registration opens for a new event.',
    },
    announcement_new: {
      label: 'New announcement',
      description: 'New patch notes, drops, and other site-wide announcements.',
    },
  },
  daily_reward_ready: {
    title: 'Daily reward ready',
    body: 'Your streak is waiting — claim it now.',
  },
  tournament_starting_soon: {
    title: '{{name}} starts in {{minutes}} min',
    body: 'Get in before the bracket locks.',
  },
  tournament_registration_opened: {
    title: 'New tournament: {{name}}',
    body: 'Registration is open. Tap to view.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
};

export type NotificationsMessages = DeepPartial<typeof en>;

export const ru: DeepPartial<NotificationsMessages> = {
  bell: {
    aria: 'Уведомления',
    empty: 'Пока нет уведомлений',
    title: 'Уведомления',
    markAllRead: 'Отметить все прочитанными',
  },
  settings: {
    title: 'Уведомления',
    description:
      'Выберите, какие уведомления получать. Всё выключено по умолчанию — включите только то, о чём хотите узнавать.',
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
  },
  daily_reward_ready: {
    title: 'Награда дня готова',
    body: 'Не теряйте серию — заберите награду.',
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
};

export const es: DeepPartial<NotificationsMessages> = {
  bell: {
    aria: 'Notificaciones',
    empty: 'Aún no hay notificaciones',
    title: 'Notificaciones',
    markAllRead: 'Marcar todo como leído',
  },
  settings: {
    title: 'Notificaciones',
    description:
      'Elige qué notificaciones quieres. Todo está desactivado por defecto — activa solo lo que te interese.',
    permission: {
      granted: 'Las notificaciones están activadas en tu navegador.',
      denied:
        'Tu navegador ha bloqueado las notificaciones. Actívalas en la configuración del sitio.',
      enable: 'Activar notificaciones del navegador',
    },
    iosInstallHint:
      'En iOS añade Arcadeum a la pantalla de inicio antes de recibir notificaciones. Toca Compartir y luego «Añadir a inicio».',
  },
  categories: {
    daily_reward_ready: {
      label: 'Recompensa diaria lista',
      description: 'Te avisa cuando se abre la ventana de tu racha.',
    },
    tournament_starting_soon: {
      label: 'Torneo a punto de empezar',
      description:
        'Te avisa unos 10 minutos antes de un torneo en el que estás registrado.',
    },
    tournament_registration_opened: {
      label: 'Nuevo torneo publicado',
      description:
        'Te avisa cuando se abren las inscripciones a un evento nuevo.',
    },
    announcement_new: {
      label: 'Nuevo anuncio',
      description: 'Notas de parche, lanzamientos y otros anuncios generales.',
    },
  },
  daily_reward_ready: {
    title: 'Recompensa diaria lista',
    body: 'Tu racha te espera — recógela ahora.',
  },
  tournament_starting_soon: {
    title: '{{name}} comienza en {{minutes}} min',
    body: 'Entra antes de que se cierre el cuadro.',
  },
  tournament_registration_opened: {
    title: 'Nuevo torneo: {{name}}',
    body: 'La inscripción está abierta. Toca para ver.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
};

export const fr: DeepPartial<NotificationsMessages> = {
  bell: {
    aria: 'Notifications',
    empty: 'Aucune notification pour l’instant',
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
  },
  settings: {
    title: 'Notifications',
    description:
      'Choisis tes notifications. Tout est désactivé par défaut — active uniquement ce que tu veux savoir.',
    permission: {
      granted: 'Les notifications sont activées dans ton navigateur.',
      denied:
        'Ton navigateur a bloqué les notifications. Modifie les paramètres du site pour les activer.',
      enable: 'Activer les notifications du navigateur',
    },
    iosInstallHint:
      'Sur iOS, ajoute Arcadeum à l’écran d’accueil avant de pouvoir recevoir des notifications. Touche Partager puis « Sur l’écran d’accueil ».',
  },
  categories: {
    daily_reward_ready: {
      label: 'Récompense quotidienne prête',
      description: 'T’avertit quand ta fenêtre de série s’ouvre.',
    },
    tournament_starting_soon: {
      label: 'Tournoi imminent',
      description:
        'T’avertit ~10 minutes avant un tournoi auquel tu es inscrit·e.',
    },
    tournament_registration_opened: {
      label: 'Nouveau tournoi publié',
      description:
        'T’avertit quand les inscriptions s’ouvrent pour un nouvel événement.',
    },
    announcement_new: {
      label: 'Nouvelle annonce',
      description:
        'Notes de patch, nouveautés boutique et autres annonces générales.',
    },
  },
  daily_reward_ready: {
    title: 'Récompense quotidienne prête',
    body: 'Ta série t’attend — récupère-la maintenant.',
  },
  tournament_starting_soon: {
    title: '{{name}} commence dans {{minutes}} min',
    body: 'Inscris-toi avant la fermeture du tableau.',
  },
  tournament_registration_opened: {
    title: 'Nouveau tournoi : {{name}}',
    body: 'Les inscriptions sont ouvertes. Touche pour voir.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
};

export const by: DeepPartial<NotificationsMessages> = {
  bell: {
    aria: 'Апавяшчэнні',
    empty: 'Пакуль няма апавяшчэнняў',
    title: 'Апавяшчэнні',
    markAllRead: 'Адзначыць усе прачытанымі',
  },
  settings: {
    title: 'Апавяшчэнні',
    description:
      'Выберыце, якія апавяшчэнні атрымліваць. Усё выключана па змаўчанні — уключыце толькі тое, пра што хочаце ведаць.',
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
  },
  daily_reward_ready: {
    title: 'Узнагарода дня гатовая',
    body: 'Не губіце серыю — забярыце ўзнагароду.',
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
};
