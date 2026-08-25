import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-backgammon',
  locale: 'fr',
  title:
    'Comment jouer au Backgammon en ligne — règles, cube de doublement, stratégie',
  excerpt:
    'Guide complet pour débutants : règles, déplacement des dés, capture de pions, réticulation, cube de doublement et la stratégie qui gagne.',
  publishedAt: '2026-06-16',
  author: 'Équipe Arcadeum',
  tags: ['Backgammon', 'Comment jouer', 'Stratégie', 'Jeu de société', 'Dés'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: "Le Backgammon est l'un des jeux de société les plus anciens connus — une course entre deux joueurs qui déplacent des pions sur un plateau de 24 points triangulaires selon les lancers de dés. L'objectif est simple : déplacer les quinze pions dans votre secteur maison et les retirer avant l'adversaire. Mais sous l'objectif simple se cache un riche mélange de probabilité, gestion des risques et prise de décision tactique.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Le plateau et la position initiale',
      id: 'board',
    },
    {
      type: 'paragraph',
      text: 'Le plateau a 24 triangles étroits appelés points, numérotés 1–24. Les points sont groupés en quatre secteurs de six points : votre secteur maison (1–6), votre secteur extérieur (7–12), le secteur extérieur adverse (13–18) et le secteur maison adverse (19–24). Chaque joueur commence avec 15 pions en miroir : deux sur le point 24, cinq sur le 13, trois sur le 8 et cinq sur le 6. La barre sépare les deux côtés.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Déplacement avec les dés',
      id: 'movement',
    },
    {
      type: 'paragraph',
      text: "À chaque tour, vous lancez deux dés. Vous devez déplacer un pion de la somme des deux dés, ou deux pions chacun de la valeur d'un dé. Par exemple, un 3 et un 5 permettent de déplacer un pion de 8 cases ou deux pions — un de 3 et un de 5. Vous devez utiliser les deux dés si c'est légalement possible. Avec un double (ex. double 4), vous jouez le nombre quatre fois.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Capture et la barre',
      id: 'hitting',
    },
    {
      type: 'paragraph',
      text: 'Un point occupé par deux pions ou plus est "possédé" — l\'adversaire ne peut pas y atterrir. Un seul pion est un blot. Si un pion adverse atterrit sur votre blot, il est capturé et placé sur la barre. Un joueur avec des pions sur la barre doit les réentrer dans le secteur maison adverse avant tout autre mouvement.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Retrait des pions',
      id: 'bearing-off',
    },
    {
      type: 'paragraph',
      text: "Une fois les 15 pions dans votre secteur maison, vous commencez le retrait. Un pion se retire avec le numéro exact du point où il est. S'il n'y a pas de pion sur le point montré par le dé, vous retirez le pion du point le plus haut occupé.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Gammon et backgammon',
      id: 'scoring',
    },
    {
      type: 'paragraph',
      text: "Un jeu simple (1 point) se gagne quand le perdant a retiré au moins un pion. Un gammon (le perdant n'a retiré aucun pion) vaut le double. Un backgammon (le perdant a encore un pion dans la maison du gagnant ou sur la barre) vaut le triple. Le cube amplifie ces enjeux.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Le cube de doublement',
      id: 'doubling',
    },
    {
      type: 'paragraph',
      text: "Le cube est un dé marqué 2, 4, 8, 16, 32, 64. Avant de lancer, si vous croyez avoir l'avantage, vous pouvez offrir un doublement — porter la mise de 1 à 2 points. L'adversaire doit accepter (et posséder le cube à 2) ou refuser (et perdre 1 point). Accepter est correct quand vous avez environ 25% ou plus de chances de gagner.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'Stratégie — les deux modes de jeu',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        "Mode course. Sans contact entre les forces, c'est une course de pip-count. Comptez vos pips — le plus bas gagne. En course, courez ; ne laissez pas de blots inutiles.",
        "Mode contact. Quand les pions interagissent, la stratégie se concentre sur les points, l'ancrage dans la maison adverse et la gestion du risque.",
        "Timing. En avance, minimisez le contact. En arrière, cherchez le contact — plus le jeu est chaotique, plus l'adversaire laissera des blots.",
        "Comptage des pips. Additionnez tous les points que vos pions doivent parcourir. Connaître votre count avant d'accepter un doublement est essentiel.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tactiques et erreurs courantes',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Slotting: placer un pion sur un point clé en espérant le couvrir au tour suivant.',
        'Mouvements à double fin: un seul coup qui améliore votre position et frappe un blot adverse.',
        'Empiler: quatre pions ou plus sur un point gaspille du matériel.',
        'Ignorer la barre: ne pas compter la probabilité de réentrée.',
        "Erreurs de cube: offrir un doublement trop tôt ou trop tard coûte de l'équité.",
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Variantes en ligne',
      id: 'variants',
    },
    {
      type: 'list',
      items: [
        'Match play. Jouer à un nombre fixe de points (ex. 7). La stratégie du cube change.',
        'Speed gammon. Variante avec horloge, ajoutant la pression temporelle.',
        'Acey-deucey. Variante populaire avec double-1 comme tour libre.',
      ],
    },
    {
      type: 'cta',
      href: '/games/backgammon',
      text: 'Jouez au Backgammon en ligne — gratuit, dans votre navigateur',
      description:
        'Ouvrez une salle de Backgammon, partagez le lien avec des amis ou jouez contre des bots IA.',
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
        'Faites des points clés au début (surtout vos points 5 et 7) pour contrôler le plateau.',
        "Comptez vos pips avant d'accepter ou offrir un doublement.",
        'Passez entre mode course et mode contact selon la position.',
        "Évitez l'empilement et gérez le risque de blots.",
      ],
    },
    {
      type: 'paragraph',
      text: 'Le Backgammon récompense les joueurs qui combinent pensée probabiliste et conscience tactique. Les dés ajoutent de la variance, mais le joueur qui prend de meilleures décisions sort gagnant.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Faites des points clés au début',
        text: 'Possédez vos points 5 et 7 au début. Les points possédés bloquent la réentrée adverse.',
        url: '#strategy',
      },
      {
        name: 'Comptez vos pips',
        text: "Avant d'accepter un doublement, additionnez tous les points que vos pions doivent parcourir.",
        url: '#strategy',
      },
      {
        name: 'Passez entre les modes',
        text: 'En avance, minimisez le contact. En arrière, cherchez le contact.',
        url: '#strategy',
      },
      {
        name: 'Gérez le risque de blots',
        text: 'Chaque blot est un coup potentiel. Utilisez les mouvements à double fin.',
        url: '#tactics',
      },
    ],
  },
};
