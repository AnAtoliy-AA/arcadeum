import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-solve-sudoku-advanced',
  locale: 'fr',
  title:
    'Techniques Avancées de Sudoku — X-Wings, Swordfish, XY-Wings et Chaînes Forcées',
  excerpt:
    'Dépassé les paires nues et les singles cachés ? Ce guide couvre les techniques intermédiaires et avancées qui résolvent les puzzles de Sudoku les plus difficiles.',
  publishedAt: '2026-09-12',
  author: 'Équipe Arcadeum',
  tags: ['Sudoku', 'Stratégie', 'Puzzles', 'Avancé', 'Logique'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'Si vous pouvez résoudre des puzzles de Sudoku faciles et moyens mais vous bloquez sur les difficiles et experts, vous avez probablement maîtrisé les singles nus, les singles cachés, les paires nues et les candidats bloqués. Le niveau suivant de techniques élimine les candidats en se basant sur des patterns géométriques à travers plusieurs lignes, colonnes et régions.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'X-Wing — le premier pattern rectangulaire',
      id: 'x-wing',
    },
    {
      type: 'paragraph',
      text: 'Un X-Wing se produit quand un candidat apparaît dans exactement deux cellules dans chacune de deux lignes différentes, et ces cellules sont dans les mêmes deux colonnes. Puisque le candidat doit apparaître dans une des deux cellules dans chaque ligne, il doit occuper deux des quatre coins de ce rectangle. Conséquence : le candidat peut être éliminé de toutes les autres cellules de ces deux colonnes.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Swordfish — le triple rectangle',
      id: 'swordfish',
    },
    {
      type: 'paragraph',
      text: 'Swordfish étend X-Wing à trois lignes et trois colonnes. Un candidat forme un Swordfish quand il apparaît dans exactement 2 ou 3 cellules dans chacune de trois lignes, et ces cellules couvrent collectivement exactement trois colonnes. Éliminez le candidat de toutes les autres cellules de ces trois colonnes.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'XY-Wing — une chaîne de trois cellules',
      id: 'xy-wing',
    },
    {
      type: 'paragraph',
      text: 'Un XY-Wing est une chaîne de trois cellules, chacune avec exactement deux candidats. La cellule pivot a les candidats XY. Deux cellules "pince" partagent un candidat avec le pivot : une a XZ, l\'autre YZ. Comme le pivot est X ou Y, une des pinces doit être Z — donc Z peut être éliminé de toute cellule qui voit les deux pinces.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Ordre de priorité des techniques',
      id: 'priority',
    },
    {
      type: 'list',
      items: [
        '1. Singles Nus/Cachés (vérifiez toujours en premier)',
        '2. Candidats Bloqués',
        '3. Paires, Triples et Quadruples Nus/Cachés',
        '4. X-Wing et Swordfish',
        '5. XY-Wing',
        '6. Rectangle Unique',
        '7. Chaînes forcées',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Appliquez ces techniques — jouez au Sudoku sur Arcadeum',
      description: "Plusieurs niveaux de difficulté du facile à l'expert.",
    },
  ],
  faq: [
    {
      question:
        'Les chaînes forcées sont-elles nécessaires pour résoudre des Sudoku difficiles ?',
      answer:
        'Généralement non. La plupart des puzzles difficiles publiés peuvent être résolus avec X-Wing, Swordfish, XY-Wing et Rectangle Unique. Les chaînes forcées ne deviennent nécessaires que pour les puzzles extrêmes.',
    },
    {
      question: 'Faut-il parfois deviner ?',
      answer:
        "Un puzzle de Sudoku bien construit avec une solution unique peut toujours être résolu par la seule logique. Si vous vous sentez bloqué, cela signifie généralement qu'il existe un pattern que vous n'avez pas encore trouvé.",
    },
  ],
};
