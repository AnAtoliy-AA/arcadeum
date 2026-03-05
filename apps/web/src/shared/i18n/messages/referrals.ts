import type { Locale } from '../types';

const referralsMessagesDefinition = {
  en: {
    dashboard: {
      title: 'Invite Friends',
      subtitle:
        'Share your referral code with friends. Earn cosmetic badges and early access to upcoming decks!',
    },
    shareCard: {
      title: 'Your Referral Code',
      copy: 'Copy',
      copied: 'Copied!',
      linkLabel: 'Share link:',
    },
    progressCard: {
      title: 'Your Progress',
      nextAt: 'Next reward at {{count}} invites',
      allUnlocked: 'All rewards unlocked! 🎉',
      friendsInvited: 'Friends invited',
      remaining: '{{count}} more to go',
    },
    rewardsCard: {
      title: 'Rewards',
      tierTitle: 'Invite {{count}} friends',
      unlocked: 'Unlocked',
      locked: 'Locked',
    },
    unauthenticated: {
      title: 'Sign in to invite friends and earn rewards',
    },
    loading: 'Loading referrals...',
    error: {
      title: 'Could not load referral data',
    },
    nav: {
      inviteFriends: 'Invite Friends',
    },
  },
  es: {
    dashboard: {
      title: 'Invitar Amigos',
      subtitle:
        '¡Comparte tu código de referencia con amigos. Gana insignias cosméticas y acceso anticipado a los próximos mazos!',
    },
    shareCard: {
      title: 'Tu Código de Referencia',
      copy: 'Copiar',
      copied: '¡Copiado!',
      linkLabel: 'Enlace para compartir:',
    },
    progressCard: {
      title: 'Tu Progreso',
      nextAt: 'Próxima recompensa a {{count}} invitaciones',
      allUnlocked: '¡Todas las recompensas desbloqueadas! 🎉',
      friendsInvited: 'Amigos invitados',
      remaining: '{{count}} más por lograr',
    },
    rewardsCard: {
      title: 'Recompensas',
      tierTitle: 'Invita a {{count}} amigos',
      unlocked: 'Desbloqueado',
      locked: 'Bloqueado',
    },
    unauthenticated: {
      title: 'Inicia sesión para invitar amigos y ganar recompensas',
    },
    loading: 'Cargando referencias...',
    error: {
      title: 'No se pudieron cargar los datos de referencia',
    },
    nav: {
      inviteFriends: 'Invitar Amigos',
    },
  },
  fr: {
    dashboard: {
      title: 'Inviter des Amis',
      subtitle:
        'Partagez votre code de parrainage avec vos amis. Gagnez des badges cosmétiques et un accès anticipé aux prochains jeux!',
    },
    shareCard: {
      title: 'Votre Code de Parrainage',
      copy: 'Copier',
      copied: 'Copié!',
      linkLabel: 'Lien de partage:',
    },
    progressCard: {
      title: 'Votre Progression',
      nextAt: 'Prochaine récompense à {{count}} invitations',
      allUnlocked: 'Toutes les récompenses débloquées! 🎉',
      friendsInvited: 'Amis invités',
      remaining: 'Encore {{count}}',
    },
    rewardsCard: {
      title: 'Récompenses',
      tierTitle: 'Invitez {{count}} amis',
      unlocked: 'Débloqué',
      locked: 'Verrouillé',
    },
    unauthenticated: {
      title: 'Connectez-vous pour inviter des amis et gagner des récompenses',
    },
    loading: 'Chargement des parrainages...',
    error: {
      title: 'Impossible de charger les données de parrainage',
    },
    nav: {
      inviteFriends: 'Inviter des Amis',
    },
  },
  ru: {
    dashboard: {
      title: 'Пригласить друзей',
      subtitle:
        'Поделитесь реферальным кодом с друзьями. Получайте косметические значки и ранний доступ к предстоящим колодам!',
    },
    shareCard: {
      title: 'Ваш реферальный код',
      copy: 'Копировать',
      copied: 'Скопировано!',
      linkLabel: 'Ссылка для приглашения:',
    },
    progressCard: {
      title: 'Ваш прогресс',
      nextAt: 'Следующая награда при {{count}} приглашении(ях)',
      allUnlocked: 'Все награды разблокированы! 🎉',
      friendsInvited: 'Друзей приглашено',
      remaining: 'Ещё {{count}}',
    },
    rewardsCard: {
      title: 'Награды',
      tierTitle: 'Пригласите {{count}} друзей',
      unlocked: 'Разблокировано',
      locked: 'Заблокировано',
    },
    unauthenticated: {
      title: 'Войдите, чтобы приглашать друзей и получать награды',
    },
    loading: 'Загрузка рефералов...',
    error: {
      title: 'Не удалось загрузить данные о рефералах',
    },
    nav: {
      inviteFriends: 'Пригласить друзей',
    },
  },
  by: {
    dashboard: {
      title: 'Запрасіць сяброў',
      subtitle:
        'Падзяліцеся рэферальным кодам з сябрамі. Атрымлівайце касметычныя значкі і ранні доступ да будучых калод!',
    },
    shareCard: {
      title: 'Ваш рэферальны код',
      copy: 'Капіяваць',
      copied: 'Скапіявана!',
      linkLabel: 'Спасылка для запрашэння:',
    },
    progressCard: {
      title: 'Ваш прагрэс',
      nextAt: 'Наступная ўзнагарода пры {{count}} запрашэнні(ях)',
      allUnlocked: 'Усе ўзнагароды разблакіраваны! 🎉',
      friendsInvited: 'Сяброў запрошана',
      remaining: 'Яшчэ {{count}}',
    },
    rewardsCard: {
      title: 'Узнагароды',
      tierTitle: 'Запрасіце {{count}} сяброў',
      unlocked: 'Разблакіравана',
      locked: 'Заблакіравана',
    },
    unauthenticated: {
      title: 'Увайдзіце, каб запрашаць сяброў і атрымліваць узнагароды',
    },
    loading: 'Загрузка рэфералаў...',
    error: {
      title: 'Не ўдалося загрузіць дадзеныя пра рэфералы',
    },
    nav: {
      inviteFriends: 'Запрасіць сяброў',
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const referralsMessages = referralsMessagesDefinition;

export type ReferralsMessages = (typeof referralsMessagesDefinition)['en'];
