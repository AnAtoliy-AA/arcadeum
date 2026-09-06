export const frMessages = {
  chess_v1: {
    name: 'Échecs',
    description:
      'Le classique jeu de plateau de stratégie avec des règles complètes incluant le roque, la prise en passant et la promotion',
    summary:
      "Défiez des amis ou des bots dans une partie d'échecs avec les variantes standard et Chess960 et des contrôles de temps optionnels.",
    landing: {
      meta: {
        title: 'Échecs en ligne — Bullet, Blitz, Rapide, Quotidien et Chess960 | Arcadeum',
        description:
          'Jouez aux échecs en ligne avec le moteur Stockfish 19, les contrôles de temps bullet/blitz/rapide/quotidien, 6 variantes, 12 personnalités IA, Puzzle Rush, annulation de coup, importation PGN, tables de finales, appariement automatique et revue de partie — tout gratuit.',
        keywords:
          'échecs en ligne, jeu d\'échecs, échecs multijoueur, chess960, bullet échecs, blitz, rapide, échecs quotidiens, stockfish 19, puzzles d\'échecs, puzzle rush, analyse d\'échecs, tables de finales, syzygy, jouer aux échecs gratuitement, moteur d\'échecs en ligne, IA échecs, variantes d\'échecs, échecs atomiques, crazyhouse, roi de la colline, trois échecs, tournois d\'échecs, clubs d\'échecs',
        howToPlayTitle: 'Comment jouer à {{gameName}}',
      },
      hero: {
        title: 'Échecs — le jeu de stratégie intemporel',
        subtitle:
          'Propulsé par Stockfish 19. Bullet, blitz, rapide, quotidien et Chess960. Jouez contre des amis, 12 personnalités IA ou toute la communauté.',
        createRoom: 'Créer une salle',
        ctaQuickplay: "Jouer contre l'IA",
        ctaQuickplayError: 'Impossible de lancer la partie — réessayez',
        browseRooms: 'Parcourir les salles',
        backToGames: '← Jeux',
      },
      highlights: {
        players: {
          title: '2 joueurs + 12 bots IA',
          body: 'Défiez un ami ou choisissez parmi 12 personnalités IA (rating 400–2800), chacine avec un style de jeu et un répertoire d\'ouvertures unique.',
        },
        variants: {
          title: '6 variantes',
          body: 'Standard, Chess960, Roi de la Colline, Trois Échecs, Crazyhouse et Atomique — chacune avec ses conditions de victoire.',
        },
        clock: {
          title: 'Tout contrôle de temps',
          body: 'Bullet (1+0, 2+1), Blitz (3+0, 5+0, 5+3), Rapide (10+0, 15+10), Classique (30+0) et Quotidien (1–14 jours par coup).',
        },
      },
      steps: {
        create: {
          title: 'Créez une salle',
          body: 'Choisissez une variante, un contrôle de temps et un thème visuel. Publique ou sur invitation uniquement.',
        },
        join: {
          title: 'Invitez un ami ou ajoutez un bot',
          body: 'Partagez le lien, utilisez l\'appariement rapide ou commencez avec un bot pour jouer instantanément.',
        },
        play: {
          title: 'Jouez, analysez et progressez',
          body: 'Analyse Stockfish 19 en temps réel, annulation de coup, importation PGN et revue avec score de précision.',
        },
      },
      faq: {
        chess960: {
          question: 'Qu\'est-ce que Chess960 ?',
          answer:
            'Chess960 (Fischer Random) utilise une position de départ aléatoire avec 960 configurations possibles. Les règles du roque sont adaptées, mais toutes les autres règles des échecs restent les mêmes.',
        },
        clock: {
          question: 'Comment fonctionnent les contrôles de temps ?',
          answer:
            'Chaque joueur a une horloge. Quand c\'est votre tour, votre horloge compte à rebours. Si votre temps est écoulé, vous perdez. Certains contrôles ajoutent du temps après chaque coup. Bullet : 1–2 minutes, blitz : 3–5 minutes, rapide : 10–15 minutes.',
        },
        promotion: {
          question: 'Comment fonctionne la promotion du pion ?',
          answer:
            'Quand un pion atteint l\'extrémité opposée du plateau, vous devez le promouvoir en dame, tour, fou ou cavalier.',
        },
        stockfish: {
          question: 'Qu\'est-ce que Stockfish 19 ?',
          answer:
            'Stockfish 19 est la dernière version du plus fort moteur d\'échecs open source au monde. Il utilise l\'architecture de réseau neural SFNNv16 et alimente toute l\'analyse en temps réel, la revue de parties et la difficulté des bots IA sur Arcadeum.',
        },
        takeback: {
          question: 'Puis-je annuler un coup ?',
          answer:
            'Oui — utilisez le bouton Annuler pour demander une réversion. Votre adversaire doit accepter avant que le coup ne soit annulé. Disponible dans les parties amicales et classées.',
        },
        puzzlerush: {
          question: 'Qu\'est-ce que Puzzle Rush ?',
          answer:
            'Puzzle Rush est un mode de puzzles chronométré. En Survie, vous avez 3 vies et essayez de résoudre un maximum de puzzles. En Mode Temps, vous avez 3 minutes.',
        },
      },
    },
    lobby: {
      variant: 'Variante',
      timeControl: 'Contrôle de temps',
      startWithBots: 'Commencer avec des bots',
      waitingForPlayers: 'En attente des joueurs…',
      minPlayers: 'Minimum 2 joueurs',
      standard: 'Standard',
      chess960: 'Chess960',
      kingOfTheHill: 'Roi de la Colline',
      threeCheck: 'Trois Échecs',
      crazyhouse: 'Crazyhouse',
      atomic: 'Atomique',
      standardDesc: 'Position de départ classique',
      chess960Desc: 'Position de départ aléatoire',
      kingOfTheHillDesc: 'Gagne en atteignant le centre',
      threeCheckDesc: 'Gagne avec 3 échecs',
      crazyhouseDesc: 'Les pièces capturées sont réutilisables',
      atomicDesc: 'Les captures font exploser les pièces',
      noClock: 'Sans horloge',
      unlimitedTime: 'Temps illimité',
      blitz: 'Blitz',
      rapid: 'Rapide',
      classical: 'Classique',
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
      botPersonality: 'Personnalité du Bot',
    },
    profile: {
      notFound: 'Profil non trouvé',
      games: 'Jeux',
      winRate: 'Taux de victoire',
      puzzleRating: 'Classement puzzles',
      puzzlesSolved: 'Puzzles résolus',
      ratings: 'Classements',
      style: 'Style de jeu',
      noGames: 'Pas encore de jeux',
      recentGames: 'Jeux récents',
      challenge: 'Défier',
    },
    clubs: {
      search: 'Rechercher des clubs...',
      noClubs: 'Aucun club trouvé',
      members: 'membres',
    },
    spectator: {
      viewers: 'spectateurs',
      joinGame: 'Rejoindre',
    },
    tutorial: {
      s1: {
        title: 'Matez le roi',
        body: 'Déplacez vos pièces sur l’échiquier 8×8 pour attaquer le roi adverse. Coincez-le sans échappatoire et gagnez par mat.',
      },
      s2: {
        title: 'Déplacer les pièces',
        body: 'Cliquez sur une de vos pièces pour surligner ses cases légales, puis cliquez sur une destination. Roque, prise en passant et promotion sont pris en charge.',
      },
      s3: {
        title: 'Surveillez l’horloge',
        body: 'Votre horloge décompte pendant votre tour — tomber à zéro perd la partie. Son, musique et partage se trouvent dans ce panneau.',
      },
      s4: {
        title: 'De l’aide au besoin',
        body: 'Ouvrez le livre des Règles à tout moment, utilisez les indices quand disponibles et discutez avec votre adversaire pendant la partie.',
      },
    },
    rules: {
      title: 'Règles des Échecs',
      objective: 'Objectif',
      objectiveText:
        "Échec et mat au roi de votre adversaire. Le roi est en échec et mat lorsqu'il est en échec et qu'aucun coup légal ne permet d'échapper.",
      pieces: 'Pièces',
      special: 'Coups Spéciaux',
      castling:
        "Le roi se déplace de deux cases vers une tour, et la tour saute par-dessus le roi. Doit être dégagé, roi non en échec, et aucune pièce n'a bougé.",
      enPassant:
        "Un pion peut capturer un pion adverse qui vient de se déplacer de deux cases, comme s'il ne s'était dépliqué que d'une case.",
      promotion:
        "Un pion atteignant l'extrémité opposée est promu en dame, tour, fou ou cavalier.",
      drawConditions: 'Conditions de Nulle',
      drawStalemate: 'Pat (aucun coup légal, pas en échec)',
      drawFiftyMove:
        'Règle des 50 coups (50 coups sans captures ni coups de pion)',
      drawRepetition: 'Triple répétition',
      drawMaterial: 'Matériel insuffisant',
      gotIt: 'Compris',
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
    analysis: {
      title: 'Analyse de la partie',
      view: "Voir l'analyse",
      back: 'Retour au résultat',
      centipawns: 'cp',
      empty: 'Pas assez de coups pour analyser.',
      summary: {
        inaccuracies: 'Imprécisions',
        mistakes: 'Erreurs',
        blunders: 'Fautes graves',
        turningPoint: 'Point de bascule',
        finalEval: 'Évaluation finale',
      },
      quality: {
        good: 'Bon',
        inaccuracy: 'Imprécision',
        mistake: 'Erreur',
        blunder: 'Faute grave',
      },
    },
    coach: {
      title: 'Conseils d\u2019entraîneur',
      hint: 'Indice',
      move: 'Coup suggéré : {{symbol}} en {{square}}',
      capture: 'Coup suggéré : {{symbol}} en {{square}}, prendre {{target}}',
      castleKing: 'Coup suggéré : petit roque',
      castleQueen: 'Coup suggéré : grand roque',
      promote:
        'Coup suggéré : {{symbol}} en {{square}}, promouvoir en {{promotion}}',
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
      yourTurn: 'À votre tour',
      white: 'Blancs',
      black: 'Noirs',
      toMove: 'à jouer',
      check: 'Échec !',
      checkmate: 'Échec et mat !',
      winner: '{{player}} a gagné',
      draw: 'Nulle',
      moves: '{{count}} coups',
      promotionTitle: 'Promouvoir le pion en :',
      collapse: 'Réduire',
      showAll: 'Tout afficher ({{count}})',
      copied: 'Copié !',
      spectating: "En train d'observer",
      boardLabel: "Plateau d'échecs, {{color}} à jouer",
    },
    puzzles: {
      title: "Problèmes d'échecs",
      subtitle: "Résolvez des problèmes tactiques pour améliorer votre classement",
      loading: 'Chargement du problème...',
      noPuzzles: 'Aucun problème disponible',
      yourTurn: 'Votre tour — trouvez le meilleur coup',
      opponentThinking: "L'adversaire réfléchit...",
      correct: 'Correct !',
      incorrect: 'Incorrect — réessayez',
      nextPuzzle: 'Problème suivant',
      getHint: 'Obtenir un indice',
      themes: 'Thèmes',
      rating: 'Classement',
      streak: '{{count}} d\'affilée',
      daily: 'Problème du jour',
      rated: 'Problèmes classés',
      themed: "Problèmes par thème",
    },
    tournament: {
      title: "Tournois d'échecs",
      join: "Rejoindre",
      leave: "Quitter",
      arena: "Arène",
      swiss: "Suisse",
      live: "EN COURS",
      upcoming: "À VENIR",
      completed: "TERMINÉ",
      players: "Joueurs",
      timeControl: "Contrôle du temps",
      duration: "Durée",
      rounds: "Tours",
      prize: "Prix",
      noTournaments: "Aucun tournoi disponible pour le moment.",
      standings: {
        title: "Classement",
        player: "Joueur",
        points: "Pts",
        score: "Score",
        streak: "Série",
        wins: "V",
        draws: "N",
        losses: "D",
      },
      timer: {
        startsIn: "Commence dans",
        timeRemaining: "Temps restant",
        ended: "Tournoi terminé",
      },
    },
  },
};
