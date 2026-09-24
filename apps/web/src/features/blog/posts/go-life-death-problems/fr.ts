import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'go-life-death-problems',
  locale: 'fr',
  title: 'Problèmes de Vie et de Mort au Go — 10 Formes Essentielles',
  excerpt:
    'La vie et la mort sont la base du Go. Maîtrisez le groupe-L en coin, les quatre droits et courbés, L+1, tête de bœuf, nakade, seki et la règle du miai avec des exemples concrets.',
  publishedAt: '2026-09-10',
  author: 'Équipe Arcadeum',
  tags: ['Go', 'Problèmes', 'Vie et Mort', 'Tactique', 'Avancé'],
  readingTimeMinutes: 12,
  body: [
    {
      type: 'paragraph',
      text: 'Si vous voulez vous améliorer rapidement au Go, résolvez des problèmes de vie et de mort. La vie et la mort sont le niveau fondamental où les parties sont gagnées et perdues. Reconnaître instantanément les groupes vivants et morts économise du temps de réflexion et vous permet de vous concentrer sur la planification territoriale et stratégique.',
    },
    {
      type: 'heading',
      level: 2,
      text: '1. Groupe-L en coin — la forme morte la plus célèbre',
      id: 'l-group',
    },
    {
      type: 'paragraph',
      text: "Le groupe-L en coin — cinq pierres en forme de L dans le coin du plateau — est MORT sous attaque. Il n'y a qu'un seul espace d'œil réel à l'intérieur. L'attaquant joue sur le \"point critique\" (sacrifice) qui détruit les deux yeux potentiels. Important : le groupe-L VIT s'il est autorisé à capturer la pierre du coin, le transformant en \"quatre courbé\".",
    },
    {
      type: 'heading',
      level: 2,
      text: "2. Nakade — tuer de l'intérieur",
      id: 'nakade',
    },
    {
      type: 'paragraph',
      text: 'Le nakade est un coup dans l\'espace vital qui détruit la capacité d\'un groupe à former deux yeux. Le point clé : le "centre de vie" — la position qui prive le groupe de ses deux yeux. Pour un groupe 3×1 (trois droit) : jouez au point central. Pour la "forme en T" : jouez au centre du T.',
    },
    {
      type: 'heading',
      level: 2,
      text: '3. Seki — vie mutuelle sans yeux',
      id: 'seki',
    },
    {
      type: 'paragraph',
      text: "Le seki est une position où les deux camps vivent sans avoir deux yeux propres. Aucun joueur ne veut jouer à l'intérieur car cela tuerait son propre groupe. Les deux groupes vivent — seki — et aucun joueur ne reçoit de points pour l'espace intérieur.",
    },
    {
      type: 'heading',
      level: 2,
      text: '4. Miai — correspondance mutuelle de coups',
      id: 'miai',
    },
    {
      type: 'list',
      items: [
        "S'il y a deux points, et que jouer l'un ou l'autre garantit la vie, c'est du miai.",
        "Un groupe avec miai vit toujours : si l'adversaire occupe un point, vous occupez l'autre.",
        "Le miai est aussi un concept stratégique : deux coups de valeur égale signifient que vous n'en avez besoin que d'un.",
        "Utilisez le miai pour évaluer les groupes : vous n'avez pas besoin de calculer loin si vous pouvez identifier le miai.",
      ],
    },
    {
      type: 'cta',
      href: '/games/go',
      text: 'Appliquez la connaissance des formes — jouez au Go sur Arcadeum',
      description:
        'Go en différentes tailles de plateau — de 9×9 pour débutants à 19×19.',
    },
  ],
  faq: [
    {
      question: 'Quand vérifier la vie et la mort pendant une partie ?',
      answer:
        "Chaque fois qu'un groupe est attaqué ou que vous attaquez un groupe. Ne jouez pas de coup de soutien dans un groupe irrémédiablement mort — c'est une perte de tempo. Évaluez d'abord si le groupe vit ou non.",
    },
    {
      question: 'Qu\'est-ce que la "règle des deux yeux" ?',
      answer:
        "Un groupe vit inconditionnellement s'il a deux espaces séparés (yeux) ou plus, chacun impossible à occuper par l'adversaire. Un groupe avec un seul œil ou sans œil peut être capturé.",
    },
  ],
};
