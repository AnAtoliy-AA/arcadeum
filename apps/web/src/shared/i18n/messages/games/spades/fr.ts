export const frMessages = {
  spades_v1: {
    name: 'Pique',
    description:
      "Jeu de cartes classique en partenariat pour 4 joueurs — annoncez vos plis et laissez l'atout pique parler",
    summary:
      'Annoncez le nombre de plis que vous prendrez, faites équipe avec votre partenaire et laissez les piques gagner !',
    variants: {},
    landing: {
      meta: {
        title: 'Pique — Jeu de Cartes Multijoueur Gratuit | Arcadeum',
        description:
          'Jouez au Pique gratuitement sur Arcadeum. Jeu de cartes classique en partenariat pour 4 joueurs avec annonces, Nil, sacs et adversaires IA.',
        keywords:
          'pique, jeu de cartes, trick-taking, multijoueur, en ligne, gratuit, stratégie, annonces, nil',
      },
      hero: {
        title: 'Pique',
        subtitle:
          'Jeu de cartes classique en partenariat pour 4 joueurs. Annoncez, jouez et laissez les piques parler !',
        ctaQuickplay: 'Jouer vs IA',
        ctaQuickplayError: 'Échec de la création de la partie',
        createRoom: 'Créer un Salon',
        browseRooms: 'Parcourir les Salons',
      },
      highlights: {
        players: {
          title: 'Partenariats 2v2',
          body: 'Faites équipe avec le joueur d\u2019en face',
        },
        bidding: {
          title: 'Annonces & Nil',
          body: 'Annoncez vos plis — ou tentez tout avec une annonce Nil',
        },
        sandbagging: {
          title: 'Pénalité de Sacs',
          body: 'Les plis supplémentaires deviennent des sacs ; chaque 10 sacs coûte 100 points',
        },
      },
      steps: {
        create: {
          title: 'Créer un Salon',
          body: 'Choisissez votre thème et lancez une partie.',
        },
        join: {
          title: 'Inviter des Amis ou des Bots',
          body: 'Jouez avec 3 amis ou complétez avec des bots IA.',
        },
        play: {
          title: 'Annoncez, Jouez & Marquez',
          body: 'Suivez la couleur, remplissez vos annonces et évitez les sacs !',
        },
      },
      themes: {
        title: 'Thèmes Visuels',
        subtitle: 'Jouez sur des tables cyber, rétro et fantastiques.',
      },
      sections: {
        faqTitle: 'Questions Fréquentes',
        faqKicker: 'FAQ',
        rulesTitle: 'Comment Jouer',
        rulesKicker: 'Règles',
        themesKicker: 'Thèmes',
        highlightsTitle: 'Pourquoi Jouer au Pique ?',
        highlightsKicker: 'Points Forts',
        howToPlayTitle: 'Bien Démarrer',
        howToPlayKicker: 'Démarrage Rapide',
        finalCtaTitle: 'Annoncez Malin & Prenez Vos Plis',
        finalCtaSubtitle:
          'Défiez des bots intelligents ou affrontez vos amis en parties en temps réel.',
        backToGames: 'Tous les Jeux',
        heroEyebrow: 'Trick-Taking Classique en Partenariat pour 4 Joueurs',
        heroIntro:
          'Un jeu de stratégie en partenariat : annonces, suivi de couleur et atout pique.',
        heroCategory: 'Jeu de Cartes',
        playersBadge: '4 Joueurs · 2v2',
        durationBadge: '30–45 min',
        difficultyBadge: 'Stratégie',
        chipTrickTaking: 'Trick-Taking',
        chipPartnership: 'Partenariats 2v2',
        chipBidding: 'Annonces & Nil',
        chipAiBots: 'Bots IA',
        tipCreate: 'Choisissez votre thème visuel et configurez les options.',
        tipJoin: 'Jouez avec des amis ou complétez avec des bots IA.',
        tipPlay:
          'Annoncez vos plis, suivez la couleur et laissez les piques parler !',
      },
      faq: {
        rules: {
          question: 'Comment gagner au Pique ?',
          answer:
            'Les équipes marquent des points en réalisant leur annonce combinée (10 points par pli annoncé plus un par pli supplémentaire). La première équipe à atteindre le score cible — généralement 500 — gagne la partie.',
        },
        nil: {
          question: 'Qu\u2019est-ce qu\u2019une annonce Nil ?',
          answer:
            'Une annonce Nil signifie que vous promettez de ne prendre aucun pli. Réussie, votre équipe gagne 100 points bonus ; échouée, elle en perd 100. Votre partenaire joue toujours pour réaliser sa propre annonce.',
        },
        breaking: {
          question: 'Quand peut-on commencer avec un pique ?',
          answer:
            'Les piques ne peuvent pas entamer un pli tant qu\u2019ils n\u2019ont pas été « cassés » — c\u2019est-à-dire tant qu\u2019un joueur sans la couleur demandée n\u2019a pas défaussé un pique. Une fois cassés, n\u2019importe quel pique peut entamer.',
        },
        bags: {
          question: 'Que sont les sacs ?',
          answer:
            'Chaque pli supplémentaire au-delà de l\u2019annonce d\u2019équipe compte comme un sac. Chaque fois qu\u2019une équipe accumule 10 sacs, 100 points sont déduits de son score — annoncer juste est donc essentiel.',
        },
      },
    },
    lobby: {
      variant: 'Thème',
      rules: 'Règles du Jeu',
      startWithBots: 'Commencer avec un Bot',
      aiDifficulty: 'Difficulté IA',
      nilEnabled: 'Autoriser les annonces Nil',
      targetScore: 'Score Cible',
    },
    gameOver: {
      won: 'Vous avez gagné !',
      lost: 'Vous avez perdu.',
      draw: 'Match nul.',
      messages: {
        won: 'Votre partenariat a pris exactement ce qu\u2019il avait promis — bien joué !',
        lost: 'L\u2019autre duo a mieux annoncé cette fois. Une revanche ?',
        draw: 'Les deux équipes ont terminé à égalité. On recommence ?',
      },
    },
    game: {
      yourTurn: 'À vous de jouer',
      waitingForOpponent: 'En attente de l\u2019adversaire...',
      selectBid: 'Placez votre annonce',
      confirmBid: 'Confirmer l\u2019Annonce',
      nilBid: 'Nil',
      bidsLabel: 'Annonces',
      bagsLabel: 'Sacs',
      partnerLabel: 'Partenaire',
      followSuit: 'Vous devez suivre la couleur',
      gameOver: 'Fin de la Partie',
      biddingPhase: 'Phase d\u2019annonces',
      playerTurn: 'Tour de {{player}}',
      handLabel: 'Donne {{n}}',
      trickLabel: 'Pli {{n}} sur 13',
      spadesBroken: 'Piques cassés',
      lastHand: 'Dernière donne : {{even}} pairs / {{odd}} impairs',
      bidNil: 'Nil',
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
        spades: 'Piques',
        hearts: 'Cœurs',
        diamonds: 'Carreaux',
        clubs: 'Trèfles',
      },
    },
    tutorial: {
      s1: {
        title: 'D’abord l’annonce',
        body: 'Avant de jouer, annoncez le nombre de plis que vous pensez gagner. Votre équipe marque 10 × son annonce combinée si elle la tient.',
      },
      s2: {
        title: 'Les piques sont atouts',
        body: 'Suivez la couleur si possible ; sinon, toute carte passe. Les piques ne peuvent sortir avant d’être « cassées » — mais ensuite elles battent tout.',
      },
      s3: {
        title: 'Nil est un pari',
        body: 'Annoncez Nil pour viser zéro pli à ±100 points — défaussez vos piques tôt et esquivez tous les plis.',
      },
      s4: {
        title: 'Les sacs mordent',
        body: 'Chaque pli en trop est un sac : dix sacs coûtent 100 points. La première équipe au score cible gagne.',
      },
    },
    rules: {
      title: 'Règles du Pique',
      objectiveTitle: 'Objectif',
      objective:
        'Réussissez l\u2019annonce de votre partenariat. Les équipes marquent 10 points par pli annoncé plus un point par pli supplémentaire ; la première équipe à atteindre le score cible gagne.',
      setupTitle: 'Mise en Place',
      setup:
        '4 joueurs en partenariats fixes (assis face à face) reçoivent 13 cartes chacun d\u2019un jeu standard de 52 cartes.',
      biddingTitle: 'Annonces',
      bidding:
        'Chaque joueur annonce le nombre de plis qu\u2019il espère remporter, en commençant par le joueur à gauche du donneur. Une annonce de zéro est une annonce Nil valant ±100 points.',
      gameplayTitle: 'Déroulement',
      gameplay:
        'Le premier annonceur entame. Suivez la couleur si possible ; sinon, jouez n\u2019importe quelle carte. Le pique est toujours atout mais ne peut entamer avant d\u2019être cassé. Le pique le plus haut gagne, sinon la carte la plus haute de la couleur demandée.',
      scoringTitle: 'Marque',
      scoring:
        'Annonce réussie : 10 × annonce d\u2019équipe + un par pli supplémentaire. Annonce manquée : −10 × annonce d\u2019équipe. Nil réussi ajoute 100, échoué retire 100. Chaque 10 sacs accumulés coûte 100 points.',
    },
  },
};
