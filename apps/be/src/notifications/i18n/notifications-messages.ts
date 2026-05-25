/**
 * Notification i18n strings for push payload rendering.
 *
 * SOURCE OF TRUTH lives in:
 *   apps/web/src/shared/i18n/messages/notifications.ts
 *
 * Keep both files in sync. The BE copy exists so the push payload can be
 * rendered server-side without importing across packages. Same keys, same
 * params, same five locales (en / ru / es / fr / by).
 */

export type SupportedLocale = 'en' | 'ru' | 'es' | 'fr' | 'by';
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

export type NotificationBundle = {
  notifications: {
    daily_reward_ready: { title: string; body: string };
    tournament_starting_soon: { title: string; body: string };
    tournament_registration_opened: { title: string; body: string };
    announcement_new: { title: string; body: string };
  };
};

const en: NotificationBundle = {
  notifications: {
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
  },
};

const ru: NotificationBundle = {
  notifications: {
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
  },
};

const es: NotificationBundle = {
  notifications: {
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
  },
};

const fr: NotificationBundle = {
  notifications: {
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
  },
};

const by: NotificationBundle = {
  notifications: {
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
  },
};

export const NOTIFICATIONS_MESSAGES: Record<
  SupportedLocale,
  NotificationBundle
> = {
  en,
  ru,
  es,
  fr,
  by,
};
