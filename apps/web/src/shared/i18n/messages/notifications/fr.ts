import type { DeepPartial } from '../../base-types';
import type { en } from './en';

export const fr: DeepPartial<typeof en> = {
  bell: {
    aria: 'Notifications',
    empty: 'Aucune notification pour l’instant',
    title: 'Notifications',
    markAllRead: 'Tout marquer comme lu',
  },
  settings: {
    title: 'Notifications',
    description:
      'Choisis tes notifications. Tout est désactivé par défaut - active uniquement ce que tu veux savoir.',
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
    friend_request: {
      label: "Demandes d'ami",
      description: "T'avertit quand quelqu'un envoie une demande d'ami.",
    },
    friend_accepted: {
      label: "Demande d'ami acceptée",
      description: "T'avertit quand quelqu'un accepte ta demande d'ami.",
    },
    game_invitation: {
      label: 'Invitations à jouer',
      description: "T'avertit quand quelqu'un t'invite dans une salle de jeu.",
    },
    gift_received: {
      label: 'Cadeaux',
      description: "T'avertit quand quelqu'un t'envoie un cadeau.",
    },
  },
  daily_reward_ready: {
    title: 'Récompense quotidienne prête',
    body: 'Ta série t\u2019attend - récupère-la maintenant.',
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
  friend_request: {
    title: "Nouvelle demande d'ami",
    body: '{{username}} veut être ton ami.',
  },
  friend_accepted: {
    title: "Demande d'ami acceptée",
    body: "{{username}} a accepté ta demande d'ami.",
  },
  game_invitation: {
    title: 'Invitation à jouer',
    body: '{{hostName}} vous a invité à jouer à {{gameId}}.',
  },
  rematch_accepted: {
    title: 'Revanche acceptée',
    body: '{{opponentName}} a accepté votre revanche. Rejoignez la partie !',
  },
  rematch_declined: {
    title: 'Revanche refusée',
    body: '{{opponentName}} a refusé la revanche.',
  },
  gift_received: {
    title: 'Cadeau de {{senderName}}',
    body: '{{itemName}}: {{message}}',
  },
};
