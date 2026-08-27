import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-pachisi',
  locale: 'fr',
  title:
    'Comment jouer au Pachisi (Ludo) en ligne — règles, captures, stratégie',
  excerpt:
    'Guide complet : course de dés avec captures, cases sécurisées et blocages tactiques.',
  publishedAt: '2026-07-07',
  author: 'Équipe Arcadeum',
  tags: ['Pachisi', 'Ludo', 'Comment jouer', 'Stratégie', 'Jeu de plateau'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Le Pachisi (Ludo) est un classique jeu de course pour 2-4 joueurs. Chaque joueur fait courir quatre pions autour du plateau et les ramène à la maison. Lancez les dés, capturez, bloquez et soyez le premier à ramener vos quatre pions à la maison.',
    },
    { type: 'heading', level: 2, text: 'Préparation', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Chaque joueur commence avec 4 pions dans sa base. Il faut un nombre spécifique (normalement 6) pour sortir un pion.',
    },
    { type: 'heading', level: 2, text: 'Captures', id: 'captures' },
    {
      type: 'paragraph',
      text: 'Si vous atterrissez sur une case occupée par un rival, son pion est capturé et renvoyé à sa base. Capturer donne un tour supplémentaire.',
    },
    { type: 'heading', level: 2, text: 'Cases sécurisées', id: 'safe' },
    {
      type: 'paragraph',
      text: "Les cases marquées protègent les pions de la capture. La colonne finale n'accepte que vos pions. Il faut le nombre exact pour finir.",
    },
    { type: 'heading', level: 2, text: 'Stratégie', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Dispersez vos pions.',
        'Utilisez les cases sécurisées.',
        'Capturez pour le tempo.',
        'Priorisez la maison.',
        'Bloquez avec deux pions.',
      ],
    },
    {
      type: 'cta',
      href: '/games/pachisi',
      text: 'Jouez au Pachisi en ligne — gratuit',
      description: 'Courses avec amis ou IA.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Dispersez les pions.',
        'Cases sécurisées.',
        'Capturez pour le tempo.',
        'Ramenez à la maison.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Sortez pions',
        text: 'Lancez 6 pour sortir de la base.',
        url: '#setup',
      },
      {
        name: 'Capturez',
        text: 'Case rivale = capture + tour supplémentaire.',
        url: '#captures',
      },
      {
        name: 'Cases sécurisées',
        text: 'Protègent de la capture.',
        url: '#safe',
      },
      {
        name: 'Maison',
        text: 'Colonne finale + nombre exact.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'Comment sortir un pion?',
      answer: 'Lancez 6 pour sortir de la base.',
    },
    {
      question: 'Que se passe-t-il en capturant?',
      answer:
        'Le pion rival retourne à la base. Vous gagnez un tour supplémentaire.',
    },
  ],
};
