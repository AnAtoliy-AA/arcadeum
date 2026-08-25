import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-tic-tac-toe',
  locale: 'fr',
  title:
    'Comment gagner au Tic Tac Toe — stratégie, fourches, premier et second joueur',
  excerpt:
    'Guide complet : avantage du premier joueur, défense, fourches et habitudes gagnantes.',
  publishedAt: '2026-06-30',
  author: 'Équipe Arcadeum',
  tags: [
    'Tic Tac Toe',
    'Comment jouer',
    'Stratégie',
    'Jeu de plateau',
    'Logique',
  ],
  readingTimeMinutes: 5,
  body: [
    {
      type: 'paragraph',
      text: 'Le Tic Tac Toe est un jeu résolu — avec un jeu parfait, chaque partie est nulle. Mais en pratique, les adversaires font des erreurs. Celui qui comprend la stratégie les punit.',
    },
    { type: 'heading', level: 2, text: 'Les règles', id: 'rules' },
    {
      type: 'paragraph',
      text: 'Deux joueurs placent X ou O sur une grille 3x3. X commence. Trois alignés gagnent. Grille pleine sans alignement = nulle.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Premier joueur (X)',
      id: 'first-player',
    },
    {
      type: 'paragraph',
      text: "Ouvrez au centre — c'est la case la plus forte. Si l'adversaire prend un bord, X peut forcer la victoire. Si l'adversaire prend un coin, jouez le coin opposé. Jamais d'ouverture en bord — le second joueur a un avantage forcé.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Second joueur (O)',
      id: 'second-player',
    },
    {
      type: 'paragraph',
      text: 'Si X ouvre centre, O doit prendre un COIN. Si X ouvre coin, O doit prendre le CENTRE. Le centre est la case la plus précieuse, puis les coins, puis les bords.',
    },
    { type: 'heading', level: 2, text: 'Fourches', id: 'forks' },
    {
      type: 'paragraph',
      text: "Une fourche crée deux menaces simultanées. L'adversaire ne peut bloquer qu'une. Avant chaque mouvement, cherchez les fourches — les vôtres et celles de l'adversaire.",
    },
    { type: 'heading', level: 2, text: 'Priorités', id: 'priority' },
    {
      type: 'list',
      items: [
        'Gagnez maintenant.',
        'Bloquez.',
        'Créez une fourche.',
        'Bloquez une fourche adverse.',
        'Prenez le centre ou les coins.',
      ],
    },
    {
      type: 'cta',
      href: '/games/tic-tac-toe',
      text: 'Jouez au Tic Tac Toe — gratuit',
      description: 'Défiez amis ou IA.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Ouvrez centre en X.',
        'Créez des fourches.',
        'Bloquez les fourches adverses.',
        "Jamais d'ouverture bord.",
      ],
    },
  ],
  howTo: {
    totalTime: 'PT5M',
    steps: [
      { name: 'Centre', text: 'X ouvre au centre.', url: '#first-player' },
      {
        name: 'Coins',
        text: 'O prend un coin contre centre.',
        url: '#second-player',
      },
      { name: 'Fourches', text: 'Deux menaces simultanées.', url: '#forks' },
      {
        name: 'Bloquez',
        text: 'Vérifiez les fourches adverses.',
        url: '#forks',
      },
    ],
  },
};
