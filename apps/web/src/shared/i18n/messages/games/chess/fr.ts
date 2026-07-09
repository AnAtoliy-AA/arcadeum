export const frMessages = {
  chess_v1: {
    name: 'Échecs',
    description:
      'Le classique jeu de plateau de stratégie avec des règles complètes incluant le roque, la prise en passant et la promotion',
    summary:
      "Défiez des amis ou des bots dans une partie d'échecs avec les variantes standard et Chess960 et des contrôles de temps optionnels.",
    landing: {
      meta: {
        title: 'Échecs — multijoueur avec variantes standard et Chess960',
        description:
          'Jouez aux échecs en multijoueur en ligne. Variantes standard et Chess960, contrôles de temps optionnels, bots dès le premier jour. Gratuit, salles instantanées.',
        keywords:
          'échecs, échecs en ligne, échecs multijeu, chess960, jeux de plateau',
      },
      hero: {
        title: 'Échecs — le jeu de stratégie intemporel',
        subtitle:
          'Règles standard, variante Chess960 et contrôles de temps optionnels. Jouez contre des amis ou des bots.',
        createRoom: 'Créer une salle',
        browseRooms: 'Parcourir les salles',
      },
      highlights: {
        players: {
          title: '2 joueurs',
          body: 'Défiez un ami ou jouez contre un adversaire bot intelligent.',
        },
        variants: {
          title: '2 variantes',
          body: 'Position standard classique et Chess960 avec disposition aléatoire.',
        },
        clock: {
          title: 'Contrôles de temps',
          body: 'Rapide, blitz ou classique. Ou jouez sans horloge.',
        },
      },
      steps: {
        create: {
          title: 'Créez une salle',
          body: 'Choisissez une variante et un contrôle de temps. Publique ou sur invitation uniquement.',
        },
        join: {
          title: 'Invitez un ami ou ajoutez un bot',
          body: 'Partagez le lien ou cliquez sur "Commencer avec des bots" pour jouer instantanément.',
        },
        play: {
          title: 'Jouez et discutez',
          body: "Faites vos coups, regardez l'horloge et discutez pendant la partie.",
        },
      },
      faq: {
        chess960: {
          question: "Qu'est-ce que Chess960 ?",
          answer:
            'Chess960 (Fischer Random) utilise une position de départ aléatoire avec 960 configurations possibles. Les règles du roque sont adaptées, mais toutes les autres règles des échecs restent les mêmes.',
        },
        clock: {
          question: 'Comment fonctionnent les contrôles de temps ?',
          answer:
            "Chaque joueur a une horloge. Quand c'est votre tour, votre horloge compte à rebours. Si votre temps est écoulé, vous perdez. Certains contrôles ajoutent du temps après chaque coup.",
        },
        promotion: {
          question: 'Comment fonctionne la promotion du pion ?',
          answer:
            "Quand un pion atteint l'extrémité opposée du plateau, vous devez le promouvoir en dame, tour, fou ou cavalier.",
        },
      },
    },
    lobby: {
      variant: 'Variante',
      timeControl: 'Contrôle de temps',
      startWithBots: 'Commencer avec des bots',
      waitingForPlayers: 'En attente des joueurs…',
      minPlayers: 'Minimum 2 joueurs',
    },
    rules: {
      title: 'Règles',
      objective:
        "Échec et mat au roi de votre adversaire — mettez-le en échec sans possibilité d'échapper.",
      pieces:
        'Chaque pièce se déplace différemment : roi (1 case), dame (toute direction), tour (lignes droites), fou (diagonales), cavalier (en L), pion (avant, capture en diagonale).',
      special:
        'Coups spéciaux : roque (roi + tour), prise en passant (capture de pion), promotion (pion atteint la dernière rangée).',
    },
    gameOver: {
      won: 'Vous avez gagné !',
      lost: 'Vous avez perdu.',
      draw: 'Nulle.',
      messages: {
        won: 'Échec et mat ! Vous avez vaincu votre adversaire. Prêt pour une autre partie ?',
        lost: 'Échec et mat ! Votre adversaire a gagné. Voulez-vous une revanche ?',
        draw: "La partie s'est terminée par une nulle. Essayez une autre variante ?",
      },
    },
    actions: {
      move: 'Déplacer la pièce',
      resign: 'Abandonner',
      rematch: 'Revanche',
      leave: 'Quitter',
      draw: 'Nulle',
      drawOffered: 'Nulle proposée',
      acceptDraw: 'Accepter la nulle',
      declineDraw: 'Refuser',
      moveList: 'Liste des coups',
      copyPGN: 'Copier PGN',
    },
    chat: {
      move: '{{name}} a joué {{notation}}',
      check: '{{name}} est en échec !',
      checkmate: '{{name}} gagne par échec et mat !',
      castle: '{{name}} a roqué',
      capture: '{{name}} a capturé {{piece}}',
      promotion: '{{name}} a promu en {{piece}}',
      resign: '{{name}} a abandonné',
      draw: "La partie s'est terminée par une nulle",
      joined: '{{name}} a rejoint.',
      left: '{{name}} est parti.',
    },
    errors: {
      notYourTurn: "Ce n'est pas encore votre tour.",
      invalidMove: "Ce n'est pas un coup légal.",
      gameOver: 'La partie est terminée.',
      gameNotStarted: "La partie n'a pas encore commencé.",
    },
    status: {
      turn: 'Tour de {{player}}',
      check: 'Échec !',
      checkmate: 'Échec et mat !',
      winner: '{{player}} a gagné',
      draw: 'Nulle',
    },
  },
};
