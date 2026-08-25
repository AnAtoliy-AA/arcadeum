import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-cat-dash',
  locale: 'fr',
  title: 'Comment jouer à Cat Dash en ligne — courses de dés, talents de chats',
  excerpt:
    'Guide complet : jeu de courses de chats avec dés, talents, obstacles et boosts stratégiques.',
  publishedAt: '2026-08-25',
  author: 'Équipe Arcadeum',
  tags: ['Cat Dash', 'Jeu de plateau', 'Courses', 'Comment jouer', 'Stratégie'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: "Cat Dash est un jeu de courses multijoueur où des chats adorables s'affrontent sur un plateau avec des dés, des talents uniques et des boosts stratégiques. Esquivez les obstacles, ramassez des boosts de thon et utilisez le talent de votre chat pour gagner.",
    },
    { type: 'heading', level: 2, text: 'Préparation', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Chaque joueur choisit un chat avec un talent unique. Tous commencent à la ligne de départ. Lancez le dé pour vous déplacer.',
    },
    { type: 'heading', level: 2, text: 'Cases', id: 'spaces' },
    {
      type: 'list',
      items: [
        'Normale. Avance du nombre affiché sur le dé.',
        'Piège de laine. Perdez un tour.',
        'Tache de lait. Reculez de 1-2.',
        'Boost de thon. Mouvement supplémentaire.',
        'Case de talent. Activez le talent.',
      ],
    },
    { type: 'heading', level: 2, text: 'Talents', id: 'abilities' },
    {
      type: 'paragraph',
      text: 'Chaque chat a un talent unique : Bond (avance 3), Sommeil (immunité), Curiosité (regarder et rejouer), Griffe (repousser un rival).',
    },
    { type: 'heading', level: 2, text: 'Stratégie', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Gardez les boosts pour les lignes droites.',
        'Guidez les rivaux vers les obstacles.',
        'Sprint final avec tout.',
        'Suivez les positions des rivaux.',
      ],
    },
    {
      type: 'cta',
      href: '/games/cat-dash',
      text: 'Jouez à Cat Dash en ligne — gratuit',
      description: 'Courses avec amis ou IA.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Gardez les boosts.',
        'Utilisez talents au bon moment.',
        'Bloquez les couloirs.',
        'Suivez les obstacles.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Lancez le dé',
        text: 'Avancez du nombre indiqué.',
        url: '#setup',
      },
      {
        name: 'Observez cases',
        text: 'Évitez obstacles, ramassez boosts.',
        url: '#spaces',
      },
      {
        name: 'Utilisez talents',
        text: 'Le timing est important.',
        url: '#abilities',
      },
      {
        name: 'Sprint final',
        text: 'Gardez les boosts pour le dernier tronçon.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'Comment avancer?',
      answer: 'Lancez le dé. Votre chat avance du nombre de cases.',
    },
    {
      question: "Qu'est-ce que les obstacles?",
      answer: 'Piège de laine = perdez un tour. Tache de lait = reculez.',
    },
  ],
};
