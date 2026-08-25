import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-solitaire',
  locale: 'fr',
  title:
    'Comment jouer au Solitaire (Klondike) en ligne — règles, stratégie, conseils',
  excerpt:
    'Guide complet du Solitaire Klondike : disposition, coups autorisés, stratégie de fondation et habitudes gagnantes.',
  publishedAt: '2026-07-28',
  author: 'Équipe Arcadeum',
  tags: ['Solitaire', 'Klondike', 'Jeu de cartes', 'Comment jouer', 'Puzzle'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: "Le Solitaire Klondike est le jeu de patience le plus joué au monde. Vous triez 52 cartes en quatre piles par couleur, de l'As au Roi. Les règles sont simples, mais la stratégie fait la différence.",
    },
    { type: 'heading', level: 2, text: 'Disposition', id: 'layout' },
    {
      type: 'paragraph',
      text: "28 cartes sont distribuées en 7 colonnes : colonne 1 = 1 carte, colonne 2 = 2, jusqu'à 7 cartes. Seule la carte du dessus est visible. Les 24 restantes forment la pioche. 4 piles de fondation vides (♠ ♥ ♦ ♣) en haut.",
    },
    { type: 'heading', level: 2, text: 'Coups autorisés', id: 'moves' },
    {
      type: 'paragraph',
      text: "Tableau : déplacez une carte visible sur une carte d'une rangée supérieure et couleur opposée. Un Roi remplit une colonne vide. Fondation : la carte suivante dans la suite de même couleur. Pioche : tournez les cartes quand aucun coup tableau n'est possible.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Vérité sur la victoire',
      id: 'winning',
    },
    {
      type: 'paragraph',
      text: 'Beaucoup de combinaisons sont injouables. Le jeu habile augmente significativement votre taux de victoire. Savoir reconnaître une partie morte fait partie du jeu efficace.',
    },
    { type: 'heading', level: 2, text: 'Stratégie', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Privilégiez toujours le coup qui retourne une carte face cachée.',
        'Travaillez la colonne la plus profonde en priorité.',
        "N'envoyez pas trop vite les cartes moyennes en fondation.",
        'Choisissez le Roi qui équilibre vos cartes cachées.',
        'En pioche-3, mémorisez le cycle de la pioche.',
      ],
    },
    { type: 'heading', level: 2, text: 'Erreurs courantes', id: 'mistakes' },
    {
      type: 'list',
      items: [
        'Jouer chaque coup disponible réflexivement.',
        'Enterrer des rangs sous les Rois.',
        'Ignorer les cartes face cachée.',
        'Abandonner trop tôt.',
      ],
    },
    {
      type: 'cta',
      href: '/games/solitaire',
      text: 'Jouez au Solitaire en ligne — gratuit',
      description: 'Klondike classique avec modes pioche-1 et pioche-3.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Retournez les cartes face cachée.',
        'Travaillez la colonne la plus profonde.',
        'Gardez les cartes moyennes en tableau.',
        'Choisissez le bon Roi.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Retournez face cachée',
        text: 'Priorisez les cartes cachées.',
        url: '#strategy',
      },
      {
        name: 'Colonne profonde',
        text: 'Concentrez-vous sur la plus profonde.',
        url: '#strategy',
      },
      {
        name: 'Cartes moyennes',
        text: 'Ne les envoyez pas en fondation.',
        url: '#strategy',
      },
      {
        name: 'Bon Roi',
        text: 'Choisissez celui qui équilibre.',
        url: '#strategy',
      },
    ],
  },
};
