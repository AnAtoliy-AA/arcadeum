import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-spades',
  locale: 'fr',
  title:
    'Comment jouer aux Piques (Spades) en ligne — Règles, enchères, Nil et stratégie',
  excerpt:
    'Guide complet pour débutants aux Piques : partenariats, donnes, enchères avec Nil, jeu de la carte, pénalités de plis excédentaires et tactiques d’équipe gagnantes.',
  publishedAt: '2026-07-21',
  author: 'Équipe Arcadeum',
  tags: ['Piques', 'Spades', 'Jeu de cartes', 'Comment jouer', 'Stratégie'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'Le jeu de Piques (Spades) est le jeu de levées en équipe le plus populaire au monde : quatre joueurs assis face à face en deux partenariats fixes, avec un jeu standard de 52 cartes distribuées à raison de 13 cartes chacun. Contrairement au Bridge ou au Whist, l’atout n’est jamais soumis aux enchères : les piques sont toujours l’atout souverain. Tout le défi consiste à évaluer précisément combien de levées votre partenariat peut garantir. Ce guide détaille les règles des levées, le contrat spécial Nil, les pénalités de plis et les habitudes gagnantes pour atteindre 500 points sur Arcadeum.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Équipes, donne et objectif',
      id: 'teams',
    },
    {
      type: 'paragraph',
      text: 'Le jeu réunit quatre participants en deux équipes immuables disposées en croix. L’ensemble des 52 cartes est distribué, soit 13 cartes par joueur. La hiérarchie des cartes va de l’As au 2 (As, Roi, Dame, Valet, 10 ... 2), l’As de pique étant la carte maîtresse absolue. Chaque manche se déroule sur 13 levées et la première équipe à atteindre le total de 500 points remporte la partie.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Les enchères : le contrat d’équipe',
      id: 'bidding',
    },
    {
      type: 'paragraph',
      text: 'Après avoir examiné son jeu, chaque joueur annonce son enchère : le nombre exact de levées qu’il s’engage à remporter. Les annonces se font dans le sens horaire sans surenchère. Le minimum est généralement de 1 pli. Les enchères des deux partenaires s’additionnent pour former le contrat commun. Si vous annoncez 3 et votre partenaire 4, votre camp doit remporter au moins 7 levées cumulées.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Nil : l’enchère à zéro pli',
      id: 'nil',
    },
    {
      type: 'paragraph',
      text: 'L’enchère Nil est un coup tactique majeur : le joueur s’engage à ne remporter absolument aucune levée au cours de la manche. Cette annonce n’ajoute aucune levée au contrat du partenaire et fait l’objet d’un décompte séparé : un Nil réussi accorde un bonus immédiat de +100 points, tandis qu’un seul pli capturé inflige une sanction de -100 points. Le partenaire doit alors protéger le Nil tout en réalisant son propre contrat.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Jeu de levées et bris des piques',
      id: 'trick-play',
    },
    {
      type: 'paragraph',
      text: 'Le joueur à gauche du donneur entame le premier pli. Il peut jouer n’importe quelle couleur sauf les piques : les piques ne peuvent être entamés tant qu’ils n’ont pas été « brisés », c’est-à-dire joués par un participant ne possédant plus de cartes dans la couleur demandée.',
    },
    {
      type: 'list',
      items: [
        'Fournir à la couleur demandée est obligatoire dès lors que l’on possède cette couleur.',
        'En cas de chicane (absence de la couleur demandée), n’importe quelle carte peut être défaussée ou coupée avec un pique.',
        'La plus haute carte de la couleur demandée remporte le pli, sauf si un ou plusieurs piques sont joués, auquel cas le plus fort pique l’emporte.',
        'Le vainqueur du pli ramasse les cartes et entame le pli suivant. Les 13 levées sont disputées intégralement.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Décompte des points et pénalités',
      id: 'scoring',
    },
    {
      type: 'list',
      items: [
        'Contrat réalisé : 10 points par levée engagée (un contrat de 7 rapporte 70 points).',
        'Chaque levée excédentaire (surlevée ou bag) rapporte 1 point additionnel.',
        'L’accumulation de dix surlevées (bags) déclenche une pénalité sévère de -100 points.',
        'Contrat chuté : si l’équipe ne totalise pas le nombre de plis requis, elle perd 10 points par levée annoncée.',
        'Succès de Nil : +100 points ; échec de Nil : -100 points pour l’équipe.',
        'La partie s’achève à 500 points ; en cas de dépassement simultané, le score le plus élevé l’emporte.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Stratégie de partenariat : coordination et lecture du jeu',
      id: 'strategy',
    },
    {
      type: 'paragraph',
      text: 'Aux Piques, chaque carte jouée communique une information précieuse. Les principes suivants caractérisent les partenariats solides :',
    },
    {
      type: 'list',
      items: [
        'Évaluez votre jeu avec réalisme : n’annoncez que les levées sûres que vous pouvez réellement défendre.',
        'Comptez les atouts tombés pour identifier le moment où les adversaires n’en possèdent plus.',
        'Entamez dans les couleurs courtes de votre partenaire pour lui permettre de couper avec de petits atouts.',
      ],
    },
    {
      type: 'paragraph',
      text: 'La maîtrise du rythme de jeu est déterminante :',
    },
    {
      type: 'list',
      items: [
        'Conservez des piques élevés pour purger les atouts adverses dès que les coupes deviennent menaçantes.',
        'Gérez les surlevées avec rigueur : concéder volontairement un pli évite souvent la dixième surlevée fatale.',
        'En fin de match, adaptez vos enchères pour franchir en premier le seuil des 500 points.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Erreurs classiques à proscrire :',
    },
    {
      type: 'list',
      items: [
        'Surenchérir par optimisme sans tenir compte de la vulnérabilité des cartes intermédiaires.',
        'Négliger le compteur de surlevées jusqu’à subir le malus de -100 points.',
        'Mettre en péril le Nil de son partenaire en jouant des cartes moyennes difficiles à éviter.',
        'Dépenser ses maîtres trop tôt et affranchir les levées adverses.',
      ],
    },
    {
      type: 'cta',
      href: '/games/spades',
      text: 'Jouer aux Piques en ligne — Gratuit dans votre navigateur',
      description:
        'Rejoignez des parties instantanées contre d’autres passionnés ou affrontez des bots sans inscription.',
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Envie d’un autre classique ? Jouez à la Dame de Pique en ligne',
      description:
        'L’autre grande tradition des jeux de levées : même jeu de cartes, objectif inversé : esquiver les cœurs et la dame de pique.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'En résumé : les clés du succès',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Annoncez avec rigueur pour sécuriser 10 points par pli contracté.',
        'Respectez la couleur demandée et attendez que les piques soient brisés.',
        'Surveillez les surlevées pour échapper au malus de 100 points.',
        'Protégez le Nil de votre équipier en remportant les plis dangereux.',
        'Mémorisez la distribution des atouts pour maîtriser la fin de manche.',
        'Ciblez en priorité les 500 points avec des décisions mesurées.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Aux Piques, l’entente entre partenaires et la discipline priment toujours sur le hasard des cartes. Lancez une partie sur Arcadeum et perfectionnez vos réflexes d’équipe.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Évaluer son jeu avec rigueur',
        text: 'Annoncez uniquement vos plis certains ; chaque pli réussi rapporte 10 points.',
        url: '#bidding',
      },
      {
        name: 'Respecter la couleur et briser les piques',
        text: 'Fournissez à la couleur demandée et n’entamez pas à pique avant leur bris.',
        url: '#trick-play',
      },
      {
        name: 'Contrôler les surlevées (bags)',
        text: 'Évitez d’accumuler 10 surlevées pour ne pas perdre 100 points de pénalité.',
        url: '#scoring',
      },
      {
        name: 'Maîtriser le contrat Nil',
        text: 'Tentez le zéro pli pour remporter 100 points bonus et protégez l’annonce de votre partenaire.',
        url: '#nil',
      },
      {
        name: 'Compter les atouts et purger le jeu',
        text: 'Faites couper votre partenaire et retirez les piques adverses au moment opportun.',
        url: '#strategy',
      },
      {
        name: 'Conclure à 500 points',
        text: 'Calculez le différentiel de score pour valider la victoire avant vos rivaux.',
        url: '#scoring',
      },
    ],
  },
};
