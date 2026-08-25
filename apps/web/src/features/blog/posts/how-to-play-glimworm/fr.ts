import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-glimworm',
  locale: 'fr',
  title: 'Comment jouer à Glimworm en ligne — arène néon, tactiques, survie',
  excerpt:
    'Guide complet : multijoueur serpientes où vous mangez de la lumière, laissez des traces létales et surpassez les rivaux.',
  publishedAt: '2026-08-18',
  author: 'Équipe Arcadeum',
  tags: ['Glimworm', 'Serpientes', 'Arcade', 'Comment jouer', 'Stratégie'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: "Glimworm est une arène multijoueur en temps réel inspirée de Snake. Jusqu'à 10 joueurs s'affrontent dans une arène néon, mangeant des particules lumineuses pour grandir et laissant des traces létales. Impact frontal = élimination. Le dernier serpent lumineux gagne.",
    },
    { type: 'heading', level: 2, text: "L'arène", id: 'arena' },
    {
      type: 'paragraph',
      text: 'Le jeu se déroule dans une arène limitée remplie de particules lumineuses. Toucher la frontière = mort.',
    },
    { type: 'heading', level: 2, text: 'Mécaniques', id: 'mechanics' },
    {
      type: 'list',
      items: [
        'Mouvement. Le serpent suit le curseur.',
        'Manger des particules. Allonge le corps.',
        'Traces. Les autres serpents meurent en les touchant.',
        'Accélération. Sacrifiez des traces pour aller plus vite.',
        'Collision. Corps = mort. Bordure = mort.',
      ],
    },
    { type: 'heading', level: 2, text: 'Tactiques', id: 'tactics' },
    {
      type: 'list',
      items: [
        'Piège circulaire. Encerclez les petits serpents.',
        'Interceptez avec accélération.',
        'Ferme en périphérie.',
        'Leurre avec trace.',
        'Récoltez les particules des éliminés.',
      ],
    },
    { type: 'heading', level: 2, text: 'Stratégie', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Début : grandissez en périphérie.',
        'Milieu : affrontez les plus petits.',
        'Fin : jouez agressivement.',
        "Gérez l'accélération.",
      ],
    },
    {
      type: 'cta',
      href: '/games/glimworm',
      text: 'Jouez à Glimworm en ligne — gratuit',
      description: 'Arène néon, jeu instantané.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Grandissez en périphérie.',
        'Pièges circulaires.',
        'Économisez accélération.',
        'Récoltez particules des éliminés.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      { name: 'Mangez', text: 'Périphérie pour grandir.', url: '#strategy' },
      {
        name: 'Apprenez cercle',
        text: 'Encerclez les petits.',
        url: '#tactics',
      },
      {
        name: 'Maîtrisez accélération',
        text: 'Raccourci pour accélérer.',
        url: '#mechanics',
      },
      {
        name: 'Évitez frontaux',
        text: 'Jamais de collision frontale.',
        url: '#tactics',
      },
    ],
  },
  faq: [
    {
      question: "Qu'est-ce qui cause l'élimination?",
      answer: 'Collision avec corps, bordure, ou impact frontal.',
    },
    {
      question: "Comment fonctionne l'accélération?",
      answer:
        'Sacrifiez des traces pour aller plus vite. Plus rapide mais plus court.',
    },
  ],
};
