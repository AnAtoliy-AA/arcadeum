import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-chess',
  locale: 'fr',
  title:
    'Comment jouer aux échecs en ligne — règles, ouvertures, tactique et finales',
  excerpt:
    "Un guide complet pour débutants : les règles officielles des échecs, les coups spéciaux, les principes d'ouverture, la tactique de milieu de jeu et l'essentiel des finales — sans oublier les habitudes qui évitent les gaffes.",
  publishedAt: '2026-06-02',
  author: 'Équipe Arcadeum',
  tags: [
    'Chess',
    'How to Play',
    'Strategy',
    'Échecs',
    'Comment jouer',
    'Stratégie',
  ],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: "Les échecs sont le jeu de plateau le plus étudié encore pratiqué à grande échelle : deux joueurs, un damier de 64 cases et un seul objectif — enfermer le roi adverse pour qu'il ne puisse échapper à l'attaque. Les Blancs commencent, les coups alternent un par un, et tout le reste découle de ce rythme très simple. On apprend les règles en un après-midi, mais le jeu récompense toute une vie d'étude. Ce guide couvre les règles officielles, y compris les trois coups spéciaux ; les principes d'ouverture qui conditionnent toute la partie ; les motifs tactiques qui décident de la plupart des parties amateurs ; et les techniques de finale qui transforment un léger avantage en victoire — le tout pensé pour jouer aux échecs en ligne.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Les règles : plateau, pièces et fin de partie',
      id: 'rules',
    },
    {
      type: 'paragraph',
      text: "Le plateau est une grille de 8×8 aux cases claires et sombres alternées. Chaque joueur débute avec 16 pièces : un roi, une dame, deux tours, deux fous, deux cavaliers et huit pions, disposés selon la position de départ standard — chaque dame sur sa propre couleur. Les pions avancent d'une case (deux depuis leur case initiale) et prennent en diagonale ; les cavaliers sautent en L ; les fous glissent le long des diagonales ; les tours le long des rangées et des colonnes ; la dame combine tour et fou ; le roi se déplace d'une case dans n'importe quelle direction.",
    },
    {
      type: 'heading',
      level: 3,
      text: 'Coups spéciaux : roque, prise en passant et promotion',
      id: 'special-moves',
    },
    {
      type: 'list',
      items: [
        "Le roque. Une fois par partie, roi et tour peuvent bouger ensemble : le roi glisse de deux cases vers la tour, qui saute à la case adjacente. Le coup n'est légal que si ni l'une ni l'autre n'a déjà bougé, qu'aucune pièce ne se trouve entre elles et que le roi n'est pas en échec, ne traverse pas une case attaquée et ne s'y arrête pas.",
        "La prise en passant. Si un pion avance de deux cases et atterrit juste à côté d'un pion adverse, celui-ci peut le prendre au tout prochain coup, comme s'il n'avait avancé que d'une seule case.",
        "La promotion. Un pion qui atteint la dernière rangée est promu en n'importe quelle pièce excepté le roi — presque toujours une dame en pratique.",
      ],
    },
    {
      type: 'paragraph',
      text: "On gagne par mat : le roi adverse est attaqué (« en échec ») et n'a aucune parade légale. Mais toute partie ne finit pas par un mat. Un joueur qui n'est pas en échec alors qu'il n'a aucun coup légal est pat — c'est une partie nulle, tout comme le matériel insuffisant, la triple répétition de la position ou cinquante coups consécutifs sans mouvement de pion ni capture.",
    },
    {
      type: 'heading',
      level: 2,
      text: "Principes d'ouverture",
      id: 'opening',
    },
    {
      type: 'paragraph',
      text: 'Pas besoin de mémoriser de longues variantes pour aborder le milieu de jeu avec des chances — quelques principes suffisent pour presque toutes les positions :',
    },
    {
      type: 'list',
      items: [
        'Battez-vous pour le centre. Ouvrez avec un pion central (e4 ou d4 avec les Blancs, répondu par e5 ou d5 avec les Noirs) : les cases centrales offrent à vos pièces leur portée maximale.',
        'Développez les cavaliers avant les fous, et pointez les deux vers le centre plutôt que vers les ailes.',
        'Roquez tôt. Lors des dix premiers coups, la sécurité du roi passe avant presque tout le reste.',
        "Ne jouez pas deux fois la même pièce sans raison — chaque temps perdu offre gratuitement son développement à l'adversaire.",
        'Ne sortez pas la dame trop tôt : elle devient une cible que les pièces adverses en développement attaquent sans rien coûter.',
        "Évitez de cueillir les pions de l'aile tant que vous êtes en retard en développement ; les positions ouvertes punissent la gourmandise.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactique de milieu de jeu',
      id: 'tactics',
    },
    {
      type: 'paragraph',
      text: "Les coups tactiques décident davantage de parties de club que les profonds plans stratégiques, et les motifs gagnants reviennent sans cesse. Apprenez ces six jusqu'à les voir sans chercher :",
    },
    {
      type: 'list',
      items: [
        'La fourchette. Une pièce attaque plusieurs cibles à la fois. La fourchette du cavalier sur roi et dame est le grand classique : impossible de sauver les deux.',
        "Le clouage. La pièce attaquée ne peut pas ou n'ose pas bouger car quelque chose de plus précieux se trouve derrière elle ; un clouage au roi fige totalement la pièce clouée.",
        'La brochette. Le clouage inversé : une pièce précieuse est attaquée et doit bouger, exposant à la capture celle qui est derrière.',
        "L'attaque à la découverte. En bougeant, une pièce démasque l'attaque d'une autre placée derrière elle ; quand la pièce démasquée est une tour ou un fou qui tombe sur une dame non défendue, le matériel s'écroule tout seul.",
        "L'élimination du défenseur. Capturez ou détournez la pièce qui tient la position adverse, et le reste s'effondre.",
        "Le mat de la dernière rangée. Un roi enfermé par ses propres pions peut être maté net par une grosse pièce sur la rangée du fond — créez une case de fuite avant qu'il ne soit trop tard.",
      ],
    },
    {
      type: 'paragraph',
      text: "Après chaque coup adverse, demandez-vous ce qui a changé : quelles lignes se sont ouvertes, quelles pièces sont devenues non défendues, quels échecs et quelles captures deviennent possibles. Avant de jouer votre coup candidat, faites une vérification anti-gaffe : ai-je quelque chose d'en prise, et mon coup laisse-t-il quelque chose d'en prise ?",
    },
    {
      type: 'heading',
      level: 2,
      text: "L'essentiel des finales",
      id: 'endgame',
    },
    {
      type: 'paragraph',
      text: "Quand les dames disparaissent et que l'échiquier se vide, les rôles s'inversent : le roi cesse de se cacher et devient une pièce de combat. Trois compétences transforment un léger avantage en points :",
    },
    {
      type: 'list',
      items: [
        'Activez votre roi. Marchez-le vers le centre ou vers les pions qui comptent ; dans les positions simplifiées, un roi actif vaut environ une pièce.',
        'Poussez les pions passés. Un pion sans pion adverse sur sa route file vers la promotion — presque toujours en dame, ce qui gagne pratiquement la partie.',
        "Maîtrisez l'opposition dans les finales de roi et pion : le camp au trait doit céder du terrain, donc c'est le trait qui décide qui escorte son pion à bon port.",
        'Placez les tours derrière les pions passés — les vôtres filent plus vite, les leurs sont bloqués à distance.',
        "Apprenez les mats élémentaires. Roi et dame, puis roi et tour, materont seuls ; roi accompagné d'un seul fou ou cavalier ne peut forcer la victoire — échangez en conséquence.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Erreurs fréquentes chez les débutants',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Sortir la dame trop tôt, puis perdre du temps à esquiver ses attaquants.',
        "Retarder le roque jusqu'à ce que le roi soit déjà sous le feu.",
        'Ne jouer que des pions, ou promener une seule pièce pendant que six autres attendent chez elles.',
        "Ignorer les menaces adverses — chaque coup mérite la question : qu'est-ce qu'il attaque ?",
        "Jouer en espérant : choisir un coup sans vérifier s'il perd une pièce ou autorise un mat.",
        'Échanger par automatisme au lieu de demander qui profite de chaque échange.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Jouer aux échecs en ligne — gratuit, dans votre navigateur',
      description:
        'Lancez une partie détente en quelques secondes, invitez un ami via un lien ou aiguisez votre jeu contre des bots IA — sans téléchargement ni compte.',
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: 'Envie de plus léger ? Jouez aux dames en ligne',
      description:
        "L'autre grand classique du jeu de stratégie abstrait : plus rapide à apprendre, tout aussi tranchant.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — les habitudes qui gagnent des parties',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Battez-vous pour le centre et développez les cavaliers avant les fous',
        'Roquez tôt ; ne rejouez pas sans cesse la même pièce et ne sortez pas la dame trop tôt',
        "À chaque coup, cherchez fourchettes, clouages, brochettes et attaques à la découverte — puis vérifiez qu'il n'y a rien d'en prise",
        "En finale, activez votre roi et poussez les pions passés jusqu'à la promotion",
        'Connaissez les dénouements : le mat gagne, le pat et la triple répétition font nulle',
      ],
    },
    {
      type: 'paragraph',
      text: "Les échecs récompensent exactement les habitudes ci-dessus : contrôler l'espace, se développer efficacement, calculer les coups forcés et orienter la partie vers des finales que l'on comprend. Rien de tout cela n'exige du talent — seulement de la répétition. Jouez quelques parties sur Arcadeum, revoyez celles que vous perdez, et les progrès se verront en quelques semaines.",
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Battez-vous pour le centre et développez les cavaliers avant les fous',
        text: "Ouvrez avec un pion central (e4 ou d4 avec les Blancs, e5 ou d5 avec les Noirs) et développez les cavaliers vers le centre avant les fous. Les pièces centralisées atteignent plus de cases et soutiennent l'activité précoce.",
        url: '#opening',
      },
      {
        name: 'Roquez tôt ; ne rejouez pas sans cesse la même pièce et ne sortez pas la dame trop tôt',
        text: "La sécurité du roi passe d'abord : roquez dans les dix premiers coups. Chaque coup supplémentaire avec la même pièce gaspille un temps, et une dame sortie trop tôt devient une cible que les pièces adverses attaquent gratuitement.",
        url: '#opening',
      },
      {
        name: "À chaque coup, cherchez fourchettes, clouages, brochettes et attaques à la découverte — puis vérifiez qu'il n'y a rien d'en prise",
        text: 'La tactique décide de la plupart des parties amateurs. Après chaque coup adverse, demandez-vous ce qui a changé, et avant de jouer votre coup candidat vérifiez si quelque chose à vous est en prise ou le deviendrait.',
        url: '#tactics',
      },
      {
        name: "En finale, activez votre roi et poussez les pions passés jusqu'à la promotion",
        text: "Marchez le roi vers l'action, escortez les pions passés à travers le plateau — en promouvant presque toujours en dame — et rappelez-vous que les tours se placent derrière les pions passés.",
        url: '#endgame',
      },
      {
        name: 'Connaissez les dénouements : le mat gagne, le pat et la triple répétition font nulle',
        text: "On gagne en piégeant le roi adverse sans échappatoire légale. Un joueur sans aucun coup légal qui n'est pas en échec est pat — partie nulle, comme le matériel insuffisant, la triple répétition et la règle des cinquante coups.",
        url: '#rules',
      },
    ],
  },
};
