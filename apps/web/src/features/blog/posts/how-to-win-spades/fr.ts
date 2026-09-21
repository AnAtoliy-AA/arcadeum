import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-spades',
  locale: 'fr',
  title: 'Comment gagner au Spades — Enchères, Nils, Sacs et Jeu en Équipe',
  excerpt:
    'Au-delà des bases : comment lire votre main, enchérir avec précision, exécuter des enchères nulles, éviter les pénalités de sacs et signaler à votre partenaire.',
  publishedAt: '2026-09-17',
  author: 'Équipe Arcadeum',
  tags: ['Spades', 'Jeu de Cartes', 'Stratégie', 'Enchères', 'Avancé'],
  readingTimeMinutes: 11,
  body: [
    {
      type: 'paragraph',
      text: "Au Spades, la vraie compétence réside dans les enchères — avant qu'une carte ne soit jouée. Une équipe qui enchérit avec précision, évite l'accumulation de sacs et exécute des nils à haut risque, battra une équipe qui joue bien les cartes mais enchérit négligemment, presque à chaque fois.",
    },
    {
      type: 'heading',
      level: 2,
      text: "Comment évaluer votre main avant d'enchérir",
      id: 'hand-evaluation',
    },
    {
      type: 'paragraph',
      text: 'Chaque enchère commence par une évaluation honnête de vos 13 cartes. As de Pique = 1 levée garantie. Roi de Pique = ~0.85 levée. Chicane dans une couleur = +0.5 levée supplémentaire. La règle : enchérissez exactement ce que la main vaut, ni plus ni moins.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Les sacs — la mort lente au Spades',
      id: 'sandbagging',
    },
    {
      type: 'paragraph',
      text: 'Chaque levée prise au-delà de votre enchère est un sac. Dix sacs coûtent 100 points. La technique du "canard" : quand vous avez déjà rempli votre contrat, perdez délibérément des levées que vous pourriez gagner. Principe : enchérissez avec précision, pas de façon conservatrice — les enchères basses créent plus de sacs que les enchères audacieuses.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Enchères nulles — risque maximum, récompense maximum',
      id: 'nil-bids',
    },
    {
      type: 'paragraph',
      text: "Une enchère nulle signifie que vous prévoyez de gagner zéro levée. Succès : +100 points ; échec : -100 points. Quand aller nil : votre main n'a pas de cartes hautes dans aucune couleur — pas d'as, pas de roi.",
    },
    {
      type: 'list',
      items: [
        "N'allez jamais nil avec un as ou un roi en main.",
        'Faites le "canard" (perdez des levées délibérément) quand votre contrat est rempli.',
        'Surveillez le compte de sacs constamment — 7 sacs est déjà une zone dangereuse.',
        'En fin de partie : si les adversaires sont proches de 100, enchérissez haut pour couler leur contrat.',
      ],
    },
    {
      type: 'cta',
      href: '/games/spades',
      text: 'Appliquez ces stratégies — jouez au Spades sur Arcadeum',
      description:
        'Spades à quatre avec comptage des sacs en direct et résumé post-partie.',
    },
  ],
  faq: [
    {
      question: "Quelle est l'enchère totale idéale pour une équipe ?",
      answer:
        'La plupart des joueurs forts visent une enchère combinée de 10-11 levées par main. 12+ crée un risque de sacs ; 8 ou moins est agressif et peut mener à des échecs.',
    },
    {
      question: 'Quand tenter de couler les adversaires ?',
      answer:
        'Quand ils ont une enchère combinée de 9 ou plus et que vous avez des cartes hautes qui peuvent prendre leurs levées. Un "set" vous rapporte environ 60-130 points.',
    },
  ],
};
