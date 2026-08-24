export const frMessages = {
  hearts_v1: {
    name: 'Coeurs',
    description:
      'Classique jeu de cartes à 4 joueurs — évitez les cartes de pénalité et tirez vers la lune',
    summary:
      'Passez des cartes stratégiquement, suivez la couleur, débarrassez-vous des Coeurs et de la Reine de Pique, et essayez de tirer vers la lune !',
    variants: {},
    landing: {
      meta: {
        title: 'Coeurs — Jeu de Cartes Multijoueur Gratuit | Arcadeum',
        description:
          'Jouez aux Coeurs gratuitement sur Arcadeum. Classique jeu de cartes à 4 joueurs avec passage, Coeurs, Reine de Pique et adversaires IA.',
        keywords:
          'coeurs, jeu de cartes, trick-taking, multijoueur, en ligne, gratuit, stratégie, reine de pique',
      },
      hero: {
        title: 'Coeurs',
        subtitle:
          'Classique jeu de cartes pour 4 joueurs. Passez, esquivez et tirez vers la lune !',
        ctaQuickplay: 'Jouer vs IA',
        ctaQuickplayError: 'Échec de la création',
        createRoom: 'Créer une Salle',
        browseRooms: 'Parcourir les Salles',
      },
      highlights: {
        players: {
          title: '4 Joueurs',
          body: 'Trick-taking classique à quatre',
        },
        passing: {
          title: 'Passage de Cartes',
          body: 'Passez 3 cartes par main — Gauche, Droite, En face, Pas de passage',
        },
        shooting: {
          title: 'Tir vers la Lune',
          body: 'Prenez les 26 points de pénalité pour que les adversaires les reçoivent',
        },
      },
      steps: {
        create: {
          title: 'Créer une Salle',
          body: 'Choisissez votre thème et lancez une partie.',
        },
        join: {
          title: 'Inviter des Amis ou Bots',
          body: 'Jouez avec 3 amis ou complétez avec des bots IA.',
        },
        play: {
          title: 'Passez, Jouez et Marquez',
          body: 'Passez des cartes, suivez la couleur, évitez Coeurs et la Reine de Pique !',
        },
      },
      themes: {
        title: 'Thèmes Visuels',
        subtitle: 'Jouez sur de beaux plateaux cyber, rétro et fantastique.',
      },
      sections: {
        faqTitle: 'Questions Fréquentes',
        faqKicker: 'FAQ',
        rulesTitle: 'Comment Jouer',
        rulesKicker: 'Règles',
        themesKicker: 'Thèmes',
        highlightsTitle: 'Pourquoi Jouer aux Coeurs ?',
        highlightsKicker: 'Points Forts',
        howToPlayTitle: 'Premiers Pas',
        howToPlayKicker: 'Démarrage Rapide',
        finalCtaTitle: 'Passez, Jouez et Visez la Lune',
        finalCtaSubtitle:
          'Affrontez des bots intelligents ou jouez contre vos amis en parties en temps réel.',
        backToGames: 'Tous les Jeux',
        heroEyebrow: 'Classique de Levées pour 4 Joueurs',
        heroIntro:
          'Un jeu de cartes stratégique : passes, suivi de couleur et évitement des points de pénalité.',
        heroCategory: 'Jeu de Cartes',
        playersBadge: '4 Joueurs',
        durationBadge: '20–30 min',
        difficultyBadge: 'Stratégie',
        chipTrickTaking: 'Levées',
        chipCardPassing: 'Passe de Cartes',
        chipShootTheMoon: 'Viser la Lune',
        chipAiBots: 'Bots IA',
        tipCreate: 'Choisissez votre thème visuel et configurez les options.',
        tipJoin:
          'Jouez avec des amis ou remplissez les sièges avec des bots IA.',
        tipPlay:
          'Passez des cartes, suivez la couleur, évitez les Coeurs et la Reine de Pique !',
      },
      faq: {
        rules: {
          question: 'Comment gagner aux Coeurs ?',
          answer:
            'La partie se termine quand un joueur atteint 100 points. Le joueur avec le score le plus bas gagne. Marquez des points en prenant des Coeurs (1 chacun) et la Reine de Pique (13).',
        },
        shooting: {
          question: "Qu'est-ce que Tirer vers la Lune ?",
          answer:
            'Si vous prenez TOUS les 26 points de pénalité dans une main, vous marquez 0 et chaque adversaire marque 26.',
        },
        passing: {
          question: 'Comment fonctionne le passage de cartes ?',
          answer:
            'Avant chaque main, vous sélectionnez 3 cartes à passer. La direction tourne : Gauche, Droite, En face, Pas de passage.',
        },
        breaking: {
          question: 'Quand peut-on mener avec les Coeurs ?',
          answer:
            "Les Coeurs ne peuvent pas mener jusqu'à ce qu'ils soient \"brisés\" — c'est-à-dire qu'un Coeur a été défaussé lors d'un tour précédent.",
        },
      },
    },
    lobby: {
      variant: 'Thème',
      rules: 'Règles du Jeu',
      startWithBots: 'Commencer avec Bot',
      aiDifficulty: 'Difficulté IA',
      passingEnabled: 'Passage de Cartes',
      targetScore: 'Score Cible',
    },
    passDirection: {
      left: 'Passer à Gauche',
      right: 'Passer à Droite',
      across: 'Passer en Face',
      hold: 'Pas de Passage',
    },
    gameOver: {
      won: 'Vous avez gagné !',
      lost: 'Vous avez perdu.',
      draw: 'Match nul.',
      messages: {
        won: 'Le score le plus bas de la table — bien joué !',
        lost: "Quelqu'un d'autre a fait mieux. Revanche ?",
        draw: 'À égalité de points. Une autre partie ?',
      },
    },
    game: {
      yourTurn: 'Votre tour de jouer',
      waitingForOpponent: "En attente de l'adversaire...",
      selectCardsToPass: 'Sélectionnez 3 cartes à passer',
      passCards: 'Passer les Cartes',
      followSuit: 'Vous devez suivre la couleur',
      gameOver: 'Fin de la Partie',
      passingPhase: 'Phase de passe',
      playerTurn: 'Tour de {{player}}',
      handLabel: 'Main {{n}}',
      trickLabel: 'Pli {{n}}',
      heartsBroken: 'Coeurs brisés',
    },
    card: {
      name: '{{rank}} de {{suit}}',
      ranks: {
        two: 'Deux',
        three: 'Trois',
        four: 'Quatre',
        five: 'Cinq',
        six: 'Six',
        seven: 'Sept',
        eight: 'Huit',
        nine: 'Neuf',
        ten: 'Dix',
        jack: 'Valet',
        queen: 'Dame',
        king: 'Roi',
        ace: 'As',
      },
      suits: {
        spades: 'Pique',
        hearts: 'Coeur',
        diamonds: 'Carreau',
        clubs: 'Trèfle',
      },
    },
    tutorial: {
      s1: {
        title: 'Esquivez les points',
        body: 'Suivez la couleur demandée quand vous le pouvez ; la carte la plus haute de la couleur prend le pli — et chaque carte pénalité dedans.',
      },
      s2: {
        title: 'Craignez la Reine',
        body: 'Les cœurs valent 1 point chacun ; la Reine de Piques en vaut 13. Avant chaque main, passez les cartes dangereuses : gauche, droite, face-à-face, puis rien.',
      },
      s3: {
        title: 'Tirez sur la lune',
        body: 'Vous vous sentez audacieux ? Capturez les 26 points pour annuler votre score et enfler celui des autres de 26.',
      },
      s4: {
        title: 'Comptez ce qui est sorti',
        body: 'Suivez les couleurs jouées, gérez son et musique, et ouvrez le livre des Règles en cas de doute.',
      },
    },
    rules: {
      title: 'Règles des Coeurs',
      objectiveTitle: 'Objectif',
      objective:
        'Évitez de prendre des points de pénalité. Chaque Coeur vaut 1 point et la Reine de Pique vaut 13 points. Quand un joueur atteint 100 points, le joueur avec le score le plus bas gagne.',
      setupTitle: 'Mise en place',
      setup:
        "4 joueurs reçoivent 13 cartes chacun d'un jeu standard de 52 cartes. Le joueur avec le 2 de Trèfle mène le premier tour.",
      passingTitle: 'Passage de Cartes',
      passing:
        'Avant chaque main, les joueurs passent 3 cartes : Gauche, Droite, En face, Pas de passage. La direction tourne chaque main.',
      gameplayTitle: 'Jeu',
      gameplay:
        "Suivez la couleur menée si possible. Si vous n'avez pas de cette couleur, jouez n'importe quelle carte. Les Coeurs ne peuvent pas mener tant qu'ils n'ont pas été brisés.",
      scoringTitle: 'Score',
      scoring:
        'Chaque Coeur = 1 point. Reine de Pique = 13 points. Tir vers la Lune : prenez les 26 points pour marquer 0 pendant que vos adversaires marquent 26.',
    },
  },
};
