import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-go',
  locale: 'fr',
  title:
    'Comment jouer au Go (Baduk, Weiqi) en ligne — règles, vie et mort, stratégie',
  excerpt:
    'Guide complet du Go : setup, libertés, captures, ko, territoire et concepts stratégiques.',
  publishedAt: '2026-06-23',
  author: 'Équipe Arcadeum',
  tags: [
    'Go',
    'Baduk',
    'Weiqi',
    'Comment jouer',
    'Stratégie',
    'Jeu de plateau',
  ],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: 'Le Go est le plus ancien jeu de plateau encore joué. Deux joueurs placent des pierres noires et blanches sur une grille 19x19 pour contrôler le territoire. Règles simples, profondeur immense.',
    },
    { type: 'heading', level: 2, text: 'Le plateau', id: 'basics' },
    {
      type: 'paragraph',
      text: 'Joué sur grille 19x19 (9x9 et 13x13 pour débutants). Noir commence, une pierre par tour sur intersection vide. Les pierres ne bougent plus — seulement capturées.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Libertés et captures',
      id: 'liberties',
    },
    {
      type: 'paragraph',
      text: 'Les libertés sont les intersections vides adjacentes. Un groupe partage ses libertés. Zéro liberté = capturé et retiré.',
    },
    { type: 'heading', level: 2, text: 'Règle du ko', id: 'ko' },
    {
      type: 'paragraph',
      text: 'Empêche les boucles infinies : si une capture recrée la position précédente, le joueur ne peut pas recapturer immédiatement.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Vie et mort — deux yeux',
      id: 'life-death',
    },
    {
      type: 'paragraph',
      text: 'Un groupe est vivant s\'il a deux libertés internes séparées ("yeux"). Un groupe avec deux yeux ne peut pas être capturé. C\'est le concept le plus important du Go.',
    },
    { type: 'heading', level: 2, text: 'Territoire', id: 'territory' },
    {
      type: 'paragraph',
      text: "Entourez plus de territoire (intersections vides) que l'adversaire. Komi (6.5 ou 7.5 points) compense l'avantage du noir.",
    },
    { type: 'heading', level: 2, text: 'Ouverture', id: 'opening' },
    {
      type: 'paragraph',
      text: 'Proverbes : "Coins d\'abord, bords ensuite, centre en dernier." Les coins sont les plus faciles à sécuriser. Troisième ligne = territoire, quatrième = influence.',
    },
    { type: 'heading', level: 2, text: 'Concepts tactiques', id: 'tactics' },
    {
      type: 'list',
      items: [
        'Atari. Une seule liberté — un coup de la capture.',
        'Échelles. Motif de poursuite.',
        'Filets. Piège sans attaque directe.',
        'Couper et connecter. Couper affaiblit, connecter renforce.',
        'Sente et gote. Sente = initiative, gote = pas de réponse obligée.',
      ],
    },
    { type: 'heading', level: 2, text: 'Erreurs', id: 'mistakes' },
    {
      type: 'list',
      items: [
        'Trop de centre au début.',
        'Ignorer vie et mort.',
        'Sur-concentration.',
        'Remplir ses propres yeux.',
      ],
    },
    {
      type: 'cta',
      href: '/games/go',
      text: 'Jouez au Go en ligne — gratuit',
      description: 'Grilles 9x9, 13x13, 19x19. Handicap disponible.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        "Coins d'abord.",
        'Vérifiez vie et mort.',
        'Ligne 3 territoire, ligne 4 influence.',
        'Gardez sente (initiative).',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      { name: 'Coins', text: 'Sécurisez les coins.', url: '#opening' },
      { name: 'Libertés', text: 'Connaissez les libertés.', url: '#liberties' },
      { name: 'Deux yeux', text: 'Vivant = deux yeux.', url: '#life-death' },
      { name: 'Sente', text: "Gardez l'initiative.", url: '#tactics' },
    ],
  },
};
