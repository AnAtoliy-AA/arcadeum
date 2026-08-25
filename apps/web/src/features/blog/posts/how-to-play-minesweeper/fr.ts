import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-minesweeper',
  locale: 'fr',
  title: 'Comment jouer au Démineur en ligne — règles, logique, stratégie',
  excerpt:
    'Guide complet du Démineur : grille, drapeaux, schémas de nombres, probabilités et logique pure.',
  publishedAt: '2026-06-05',
  author: 'Équipe Arcadeum',
  tags: ['Minesweeper', 'Puzzle', 'Comment jouer', 'Logique', 'Stratégie'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Le Démineur est le casse-tête logique classique : une grille de cases cachées contient des mines aléatoires. Votre travail : drapeauter chaque mine et révéler chaque case sûre par déduction pure.',
    },
    { type: 'heading', level: 2, text: 'La grille', id: 'grid' },
    {
      type: 'paragraph',
      text: 'Grille standard : Débutant 9x9 (10 mines), Intermédiaire 16x16 (40 mines), Expert 30x16 (99 mines). Premier clic toujours sûr.',
    },
    { type: 'heading', level: 2, text: 'Révéler vs drapeauter', id: 'actions' },
    {
      type: 'paragraph',
      text: 'Clic gauche = révéler. Clic droit = drapeau. Double-clic sur nombre = révéler voisins si drapeaux corrects.',
    },
    { type: 'heading', level: 2, text: 'Schémas de base', id: 'patterns' },
    {
      type: 'list',
      items: [
        '1-2-1. Les mines sont sur les côtés, le centre est sûr.',
        'Soustraction. Un "3" avec 3 drapeaux = les autres cases sont sûres.',
        'Référence croisée. Deux nombres partageant des cases réduisent les emplacements.',
        'Mur : deux 1 partageant des voisins = case extérieure sûre.',
      ],
    },
    { type: 'heading', level: 2, text: 'Probabilités', id: 'probability' },
    {
      type: 'paragraph',
      text: 'Quand la logique ne suffit plus, choisissez la case avec la plus faible probabilité de mine. Comptez les mines restantes.',
    },
    { type: 'heading', level: 2, text: 'Habitudes tactiques', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Commencez par les bords.',
        'Drapeautez uniquement quand certain.',
        'Utilisez le double-clic pour accélérer.',
        'Travaillez plusieurs clusters simultanément.',
      ],
    },
    {
      type: 'cta',
      href: '/games/minesweeper',
      text: 'Jouez au Démineur en ligne — gratuit',
      description: 'Plusieurs tailles et niveaux de difficulté.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Utilisez les schémas (1-2-1, soustraction).',
        'Commencez par les bords.',
        'Drapeautez les mines confirmées.',
        'Probabilité en dernier recours.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Schémas',
        text: 'Maîtrisez 1-2-1 et la soustraction.',
        url: '#patterns',
      },
      { name: 'Bords', text: 'Cliquez près des bords.', url: '#strategy' },
      { name: 'Drapeaux', text: 'Uniquement confirmés.', url: '#actions' },
      {
        name: 'Croisez',
        text: 'Comparez nombres adjacents.',
        url: '#patterns',
      },
    ],
  },
};
