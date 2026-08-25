import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-cascade',
  locale: 'fr',
  title:
    "Comment jouer à Cascade en ligne — règles, chaînes d'action, stratégie",
  excerpt:
    'Guide complet : jeu de cartes style UNO avec chaînes de pénalité et stratégie de combos.',
  publishedAt: '2026-08-11',
  author: 'Équipe Arcadeum',
  tags: ['Cascade', 'Jeu de cartes', 'Comment jouer', 'Stratégie'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Cascade est un jeu rapide de se débarrasser de ses cartes. Pensez à UNO avec de la profondeur : combinez par couleur ou numéro, jouez des actions pour pénaliser et enchaînez des contre-attaques.',
    },
    { type: 'heading', level: 2, text: 'Préparation', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Chaque joueur reçoit une main (7 cartas). Les restantes forment la pioche. La carte du dessus est retournée pour la pile de défausse.',
    },
    { type: 'heading', level: 2, text: 'Tours', id: 'turns' },
    {
      type: 'paragraph',
      text: "Jouez une carte correspondant en couleur, numéro ou symbole. Sinon, piochez une carte. Les jokers s'utilisent sur n'importe quelle carte.",
    },
    { type: 'heading', level: 2, text: "Cartes d'action", id: 'actions' },
    {
      type: 'list',
      items: [
        '+2. Le suivant pioche 2. Se contre par un autre +2.',
        '+4 Joker. Choisissez la couleur. Le suivant pioche 4.',
        'Passer. Le suivant perd son tour.',
        'Inverser. Change la direction.',
        'Joker. Change la couleur.',
      ],
    },
    { type: 'heading', level: 2, text: 'Stratégie', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Diversifiez les couleurs en main.',
        'Gardez les jokers pour les urgences.',
        'Enchaînez les pénalités.',
        'Comptez les cartes et bloquez le leader.',
      ],
    },
    {
      type: 'cta',
      href: '/games/cascade',
      text: 'Jouez à Cascade en ligne — gratuit',
      description: 'Rapides rondes, profondeur stratégique.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Diversifiez couleurs.',
        'Gardez jokers.',
        'Enchaînez +2/+4.',
        'Bloquez le leader.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Combinez',
        text: 'Jouez une carte qui correspond. Sinon, piochez.',
        url: '#turns',
      },
      {
        name: 'Enchaînez',
        text: 'Contrez +2 avec +2, +4 avec +4.',
        url: '#actions',
      },
      { name: 'Gardez jokers', text: 'Pour les urgences.', url: '#strategy' },
      {
        name: 'Bloquez',
        text: 'Changez couleur quand un rival est proche.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'Que faire si on ne peut pas jouer?',
      answer: 'Piochez une carte. Si elle correspond, jouez-la.',
    },
    {
      question: 'Peut-on empiler +2?',
      answer: 'Oui. Contrez avec un autre +2. Le suivant prend 4.',
    },
  ],
};
