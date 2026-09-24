import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'sea-battle-advanced',
  locale: 'fr',
  title:
    'Bataille Navale Avancée — Psychologie de Placement, Chasse par Probabilité et Patterns de Fin',
  excerpt:
    'Schémas de placement de flotte optimaux, stratégies de chasse basées sur la probabilité et comptage de navires en fin de partie donnant un avantage systématique.',
  publishedAt: '2026-09-11',
  author: 'Équipe Arcadeum',
  tags: ['Bataille Navale', 'Stratégie', 'Avancé', 'Probabilité'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: "La Bataille Navale n'est pas du pur hasard. Deux joueurs avec les mêmes conditions de départ mais des stratégies différentes ont des taux de victoire radicalement différents. Le joueur qui place les bateaux de manière optimale et chasse les cibles algorithmiquement gagnera plus de parties — même s'il y a un élément d'aléatoire dans chaque partie individuelle.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Placement optimal de la flotte',
      id: 'placement',
    },
    {
      type: 'list',
      items: [
        'Évitez le centre : la plupart des gens chassent depuis le centre en premier. Placez les grands bateaux près des bords ou des coins.',
        "Utilisez les bords stratégiquement : un bateau sur le bord ne peut être attaqué que d'un côté, ce qui ralentit sa détection.",
        "Dispersez la flotte : des bateaux ensemble sont trouvés ensemble. Séparez-les d'au moins 2 cases.",
        "Changez le placement à chaque partie : si vous placez toujours les bateaux de la même façon, un adversaire expérimenté l'utilisera contre vous.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Carte de densité de probabilité — comment les joueurs intelligents chassent',
      id: 'probability-hunting',
    },
    {
      type: 'list',
      items: [
        "Pattern d'échiquier : la chasse la plus efficace sans information est de tirer en pattern d'échiquier (une case sur deux). Pourquoi : le plus petit bateau fait 2 cases. En tirant une case sur deux, vous garantissez au moins un tir sur chaque bateau.",
        'Adaptez le pattern aux bateaux survivants : si seul le porte-avions (5 cases) survit, il suffit de tirer toutes les 5 cases sur une ligne.',
        'Après un tir réussi : tirez immédiatement sur les cases adjacentes (haut, bas, gauche, droite).',
        "Après deux tirs réussis consécutifs : vous connaissez l'orientation. Tirez le long de l'axe.",
      ],
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Testez vos stratégies — jouez à la Bataille Navale sur Arcadeum',
      description: "Bataille Navale en temps réel contre des amis ou l'IA.",
    },
  ],
  faq: [
    {
      question:
        "Pourquoi le pattern d'échiquier est-il le meilleur pour chasser ?",
      answer:
        "Parce que le plus petit bateau (2 cases) occupera nécessairement au moins une case du pattern d'échiquier. Le pattern garantit au moins un tir sur chaque bateau de 2+ cases en environ 50 tirs.",
    },
    {
      question: "Faut-il toujours tirer à côté d'un tir réussi ?",
      answer:
        "Oui, immédiatement. Passez en mode destruction à tout tir réussi. La phase de destruction est plus efficace — la probabilité d'une case adjacente est de 25-50%, contre 10-20% en chasse aléatoire.",
    },
  ],
};
