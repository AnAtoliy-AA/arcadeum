export const frMessages = {
  backgammon_v1: {
    name: 'Backgammon',
    description:
      'Jeu de plateau classique à 24 flèches avec lancers de dés, sorties et captures à la barre',
    summary:
      'Lancez les dés, déplacez vos pions, frappez les pions adverses et sortez tous vos pions en premier !',
    variants: {
      standard: {
        name: 'Standard',
        description: 'Règles classiques du backgammon',
      },
    },
    landing: {
      meta: {
        title: 'Backgammon — Jeu de Plateau Multijoueur Gratuit | Arcadeum',
        description:
          'Jouez au Backgammon gratuitement en ligne sur Arcadeum. Plateau classique de 24 flèches avec dés, captures et bots IA.',
        keywords:
          'backgammon, tavla, trictrac, jeu de plateau, multijoueur, en ligne, gratuit, stratégie, dés',
      },
      hero: {
        title: 'Backgammon',
        subtitle:
          'Course classique et stratégie sur un plateau à 24 flèches. Lancez, frappez et gagnez !',
        ctaQuickplay: 'Jouer contre l’IA',
        ctaQuickplayError: 'Échec de la création',
        createRoom: 'Créer une Salle',
        browseRooms: 'Parcourir les Salles',
      },
      highlights: {
        players: {
          title: '2 Joueurs',
          body: 'Duel stratégique en face à face',
        },
        dice: {
          title: 'Dés et Doubles',
          body: 'Obtenez 4 mouvements sur un double et planifiez votre parcours',
        },
        bearOff: {
          title: 'Sortie des Pions',
          body: 'Ramenez tous vos pions dans votre camp et sortez-les pour gagner',
        },
      },
      steps: {
        create: {
          title: 'Créez une Salle',
          body: 'Choisissez votre thème et lancez la partie.',
        },
        join: {
          title: 'Invitez un Ami ou Bot',
          body: 'Jouez entre amis ou affrontez l’IA.',
        },
        play: {
          title: 'Lancez et Courez',
          body: 'Lancez les dés, avancez vos pions et sortez-les du plateau.',
        },
      },
      themes: {
        title: 'Thèmes Visuels',
        subtitle: 'Jouez sur des plateaux aux styles soignés.',
      },
      faq: {
        rules: {
          question: 'Comment gagne-t-on au Backgammon ?',
          answer:
            'Amenez vos 15 pions dans votre jan intérieur et sortez-les tous avant votre adversaire.',
        },
        hitting: {
          question: 'Que se passe-t-il lors d’une capture ?',
          answer:
            'Atterrir sur une flèche avec un pion isolé adverse l’envoie sur la barre.',
        },
        doubles: {
          question: 'Que fait un double aux dés ?',
          answer:
            'Un lancer de double (ex. 4-4) vous permet de jouer 4 fois cette valeur.',
        },
        botAI: {
          question: 'Comment fonctionne l’IA ?',
          answer:
            'L’IA évalue les positions tactiques, la sécurité des pions et la course.',
        },
      },
    },
    lobby: {
      variant: 'Thème',
      rules: 'Règles du Jeu',
      startWithBots: 'Jouer avec un Bot',
      aiDifficulty: 'Difficulté de l’IA',
    },
    game: {
      rollDice: 'Lancer les Dés',
      rolling: 'Lancement...',
      diceRolled: 'Résultat',
      yourTurnToRoll: 'À votre tour de lancer les dés',
      yourTurnToMove: 'À votre tour de déplacer vos pions',
      waitingForOpponentRoll: "En attente du lancer de l'adversaire...",
      waitingForOpponentMove: "En attente du coup de l'adversaire...",
      barCount: 'Barre',
      offCount: 'Sortis',
      pipCount: 'Pips',
      movesRemaining: 'coups restants',
      noLegalMoves: 'Aucun coup possible avec ces dés',
      checkerMoved: 'Pion déplacé',
      checkerHit: 'Pion envoyé sur la barre !',
    },
    rules: {
      title: 'Règles du Backgammon',
      objectiveTitle: 'Objectif',
      objective:
        'Le but est d’amener vos 15 pions dans votre jan intérieur puis de les sortir du plateau.',
      movementTitle: 'Déplacement et Dés',
      movement:
        'Les joueurs lancent à tour de rôle deux dés et déplacent leurs pions en conséquence.',
      hittingTitle: 'Capture et Entrée',
      hitting:
        'Un pion seul sur une flèche peut être frappé et envoyé sur la barre.',
      bearingOffTitle: 'Sortie des Pions',
      bearingOff:
        'Quand tous les pions sont dans votre jan intérieur, vous pouvez les sortir.',
    },
  },
};
