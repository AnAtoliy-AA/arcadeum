import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-2048',
  locale: 'fr',
  title:
    'Comment gagner à 2048 en ligne — stratégie, gestion des tuiles, technique du coin',
  excerpt:
    'Guide complet de stratégie 2048 : technique du coin, enchaînement de tuiles, discipline de glissement.',
  publishedAt: '2026-06-19',
  author: 'Équipe Arcadeum',
  tags: ['2048', 'Puzzle', 'Comment jouer', 'Stratégie', 'Nombres'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: '2048 est un puzzle de tuiles glissantes qui récompense la planification à long terme. Grille 4x4, tuiles qui fusionnent. But : créer la tuile 2048.',
    },
    { type: 'heading', level: 2, text: 'Déplacement des tuiles', id: 'rules' },
    {
      type: 'paragraph',
      text: 'Glissez dans une direction. Les tuiles fusionnent si elles sont égales. Une nouvelle tuile (90% = 2, 10% = 4) apparaît après chaque mouvement.',
    },
    { type: 'heading', level: 2, text: 'La technique du coin', id: 'corner' },
    {
      type: 'paragraph',
      text: 'Gardez votre plus grande tuile dans un coin. Construisez une chaîne monotone le long de la ligne du bas. Ne glissez jamais dans une direction qui déplace la plus grande tuile.',
    },
    { type: 'heading', level: 2, text: 'Enchaînement', id: 'chaining' },
    {
      type: 'paragraph',
      text: 'Arrangez les tuiles pour que chaque tuile soit adjacente à la suivante. Quand vous glissez vers le coin, les tuiles fusionnent en cascade.',
    },
    { type: 'heading', level: 2, text: 'Discipline', id: 'discipline' },
    {
      type: 'list',
      items: [
        'Glissez principalement vers votre coin.',
        "Ne glissez jamais à l'opposé du coin.",
        'Construisez une ligne à la fois.',
        'Gardez au moins deux cases vides.',
      ],
    },
    { type: 'heading', level: 2, text: 'Habitudes', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Planifiez avant de glisser.',
        'Lignes monotones.',
        'Gérez les tuiles 4.',
        'Récupérez des erreurs.',
      ],
    },
    {
      type: 'cta',
      href: '/games/2048',
      text: 'Jouez à 2048 en ligne — gratuit',
      description: 'Classique avec animations fluides.',
    },
    { type: 'heading', level: 2, text: 'Résumé', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Verrouillez le coin.',
        'Chaîne décroissante.',
        'Glissez vers le coin.',
        'Cases vides + planification.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      { name: 'Coin', text: 'Choisissez un coin et restez-y.', url: '#corner' },
      {
        name: 'Chaîne',
        text: '128-64-32-16-8-4-2 vers le coin.',
        url: '#chaining',
      },
      {
        name: 'Glisser',
        text: 'Direction principale = coin.',
        url: '#discipline',
      },
      { name: 'Espace', text: 'Au moins 2 cases vides.', url: '#strategy' },
    ],
  },
};
