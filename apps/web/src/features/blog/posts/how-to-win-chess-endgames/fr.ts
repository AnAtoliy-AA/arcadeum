import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-chess-endgames',
  locale: 'fr',
  title:
    'Maîtrise de la finale aux échecs — Roi-pion, tours et positions de Lucena',
  excerpt:
    "La finale est là où les parties sont gagnées ou nulles. Maîtrisez l'opposition roi-pion, les positions de Philidor et Lucena, les règles d'activité des tours et la dame contre tour.",
  publishedAt: '2026-09-18',
  author: 'Équipe Arcadeum',
  tags: ['Échecs', 'Finale', 'Stratégie', 'Tactique', 'Avancé'],
  readingTimeMinutes: 12,
  body: [
    {
      type: 'paragraph',
      text: "La plupart des joueurs d'échecs passent leur temps d'étude sur les ouvertures. Les joueurs qui s'améliorent le plus vite le passent sur les finales. La finale est la phase où la connaissance précise convertit un petit avantage en victoire, et où l'imprécision gaspille ce qui avait été gagné en milieu de partie.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Finales roi-pion — opposition et la case clé',
      id: 'king-pawn',
    },
    {
      type: 'paragraph',
      text: 'Roi et pion contre roi est le type de finale le plus courant. Que le camp le plus fort gagne dépend entièrement de l\'activité du roi et de si le pion peut atteindre sa "case clé". Les trois cases directement devant le pion sont ses cases clés. Si le roi le plus fort contrôle une case clé avant que le roi le plus faible puisse l\'arrêter, le pion passe.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Opposition — le concept décisif',
      id: 'opposition',
    },
    {
      type: 'paragraph',
      text: "Deux rois sont en opposition quand ils se font face avec exactement une case entre eux. Le joueur qui n'a PAS le trait a l'opposition. Exemple : Roi blanc en e5, Roi noir en e7, Pion blanc en e4, Blancs à jouer. Les blancs gagnent avec Rd6! prenant l'opposition sur la colonne d, forçant Rd8 ou Rf8, puis Re6 avec l'opposition — le pion passe.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Position de Philidor — la forteresse nulle',
      id: 'philidor',
    },
    {
      type: 'paragraph',
      text: 'La position de Philidor est la technique défensive clé en T+P contre T. La tour défensive occupe la 6e rangée ("rangée Philidor"), coupant le roi attaquant. Quand le pion avance à la 6e rangée, la tour défensive tombe à la 1e rangée pour donner des échecs perpétuels par derrière. Clé : tour commence en e6, pion en e5. Quand les blancs jouent e6, Tour va en e1 — les échecs par derrière sont inarrêtables.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Position de Lucena — technique gagnante',
      id: 'lucena',
    },
    {
      type: 'paragraph',
      text: 'La position de Lucena est la technique gagnante pour le camp le plus fort. Le pion a atteint la 7e rangée, le roi attaquant est devant le pion, et la tour défend par derrière. La technique s\'appelle "construire un pont" : (1) La tour coupe le roi défenseur par rangée. (2) Le roi avance. (3) La tour revient protéger le roi des échecs. (4) Le pion passe.',
    },
    {
      type: 'list',
      items: [
        'Activez votre roi immédiatement quand les pièces majeures disparaissent.',
        'Comptez précisément les courses de pions — un coup de différence change victoire en nulle.',
        'La tour active bat la tour passive. Une tour en file ouverte crée des menaces.',
        'Connaissez Philidor (nulle) et Lucena (victoire) — identifiez quelle position vous est la plus proche.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Pratiquez les finales dans des parties réelles — jouez aux Échecs sur Arcadeum',
      description:
        'Revoyez la phase de finale dans votre analyse post-partie pour voir exactement où la position est devenue gagnée ou nulle.',
    },
  ],
  faq: [
    {
      question:
        'Quelle est la finale la plus importante à étudier en premier ?',
      answer:
        "Roi et pion contre roi : c'est la plus courante et elle enseigne les deux concepts fondamentaux (opposition, cases clés) qui apparaissent dans tous les autres types de finales.",
    },
    {
      question: "Qu'est-ce que la position de Philidor ?",
      answer:
        'Une technique défensive en T+P contre T où la tour défensive tient la 6e rangée coupant le roi attaquant, puis bascule vers des échecs par la 1e rangée quand le pion avance. La nulle est théoriquement forcée avec un jeu correct.',
    },
  ],
};
