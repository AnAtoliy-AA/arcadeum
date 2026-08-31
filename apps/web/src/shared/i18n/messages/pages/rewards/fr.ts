import type { rewardsEn } from './en';

export const rewardsFr: typeof rewardsEn = {
  title: 'Programme de Récompenses',
  subtitle:
    'Gagnez des pièces, débloquez des cosmétiques et cumulez vos séries quotidiennes',
  description:
    'Participez à des matchs, terminez des quêtes quotidiennes et grimpez dans les rangs saisonniers pour débloquer des titres exclusifs et des pièces.',
  dailyStreak: {
    title: 'Série de Connexion Quotidienne',
    subtitle:
      'Revenez chaque jour pour réclamer des pièces bonus et des coffres mystères',
    day: 'Jour {day}',
    claimed: 'Réclamé',
    claim: 'Réclamer',
    ready: 'Prêt à réclamer',
    streakBonus: 'Coffre Mystère Jour 7',
  },
  quests: {
    title: 'Quêtes et Défis Actifs',
    subtitle:
      'Relevez des défis dans tous les modes de jeu pour gagner des récompenses',
    dailyTab: 'Quêtes Quotidiennes',
    weeklyTab: 'Missions Hebdomadaires',
    progress: '{current}/{total}',
    items: [
      {
        title: 'Premier Sang',
        description: 'Gagnez 1 partie dans n’importe quel mode multijoueur',
        reward: '+100 Pièces',
        progress: '1/1',
        completed: true,
      },
      {
        title: 'Esprit Tactique',
        description: 'Jouez 3 parties d’Échecs ou de Dames',
        reward: '+250 Pièces',
        progress: '2/3',
        completed: false,
      },
      {
        title: 'Démineur d’Élite',
        description: 'Désamorcez 2 bombes dans Critical sans exploser',
        reward: '+300 Pièces + Badge',
        progress: '1/2',
        completed: false,
      },
      {
        title: 'Champion Social',
        description: 'Invitez un ami à jouer une partie en salon privé',
        reward: '+500 Pièces',
        progress: '0/1',
        completed: false,
      },
    ],
  },
  tiers: {
    title: 'Paliers de Récompenses Saisonniers',
    subtitle:
      'Augmentez le niveau de votre compte pour débloquer des multiplicateurs et du prestige',
    levels: [
      {
        name: 'Bronze',
        badge: '🥉',
        requirement: '0 XP',
        perks: [
          'Matchmaking standard',
          'Taux de gain de base (1.0x)',
          'Badge de chat standard',
        ],
      },
      {
        name: 'Argent',
        badge: '🥈',
        requirement: '1 000 XP',
        perks: [
          'Multiplicateur de pièces +5%',
          'Badge de profil argent',
          '2 remplacements de quêtes par jour',
        ],
      },
      {
        name: 'Or',
        badge: '🥇',
        requirement: '3 500 XP',
        perks: [
          'Multiplicateur de pièces +15%',
          'Bordure animée dorée',
          'Accès aux tournois exclusifs',
        ],
      },
      {
        name: 'Platine',
        badge: '💎',
        requirement: '7 500 XP',
        perks: [
          'Multiplicateur de pièces +25%',
          'Lueur d’avatar platine',
          'File de matchmaking prioritaire',
        ],
      },
      {
        name: 'Mythique',
        badge: '👑',
        requirement: '15 000 XP',
        perks: [
          'Multiplicateur de pièces +50%',
          'Aura mythique exclusive',
          'Thèmes de salon personnalisés',
        ],
      },
    ],
  },
  referralHero: {
    title: 'Invitez vos Amis, Gagnez Ensemble',
    description:
      'Offrez à vos amis 200 pièces de bienvenue à leur inscription et gagnez 500 pièces bonus + 10% de leurs gains de quêtes.',
    cta: 'Obtenir mon lien',
  },
  faq: {
    title: 'FAQ Récompenses',
    items: [
      {
        question:
          'Quand la série de connexion quotidienne se réinitialise-t-elle ?',
        answer:
          'Les séries se réinitialisent à 00:00 UTC. Vous disposez de 24 heures pour récupérer votre récompense.',
      },
      {
        question: 'Comment gagner des points d’expérience (XP) ?',
        answer:
          'Vous gagnez de l’XP en jouant des parties (100 XP par victoire, 40 XP par participation), en réalisant des quêtes et en tournois.',
      },
      {
        question: 'Les bonus de palier expirent-ils ?',
        answer:
          'Les multiplicateurs et badges restent actifs tout au long de la saison de 3 mois.',
      },
    ],
  },
  cta: {
    title: 'Prêt à récupérer votre butin ?',
    description:
      'Rejoignez un salon de jeu dès maintenant et commencez à accumuler des pièces.',
    button: 'Jouer Gratuitement',
  },
  socialRewards: {
    title: 'Récompenses réseaux sociaux',
    subtitle:
      'Abonnez-vous et suivez nos chaînes officielles pour obtenir des gemmes gratuites.',
    badge: 'RÉCOMPENSE EN GEMMES',
    claim: 'Récupérer +{n} 💎',
    claimed: 'Récupéré ✓',
    followAndClaim: 'S’abonner et récupérer +{n} 💎',
    toastSuccess: '+{n} gemme récupérée avec succès !',
    errorAlreadyClaimed: 'Déjà récupéré !',
    errorUnauthorized: 'Connectez-vous pour réclamer des récompenses.',
    errorGeneric: 'Échec de la récupération. Réessayez.',
  },
};
