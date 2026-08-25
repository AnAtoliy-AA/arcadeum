import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sudoku',
  locale: 'fr',
  title: 'Comment jouer au Sudoku en ligne — règles, techniques, stratégie',
  excerpt:
    'Guide complet du Sudoku : règles, balayage, annotations, techniques intermédiaires et avancées.',
  publishedAt: '2026-06-12',
  author: 'Équipe Arcadeum',
  tags: ['Sudoku', 'Puzzle', 'Comment jouer', 'Logique', 'Stratégie'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Le Sudoku est le casse-tête de chiffres le plus populaire. Grille 9x9, neuf boîtes 3x3, certaines cases pré-remplies. Remplissez chaque case pour que ligne, colonne et boîte contiennent 1-9 exactement une fois.',
    },
    { type: 'heading', level: 2, text: 'Les règles', id: 'rules' },
    {
      type: 'paragraph',
      text: 'Chaque ligne, colonne et boîte 3x3 contient 1-9 exactement une fois. Ces trois contraintes interagissent.',
    },
    { type: 'heading', level: 2, text: 'Balayage', id: 'scanning' },
    {
      type: 'paragraph',
      text: "Le croisement est la base. Pour chaque chiffre, vérifiez lignes, colonnes et boîtes. L'intersection laisse souvent une seule case possible.",
    },
    { type: 'heading', level: 2, text: 'Annotations', id: 'pencil-marks' },
    {
      type: 'paragraph',
      text: "Écrivez les candidats possibles dans chaque case vide. Un seul candidat = solution (nu). Un chiffre dans une seule case d'un groupe = solution cachée.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Techniques intermédiaires',
      id: 'intermediate',
    },
    {
      type: 'list',
      items: [
        'Paires nues. Deux cases avec les mêmes deux candidats.',
        'Triple nues. Trois cases, trois candidats.',
        'Paires cachées. Deux chiffres dans deux cases seulement.',
        "Paires pointantes. Deux cases dans une même ligne/colonne d'une boîte.",
      ],
    },
    { type: 'heading', level: 2, text: 'Techniques avancées', id: 'advanced' },
    {
      type: 'list',
      items: ['Réduction boîte-ligne.', 'X-Wing.', 'Swordfish.', 'XY-Wing.'],
    },
    { type: 'heading', level: 2, text: 'Habitudes', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Ne jamais deviner.',
        'Travailler systématiquement.',
        'Mettre à jour les annotations.',
        'Commencer par les cases les plus contraintes.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Jouez au Sudoku en ligne — gratuit',
      description: 'Plusieurs niveaux de difficulté.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Croisez chaque chiffre.',
        'Annotations + singles.',
        'Ne jamais deviner.',
        'Systématiquement chiffre par chiffre.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Croisez',
        text: 'Pour chaque chiffre, vérifiez lignes/colonnes.',
        url: '#scanning',
      },
      {
        name: 'Annotations',
        text: 'Candidats dans chaque case.',
        url: '#pencil-marks',
      },
      {
        name: 'Singles',
        text: 'Un candidat = solution.',
        url: '#pencil-marks',
      },
      {
        name: 'Ne devinez pas',
        text: 'Re-balancez ou cherchez paires.',
        url: '#strategy',
      },
    ],
  },
};
