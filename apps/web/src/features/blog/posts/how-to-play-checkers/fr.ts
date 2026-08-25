import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-checkers',
  locale: 'fr',
  title: 'Comment jouer aux Dames en ligne — règles, dames, stratégie',
  excerpt:
    "Guide complet pour débutants : règles officielles, prises forcées, sauts multiples, dames et les habitudes qui séparent un joueur occasionnel d'un gagnant régulier.",
  publishedAt: '2026-06-09',
  author: 'Équipe Arcadeum',
  tags: ['Dames', 'Draughts', 'Comment jouer', 'Stratégie', 'Jeu de société'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: "Les Dames — connues mondialement sous le nom de Draughts — sont l'un des jeux de société stratégiques les plus anciens. Deux adversaires placent chacun douze pions sur un plateau 8×8 et se déplacent en diagonale vers l'avant. Les prises sont obligatoires, les sauts multiples sont imposés, et le premier à éliminer toutes les pièces adverses gagne. Les règles s'expliquent en une minute, mais la profondeur stratégique surprend la plupart des débutants. Ce guide couvre les règles officielles, les dames et les habitudes qui font gagner.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Le plateau et la disposition initiale',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: "Les Dames se jouent sur les cases noires d'un plateau standard 8×8. Chaque joueur place douze pions sur les trois rangées les plus proches de son côté, occupant toutes les cases noires. Les cases noires commencent. Les colonnes sont étiquetées a–h et les rangées 1–8. Les pions se déplacent toujours en diagonale sur les cases noires — les cases blanches ne sont jamais utilisées.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Déplacement de base',
      id: 'movement',
    },
    {
      type: 'paragraph',
      text: "Les pièces normales (pions) se déplacent en diagonale vers l'avant d'une case vers une case vide adjacente. Les pions ne se déplacent que dans la direction de l'adversaire — pas de mouvement latéral ni vers l'arrière pour un pion ordinaire. À chaque tour, un joueur déplace exactement une pièce. Si une prise est disponible, elle doit être effectuée — passer une prise n'est pas autorisé selon les règles standards.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Prises forcées et sauts multiples',
      id: 'captures',
    },
    {
      type: 'paragraph',
      text: "Une prise a lieu lorsque votre pièce est en diagonale adjacente à une pièce adverse et que la case au-delà (dans la même direction) est vide. Votre pièce saute par-dessus la pièce adverse, l'éliminant du plateau. Si après l'atterrissage une autre prise est disponible, le saut doit continuer — c'est un saut multiple. Le tour ne se termine que lorsqu'aucune prise supplémentaire n'est disponible.",
    },
    {
      type: 'paragraph',
      text: "La règle de prise forcée est la source la plus courante d'erreurs chez les débutants. Laisser une pièce où elle peut être sautée en saut multiple donne un avantage de material à l'adversaire. Vérifiez toujours si votre coup crée une position où l'adversaire a un saut multiple forcé.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Dames — promotion et pouvoir',
      id: 'kings',
    },
    {
      type: 'paragraph',
      text: "Lorsqu'une pièce atteint la rangée lointaine (la rangée arrière de l'adversaire), elle est promue dame. Une dame peut se déplacer et capturer à la fois vers l'avant et vers l'arrière en diagonale — un avantage considérable. Dans les règles américaines standard, une dame ne peut pas sauter par-dessus une autre dame (les règles de tournoi l'autorisaient — vérifiez avant de jouer).",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Gagner, perdre et matchs nuls',
      id: 'winning',
    },
    {
      type: 'paragraph',
      text: 'Vous gagnez en capturant toutes les pièces adverses ou en bloquant tous leurs coups légaux. Si un joueur a des pièces mais aucun coup légal, il perd. Si aucun camp ne peut forcer la victoire, le jeu est nul. Les plateformes en ligne appliquent généralement des règles de nul comme une limite de coups sans capture.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Stratégie centrale — cinq habitudes qui font gagner',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Contrôlez le centre. Les pièces sur les cases centrales ont plus de mobilité et couvrent plus de plateau.',
        "Conservez la rangée arrière. Vos pièces de l'arrière-dernière ligne sont la seule défense contre les dames adverses.",
        'Échangez en avantage. Si vous avez plus de pions, simplifiez par des échanges. Si vous avez moins, évitez les échanges.',
        "Créez des doubles attaques. Placez une pièce où l'adversaire doit la capturer dans une position où vous pouvez immédiatement recapturer deux de ses pièces.",
        "Surveillez les sauts multiples forcés. Avant chaque coup, vérifiez si l'adversaire a un saut multiple disponible.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Principes de finale',
      id: 'endgame',
    },
    {
      type: 'paragraph',
      text: "La finale en Dames est dominée par l'activité des dames. Les dames contrôlent plus de plateau et peuvent poursuivre les pièces restantes. Lorsque vous avez l'avantage en dames, utilisez-le pour restreindre l'adversaire à un bord ou un coin. Le concept d'opposition apparaît dans la finale de Dames comme aux échecs. Les pièces de bord sont plus faibles car elles ont moins de cases d'échappement.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Erreurs courantes',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Déplacer les pièces de bord en premier. Les pièces de bord ont moins de mobilité, elles sont faciles à attaquer.',
        "Oublier les prises forcées. Oublier qu'une prise est obligatoire mène à des coups illégaux.",
        'Briser la rangée arrière trop tôt. Abandonner le pont défensif ouvre des lignes pour les dames ennemies.',
        "Courir aveuglément vers les dames. La course n'est bonne que si vous calculez qui gagne la position résultante.",
      ],
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: 'Jouez aux Dames en ligne — gratuit, dans votre navigateur',
      description:
        'Ouvrez une salle de Dames, partagez le lien avec des amis ou remplissez avec des bots IA. Plusieurs ensembles de règles disponibles.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'En résumé — quatre habitudes qui font gagner',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Contrôlez le centre du plateau au début.',
        'Conservez la rangée arrière pour bloquer les dames adverses.',
        'Échangez en avantage de material ; évitez les échanges en désavantage.',
        'Vérifiez toujours les sauts multiples forcés avant chaque coup.',
      ],
    },
    {
      type: 'paragraph',
      text: "Les Dames récompensent la patience, la conscience positionnelle et la discipline d'éviter les risques inutiles. Les règles sont assez anciennes pour qu'il n'y ait pas de stratégies cachées — mais les habitudes ci-dessus sont assez robustes pour qu'un joueur qui les applique toutes surpasse constamment un joueur qui n'en applique aucune.",
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Contrôlez le centre au début',
        text: 'Occupez les cases centrales noires. Les pièces centrales ont plus de mobilité et contrôlent plus de plateau.',
        url: '#strategy',
      },
      {
        name: 'Conservez la rangée arrière',
        text: "Laissez vos pièces de la dernière rangée en place jusqu'à ce que l'adversaire ait moins de pièces. La rangée arrière bloque les dames ennemies.",
        url: '#strategy',
      },
      {
        name: 'Échangez en avantage',
        text: "Si vous avez plus de pions, simplifiez la position par des échanges. Chaque échange vous rapproche d'une finale gagnante avec dame.",
        url: '#strategy',
      },
      {
        name: 'Vérifiez les sauts multiples',
        text: "Avant chaque coup, vérifiez si l'adversaire a une prise forcée. Laisser des pions sur des cases de saut multiple fait perdre du material.",
        url: '#captures',
      },
    ],
  },
};
