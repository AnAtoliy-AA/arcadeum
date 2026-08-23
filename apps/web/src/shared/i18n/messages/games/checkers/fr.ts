export const frMessages = {
  checkers_v1: {
    name: 'Dames',
    description:
      'Dames classiques 8×8 avec captures forcées, sauts multiples et promotion de roi',
    summary:
      "Jeu de plateau stratégique — capturez les pièces adverses et atteignez l'autre côté pour devenir roi !",
    variants: {
      classic: {
        name: 'Classique',
        description: 'Plateau de dames traditionnel',
      },
      neon: { name: 'Néon', description: 'Esthétique néon lumineuse' },
      wood: { name: 'Bois', description: 'Plateau en bois chaleureux' },
      marble: { name: 'Marbre', description: 'Finition marbre élégante' },
      neon_glow: { name: 'Lueur Néon', description: 'Néon violet profond' },
    },
    landing: {
      meta: {
        title: 'Dames — Jeu de Plateau Multijoueur Gratuit | Arcadeum',
        description:
          'Jouez aux dames en ligne gratuitement sur Arcadeum. Plateau classique 8×8 avec captures forcées, sauts multiples, promotion de roi et adversaires IA.',
        keywords:
          'dames, jeu de plateau, multijoueur, en ligne, gratuit, stratégie',
      },
      hero: {
        title: 'Dames',
        subtitle:
          'Stratégie classique sur un plateau 8×8. Capturez, promouvrez et conquérez !',
        ctaQuickplay: 'Jouer vs IA',
        ctaQuickplayError: 'Échec de la création',
        createRoom: 'Créer une Salle',
        browseRooms: 'Voir les Salles',
      },
      highlights: {
        players: {
          title: '2 Joueurs',
          body: 'Bataille stratégique en face à face',
        },
        captures: {
          title: 'Captures Forcées',
          body: 'Si vous pouvez capturer, vous devez le faire !',
        },
        kings: {
          title: 'Promotion de Roi',
          body: "Atteignez l'extrémité opposée pour couronner un roi",
        },
      },
      steps: {
        create: {
          title: 'Créer une Salle',
          body: 'Choisissez un thème et lancez une nouvelle partie.',
        },
        join: {
          title: 'Rejoindre ou Ajouter un Bot',
          body: "Invitez un ami ou jouez contre l'IA.",
        },
        play: {
          title: 'Jouer',
          body: 'Avancez en diagonale, capturez les pièces adverses et gagnez !',
        },
      },
      themes: {
        title: 'Choisissez Votre Thème',
        subtitle: 'Sélectionnez un style visuel qui vous plaît.',
      },
      faq: {
        forcedCaptures: {
          question: 'Que sont les captures forcées ?',
          answer:
            'Si vous avez une capture disponible, vous devez la prendre. Vous ne pouvez pas sauter une capture même si un autre mouvement semble meilleur.',
        },
        multiJump: {
          question: 'Puis-je capturer plusieurs pièces en un tour ?',
          answer:
            'Oui ! Si après une capture votre pièce peut capturer à nouveau, vous devez continuer la chaîne de sauts multiples.',
        },
        kings: {
          question: 'Comment les pièces deviennent-elles des rois ?',
          answer:
            "Quand une pièce atteint l'extrémité opposée du plateau, elle est promue en roi. Les rois peuvent se déplacer et capturer dans toutes les directions diagonales.",
        },
        botAI: {
          question: "À quel point l'IA est-elle bonne ?",
          answer:
            'Le bot utilise un algorithme minimax avec évaluation positionnelle. Il joue à un niveau intermédiaire fort.',
        },
      },
    },
    lobby: {
      variant: 'Thème',
      ruleVariant: 'Règles',
      rules: 'Règles du Jeu',
      startWithBots: 'Commencer avec Bot',
      forcedCaptures: 'Captures Forcées',
      backwardCaptures: "Captures Vers l'Arrière",
      alwaysEnabled: 'toujours activées',
      ruleVariants: {
        american: {
          name: 'Américaines',
          description: 'Plateau 8×8, 12 pièces, pas de rois volants',
        },
        international: {
          name: 'Internationales',
          description:
            "Plateau 10×10, 20 pièces, rois volants, captures vers l'arrière",
        },
        russian: {
          name: 'Russes',
          description: 'Plateau 8×8, 8 pièces, rois volants',
        },
      },
    },
    tutorial: {
      s1: {
        title: 'Course à la promotion',
        body: 'Avancez vos pions en diagonale, une case à la fois. Atteignez le camp opposé pour couronner un roi qui joue dans les deux sens.',
      },
      s2: {
        title: 'Sautez pour capturer',
        body: 'Sautez par-dessus une pièce adverse adjacente pour la capturer. Les captures sont obligatoires et les rafales doivent aller jusqu’au bout.',
      },
      s3: {
        title: 'Gagnez par élimination',
        body: 'Capturez toutes les pièces adverses ou laissez votre rival sans coup légal pour remporter la victoire.',
      },
      s4: {
        title: 'Outils de table',
        body: 'Activez son et musique, passez en plein écran, consultez le livre des Règles ou invitez des amis depuis ce panneau.',
      },
    },
    rules: {
      title: 'Règles des Dames',
      headers: {
        objective: 'Objectif',
        howToPlay: 'Comment Jouer',
        kingPromotion: 'Promotion de Roi',
        backwardCaptures: "Captures Vers l'Arrière",
        forcedCaptures: 'Captures Forcées',
        winConditions: 'Gagner et Perdre',
      },
      objective:
        "Capturez toutes les pièces de votre adversaire ou bloquez-les pour qu'ils n'aient aucun coup légal.",
      steps:
        "Les joueurs alternent pour déplacer une pièce en diagonale vers l'avant.\nLes pièces claires avancent vers le haut ; les foncées vers le bas.\nUne pièce peut se déplacer sur une case diagonale vide adjacente.\nPour capturer, sautez par-dessus une pièce adverse jusqu'au-delà.",
      kingPromotion:
        "Quand une pièce atteint l'extrémité opposée du plateau, elle devient un roi.\nLes rois peuvent se déplacer et capturer dans toutes les directions diagonales.\nDans les règles internationales et russes, les rois peuvent glisser sur plusieurs cases dans une direction (rois volants).",
      backwardCaptures:
        "Dans certains ensembles de règles, les pièces normales (dames) peuvent capturer les pièces adverses derrière elles.\nLes dames se déplacent toujours vers l'avant, mais peuvent capturer dans toutes les directions diagonales quand les captures vers l'arrière sont activées.\nCette option est toujours active dans les règles internationales et peut être configurée dans d'autres variantes.",
      forcedCaptures:
        'Si une capture est disponible, le joueur doit la prendre.\nSi plusieurs captures sont disponibles, le joueur doit en choisir une.\nUne chaîne de sauts multiples doit être entièrement complétée — vous ne pouvez pas vous arrêter si plus de captures sont disponibles.',
      winConditions:
        "Vous gagniez quand :\n• Vous capturez toutes les pièces de l'adversaire\n• L'adversaire n'a aucun coup légal à son tour\n\nVous perdez quand :\n• Toutes vos pièces sont capturées\n• Vous n'avez aucun coup légal à votre tour\n\nLa partie est NULLE quand les deux joueurs n'ont que des rois avec un matériau égal et aucun ne peut forcer la victoire.",
    },
    gameOver: {
      won: 'Victoire !',
      lost: 'Défaite',
      draw: 'Match nul',
      messages: {
        won: 'Félicitations, vous avez gagné !',
        lost: 'Meilleure chance la prochaine fois !',
        draw: "La partie s'est terminée par un match nul.",
      },
    },
    actions: {
      movePiece: 'Déplacer',
      forfeit: 'Abandonner',
    },
    errors: {
      notYourTurn: "Ce n'est pas votre tour",
      invalidMove: 'Mouvement invalide',
      captureRequired: 'La capture est obligatoire',
      noPieceSelected: "Sélectionnez d'abord une pièce",
    },
    status: {
      yourTurn: 'Votre tour',
      waiting: "En attente de l'adversaire...",
    },
  },
};
