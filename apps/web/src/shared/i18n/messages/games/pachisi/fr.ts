export const frMessages = {
  pachisi_v1: {
    name: 'Pachisi',
    description:
      'Jeu de course classique en croix — faites un six, capturez vos rivaux et ramenez tous vos pions à la maison',
    summary:
      'Lancez le dé, faites la course avec vos pions, capturez vos rivaux et soyez le premier à tout rentrer !',
    variants: {
      standard: {
        name: 'Standard',
        description: 'Règles classiques avec quatre pions chacun',
      },
      quick: {
        name: 'Rapide',
        description: 'Partie plus rapide avec deux pions chacun',
      },
    },
    landing: {
      meta: {
        title:
          'Pachisi — Jeu de Plateau de Course Multijoueur Gratuit | Arcadeum',
        description:
          'Jouez au Pachisi (Ludo) gratuitement en ligne sur Arcadeum. Faites un six pour lancer vos pions, capturez vos rivaux et rentrez chez vous en premier. 2–4 joueurs, bots IA, plateaux thématisés.',
        keywords:
          'pachisi, ludo, jeu de plateau, dés, multijoueur, en ligne, gratuit, famille, course, classique',
      },
      hero: {
        title: 'Pachisi',
        subtitle:
          'Le jeu de poursuite intemporel. Faites un six, lancez vos pions et capturez vos rivaux en route !',
        ctaQuickplay: 'Jouer contre l’IA',
        ctaQuickplayError: 'Échec de la création de la partie',
        createRoom: 'Créer un salon',
        browseRooms: 'Voir les salons',
      },
      highlights: {
        players: {
          title: '2–4 Joueurs',
          body: 'Affrontez vos amis ou des bots IA',
        },
        dice: {
          title: 'Six et Lancers Bonus',
          body: 'Faites un six pour sortir du parc et relancez immédiatement',
        },
        capture: {
          title: 'Capturez vos Rivaux',
          body: 'Atterrissez sur un adversaire pour le renvoyer au départ',
        },
        safe: {
          title: 'Étoiles Sûres',
          body: 'Les cases étoile vous protègent : tracez votre route par le terrain sécurisé.',
        },
      },
      steps: {
        create: {
          title: 'Créez un Salon',
          body: 'Choisissez votre thème et lancez une partie.',
        },
        join: {
          title: 'Invitez vos Amis ou des Bots',
          body: 'Jouez ensemble ou entraînez-vous contre l’IA.',
        },
        play: {
          title: 'Lancez et Rentrez',
          body: 'Sortez vos pions avec un six, évitez les captures et finissez premier !',
        },
      },
      themes: {
        title: 'Thèmes Visuels',
        subtitle: 'Jouez sur des plateaux cyber, rétro et fantastiques.',
      },
      sections: {
        faqTitle: 'Questions Fréquentes',
        faqKicker: 'FAQ',
        rulesKicker: 'Règlement',
        themesKicker: 'Personnalisation Visuelle',
        themesCta: 'Jouer avec ce Thème',
        highlightsTitle: 'Jeu Ancestral, Plateaux Modernes',
        highlightsKicker: 'Points Forts',
        howToPlayTitle: 'Comment Jouer au Pachisi',
        howToPlayKicker: 'Démarrage Rapide',
        howToPlayIntro:
          'Maîtrisez les fondamentaux : lancer, courir, capturer et rentrer.',
        finalCtaTitle: 'Faites un Six et Rentrez',
        finalCtaSubtitle:
          'Affrontez des bots intelligents ou vos amis dans des parties en temps réel.',
        backToGames: 'Tous les Jeux',
        heroEyebrow: 'La Classique Course Croix-et-Cercle',
        heroIntro:
          'Le jeu de poursuite intemporel : dés, captures et dernières lignes droites — facile à apprendre, infiniment rejouable.',
        heroCategory: 'Jeu de Plateau',
        playersBadge: '2–4 Joueurs',
        durationBadge: '10–20 min',
        difficultyBadge: 'Décontracté',
        chipDiceRolls: 'Dés',
        chipCaptures: 'Captures',
        chipSafeStars: 'Étoiles Sûres',
        chipAiBots: 'Bots IA',
        tipCreate: 'Configurez thèmes, modes de jeu et options d’invitation.',
        tipJoin: 'Jouez contre vos amis ou entraînez-vous avec des bots IA.',
        tipPlay:
          'Faites un six pour lancer, capturez en pleine course et rentrez premier !',
      },
      faq: {
        gameOver: {
          won: 'Victoire !',
          lost: 'Défaite',
          draw: 'Match nul',
          messages: {
            won: 'Tous vos pions sont rentrés — première place !',
            lost: 'On vous a devancé. Plus de chance la prochaine fois !',
            draw: 'La partie s’est terminée par un match nul.',
          },
        },
        rules: {
          question: 'Comment gagner au Pachisi ?',
          answer:
            'Sortez tous vos pions du parc, faites le tour du plateau, remontez votre couloir coloré et entrez au centre avant les autres.',
        },
        capture: {
          question: 'Que se passe-t-il lors d’une capture ?',
          answer:
            'Atterrir sur une case occupée par un adversaire renvoie son pion au parc. Les cases étoile et départ sont sûres.',
        },
        sixes: {
          question: 'Que fait un six ?',
          answer:
            'Un six permet de sortir un pion du parc et offre un lancer supplémentaire. Trois six d’affilée annulent le tour.',
        },
        botAI: {
          question: 'Comment fonctionne l’IA ?',
          answer:
            'L’IA évalue sorties, captures, atterrissages sûrs et zones de danger pour vous challenger à chaque niveau.',
        },
      },
    },
    lobby: {
      variant: 'Thème',
      ruleVariant: 'Mode de Jeu',
      rules: 'Règles du Jeu',
      startWithBots: 'Commencer avec un Bot',
      aiDifficulty: 'Difficulté IA',
      ruleVariants: {
        standard: {
          name: 'Standard',
          description:
            'La course classique : quatre pions, captures, étoiles sûres et lancers bonus sur six.',
        },
        quick: {
          name: 'Rapide',
          description:
            'Mêmes règles avec seulement deux pions par joueur : partie rapide et nerveuse.',
        },
      },
    },
    game: {
      rollDice: 'Lancer le Dé',
      rolling: 'Lancer...',
      diceRolled: 'Obtenu',
      yourTurnToRoll: 'À vous de lancer le dé',
      yourTurnToMove: 'À vous de déplacer un pion',
      waitingForOpponentRoll: 'En attente du lancer adverse...',
      waitingForOpponentMove: 'En attente du coup adverse...',
      tokensHome: 'Rentrés',
      captured: 'Capturé !',
      noLegalMoves: 'Aucun coup possible avec ce lancer',
      passTurn: 'Passer le tour',
      tapToken: 'Touchez un pion surligné pour le déplacer',
      moveTokenAria: 'Déplacer le pion {{id}}',
      dieValue: 'Dé : {{value}}',
      extraRoll: 'Un 6 obtenu ! Relancez !',
      lastRoll: 'Dernier lancer : {{value}}',
    },
    tutorial: {
      s1: {
        title: 'Un six et vous sortez',
        body: 'Lancez le dé à votre tour et déplacez un pion. Il faut un 6 pour quitter la cour — et ce 6 offre un lancer supplémentaire.',
      },
      s2: {
        title: 'Renvoyez-les chez eux',
        body: 'Atterrissez sur le pion d’un adversaire pour le renvoyer dans sa cour. Les cases étoiles et de départ sont des refuges sûrs.',
      },
      s3: {
        title: 'Marchez vers la maison',
        body: 'Faites le tour du plateau dans le sens horaire, gravissez votre couloir coloré et rentrez chaque pion au centre pour gagner.',
      },
      s4: {
        title: 'La gourmandise se paie',
        body: 'Trois 6 d’affilée annulent tout votre tour — parfois le coup sûr est le meilleur.',
      },
    },
    rules: {
      title: 'Règles du Pachisi',
      objectiveTitle: 'Objectif',
      objective:
        'Amenez tous vos pions de votre parc, autour du plateau dans le sens horaire, par votre couloir coloré jusqu’au centre. Le premier à tout rentrer gagne.',
      movementTitle: 'Lancers et Déplacements',
      movement:
        'À votre tour, lancez un dé et avancez un pion d’autant de cases. Il faut un 6 pour sortir un pion du parc vers votre case de départ.',
      captureTitle: 'Captures et Cases Sûres',
      capture:
        'Atterrir sur une case occupée par un adversaire renvoie son pion au parc. Les cases étoile et votre case départ sont sûres : personne ne peut vous y capturer.',
      sixesTitle: 'Les Six',
      sixes:
        'Un 6 offre un lancer supplémentaire. Trois 6 d’affilée font perdre le tour entier.',
    },
  },
};
