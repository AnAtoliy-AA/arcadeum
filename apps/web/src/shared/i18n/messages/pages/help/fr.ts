import { helpFaq } from '../help-faq/fr';
import type { helpEn } from './en';

export const helpFr: typeof helpEn = {
  title: 'Centre d’Aide Arcadeum',
  subtitle:
    'Guides, règles de jeu, gestion de compte et résolution de problèmes',
  description:
    'Consultez notre base de connaissances, explorez les questions fréquentes ou contactez notre support.',
  searchPlaceholder: 'Rechercher des guides, sujets et questions…',
  noResults: 'Aucun article trouvé pour « {query} »',
  allFaqs: 'Toutes les Questions',
  status: {
    title: 'État de la Plateforme',
    operational: 'Tous les Systèmes Opérationnels',
    gateway: 'Passerelle WebSocket : 100% En Ligne',
    cloud: 'Serveurs de Jeu : Faible Latence',
  },
  categories: [
    {
      id: 'getting-started',
      title: 'Bien Démarrer',
      description: 'Créer des salons, inviter des amis et jouer sans compte.',
      icon: '🚀',
    },
    {
      id: 'games-rules',
      title: 'Jeux et Règles',
      description:
        'Règles officielles, variantes, chronos et calcul des scores.',
      icon: '♟️',
    },
    {
      id: 'account-security',
      title: 'Compte et Sécurité',
      description:
        'Paramètres du profil, réinitialisation de mot de passe et vie privée.',
      icon: '🔒',
    },
    {
      id: 'rewards-economy',
      title: 'Pièces et Récompenses',
      description: 'Séries de connexion, paliers de quêtes et boutique.',
      icon: '💎',
    },
    {
      id: 'tournaments-ranking',
      title: 'Tournois et Classement',
      description:
        'Progression des arbres, calcul Elo et classement de saison.',
      icon: '🏆',
    },
    {
      id: 'technical-support',
      title: 'Support Technique',
      description:
        'Résolution des déconnexions, reconnexion et optimisation de latence.',
      icon: '🛠️',
    },
  ],
  contactChannels: {
    title: 'Besoin d’Assistance Directe ?',
    subtitle: 'Nos modérateurs et notre équipe technique sont disponibles.',
    discord: 'Rejoindre le Discord',
    tickets: 'Ouvrir un Ticket de Support',
    email: 'support@arcadeum.net',
  },
  faq: helpFaq,
  comingSoon: 'Plus de guides interactifs à venir.',
};
