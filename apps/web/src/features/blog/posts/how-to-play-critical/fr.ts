import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-critical',
  locale: 'fr',
  title:
    'Comment jouer à Critical en ligne — règles, désamorcer bombes, stratégie',
  excerpt:
    "Guide complet : jeu de cartes où chaque pioche peut être la dernière. Apprenez désamorcer, cartes d'action et comptage de pioche.",
  publishedAt: '2026-08-04',
  author: 'Équipe Arcadeum',
  tags: ['Critical', 'Jeu de cartes', 'Comment jouer', 'Stratégie'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Critical est un jeu de cartes rapide à haut risque où chaque pioche peut être la bombe fatale. Les joueurs piochent des cartes, jouent des actions et tentent de survivre. Le dernier debout gagne.',
    },
    { type: 'heading', level: 2, text: 'Préparation', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Chaque joueur reçoit une main (7 cartes). Le reste forme la pioche. Certaines cartes sont des bombes Critical — piocher une bombe vous élimine sans Désamorcer.',
    },
    { type: 'heading', level: 2, text: 'Déroulement des tours', id: 'turns' },
    {
      type: 'paragraph',
      text: 'À votre tour, jouez zéro ou plusieurs cartes action, puis DEVEZ piocher une carte. Jouer des cartes ne termine pas votre tour — tour terminé après pioche ou Passer.',
    },
    { type: 'heading', level: 2, text: 'Types de cartes', id: 'cards' },
    {
      type: 'list',
      items: [
        'Bombe Critical. Piocher = élimination sans Désamorcer.',
        'Désamorcer. Protège de la bombe. Réinsérez la bombe.',
        'Attaque. Le joueur suivant joue 2 tours.',
        'Passer. Termine votre tour sans piocher.',
        'Espionner. Voyez les 3 cartes du dessus.',
        "Vol. Piochez une carte aléatoire d'un rival.",
      ],
    },
    { type: 'heading', level: 2, text: 'Comptage de pioche', id: 'counting' },
    {
      type: 'paragraph',
      text: 'La compétence la plus puissante est de suivre combien de bombes et désamorcer restent. Si dans 20 cartes il y a 3 bombes et 2 désamorcer, votre risque est de 15%.',
    },
    { type: 'heading', level: 2, text: 'Stratégie', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Gardez votre Désamorcer.',
        'Utilisez les Attaques pour forcer les autres à piocher.',
        'Réinsérez les bombes stratégiquement.',
        'Suivez les cartes jouées.',
        'Jouez Espionner avant de piocher.',
      ],
    },
    { type: 'heading', level: 2, text: 'Erreurs courantes', id: 'mistakes' },
    {
      type: 'list',
      items: [
        'Désamorcer trop tôt.',
        'Ignorer le comptage.',
        'Attaques imprudentes.',
        'Réinsérer les bombes de façon évidente.',
      ],
    },
    {
      type: 'cta',
      href: '/games/critical',
      text: 'Jouez à Critical en ligne — gratuit',
      description: "Ouvrez une salle, partagez le lien ou jouez contre l'IA.",
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Comptez bombes et désamorcer.',
        'Gardez votre Désamorcer.',
        'Utilisez Attaques et Passer.',
        'Réinsérez les bombes près du sommet.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Comptez les bombes',
        text: 'Suivez bombes/désamorcer. Votre risque change à chaque tour.',
        url: '#counting',
      },
      {
        name: 'Gardez Désamorcer',
        text: 'Ne le jouez pas proactivement.',
        url: '#strategy',
      },
      {
        name: 'Utilisez Attaques',
        text: 'Quand la pioche est dangereuse, forcez les autres à piocher.',
        url: '#strategy',
      },
      {
        name: 'Réinsérez bombes',
        text: 'Placez-les près du sommet.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'Que se passe-t-il en piochant une bombe?',
      answer: 'Vous êtes éliminé sans Désamorcer.',
    },
    {
      question: "Peut-on jouer des cartes pendant le tour d'autrui?",
      answer: 'Non. Seulement à votre tour, avant de piocher.',
    },
  ],
};
