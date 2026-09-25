import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-hearts-advanced',
  locale: 'fr',
  title:
    'Stratégie Avancée au Hearts — Lire les Adversaires et Signes de Tir à la Lune',
  excerpt:
    'Comment lire les échanges de cartes, reconnaître les tirs à la lune dès le 3e pli, planifier sur plusieurs mains et compter les cartes en fin de partie.',
  publishedAt: '2026-09-16',
  author: 'Équipe Arcadeum',
  tags: ['Hearts', 'Jeu de Cartes', 'Stratégie', 'Avancé', 'Levées'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: "La plupart des conseils sur Hearts s'arrêtent à \"fais une chicane et évite les cartes hautes\". C'est la bonne base, mais les joueurs qui gagnent régulièrement font quelque chose de plus : ils lisent la table. Ils déduisent les mains invisibles des schémas d'échange et de défausse, planifient sur plusieurs mains simultanément et reconnaissent les signes du tir à la lune avant qu'il ne soit trop tard.",
    },
    {
      type: 'heading',
      level: 2,
      text: "Lire les adversaires d'après leurs échanges",
      id: 'reading-passes',
    },
    {
      type: 'list',
      items: [
        "On vous a passé des cartes hautes — l'échangeur est faible dans cette couleur. Si vous recevez la Dame de Pique, l'échangeur n'a soit pas de piques, soit il planifie un tir à la lune.",
        "On vous a passé des cartes basses — l'échangeur a gardé ses cartes hautes. S'il vous passe 2, 3, 4 de trèfles, il a probablement gardé ses as et rois.",
        "On vous a passé des cartes moyennes (7, 8, 9) — l'échangeur essaie de créer une chicane dans une couleur.",
        "Règle de blocage : gagnez UN cœur. Vous n'avez pas besoin de battre le tireur — vous avez juste besoin d'un cœur pour que les 26 points restent chez lui.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Signes de tir à la lune',
      id: 'moon-tells',
    },
    {
      type: 'list',
      items: [
        'Ils prennent volontairement le premier cœur. Un joueur normal évite les cœurs. Un joueur qui gagne un cœur au 2e ou 3e pli sans paraître peiné tire à la lune.',
        "Ils entament avec une carte haute dans une couleur autre que pique. Entamer avec l'As de Trèfle ou l'As de Cœur signifie qu'ils veulent contrôler la séquence des plis.",
        'Ils ont la Dame de Pique ET prennent des cœurs. Dans un tir à la lune, la Dame est un atout, pas un fardeau.',
      ],
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Appliquez la stratégie avancée au Hearts — jouez sur Arcadeum',
      description:
        'Hearts en temps réel pour quatre joueurs avec règles complètes incluant le tir à la lune.',
    },
  ],
  faq: [
    {
      question: "Comment savoir quand quelqu'un tire à la lune ?",
      answer:
        "Trois signaux : ils prennent volontairement des cœurs dans les 4 premiers plis, ils entament avec des cartes hautes plutôt que basses, et ils ont ou accueillent la Dame de Pique. Si vous en voyez deux sur trois, assumez qu'ils tirent et gagnez un cœur immédiatement.",
    },
    {
      question: 'Vaut-il la peine de garder la Dame de Pique comme arme ?',
      answer:
        "Oui, dans deux situations : quand un joueur tire à la lune et la Dame peut l'arrêter, ou quand un joueur est proche de 100 points et vous pouvez terminer le jeu en lui forçant la Dame.",
    },
  ],
};
