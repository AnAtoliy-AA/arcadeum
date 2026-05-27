export const frMessages = {
  cascade_v1: {
    name: 'Cascade',
    description:
      'Assortis par couleur ou numéro, enchaînez les cartes Pioche-Deux et Joker +4 pour submerger le joueur suivant, et videz votre main en premier pour gagner.',
    summary:
      'Un jeu de cartes de défausse de la famille des Huit Américain — quatre thèmes au choix, 2–10 joueurs, pénalités enchaînables.',
    variants: {
      cosmic: {
        name: 'Cosmique',
        description: 'Types d’étoiles, supernovae et trous de ver parmi les couleurs.',
      },
      arcane: {
        name: 'Arcane',
        description: 'Écoles de magie — pyromancie, druidique, et plus.',
      },
      cyberpunk: {
        name: 'Cyberpunk',
        description: 'Factions de hackers néon : Cramoisi, Voltage, Matrice, Cobalt.',
      },
      elemental: {
        name: 'Élémentaire',
        description: 'Feu, Pierre, Feuille et Marée — palette nature épurée.',
      },
    },
    landing: {
      meta: {
        title: 'Cascade — jeu de cartes multijoueur de défausse en ligne',
        description:
          'Jouez à Cascade en ligne — un jeu de cartes de défausse avec chaînes Pioche-Deux / Joker +4 et quatre thèmes visuels. 2–10 joueurs, salons gratuits instantanés, sans installation.',
        keywords:
          'cascade, huit américain, jeu de cartes multijoueur, jeu de cartes en ligne, jeu de défausse, jeu de cartes assorties',
      },
      hero: {
        title: 'Cascade — le jeu de cartes à chaînes, réinventé',
        subtitle:
          'Assortissez par couleur ou numéro. Enchaînez les pénalités. Choisissez parmi quatre thèmes visuels. 2–10 joueurs.',
        createRoom: 'Créer un salon',
        browseRooms: 'Parcourir les salons',
      },
      highlights: {
        players: {
          title: '2–10 joueurs',
          body: 'Chacun pour soi ; les bots remplissent les places vides pour démarrer immédiatement.',
        },
        themes: {
          title: '4 thèmes visuels',
          body: 'Cosmique, Arcane, Cyberpunk, Élémentaire — règles identiques, look différent.',
        },
        stacking: {
          title: 'Pénalités enchaînables',
          body: 'Pioche-Deux sur Pioche-Deux ; Joker +4 sur Joker +4. Noyez le joueur suivant.',
        },
      },
      steps: {
        create: {
          title: 'Créez un salon',
          body: 'Choisissez un thème. Public ou sur invitation.',
        },
        join: {
          title: 'Invitez des amis ou ajoutez un bot',
          body: 'Partagez le lien ou démarrez avec des bots pour jouer immédiatement.',
        },
        play: {
          title: 'Videz votre main',
          body: 'Assortissez par couleur ou numéro, gardez vos jokers, et annoncez Dernière Carte.',
        },
      },
      themes: {
        title: 'Choisissez votre ambiance',
        subtitle: 'Mêmes règles, quatre palettes de couleurs et icônes d’action distinctes.',
      },
      faq: {
        differences: {
          question: 'Quel type de jeu de cartes est Cascade ?',
          answer:
            'Cascade est un jeu de cartes de défausse original dans la famille des Huit Américain. Assortissez par couleur ou numéro, enchaînez les Pioche-Deux et Joker +4 pour submerger le joueur suivant, et videz votre main en premier pour gagner. Les mécaniques de jeu de cartes ne sont pas protégeables ; Cascade a son propre nom, ses palettes et son iconographie.',
        },
        stacking: {
          question: 'Qu’est-ce que l’enchaînement ?',
          answer:
            'Quand quelqu’un joue une Pioche-Deux sur vous, vous pouvez jouer une autre Pioche-Deux pour passer la pénalité +2 supplémentaire au joueur suivant. Idem pour Joker +4 sur Joker +4. Si vous ne pouvez pas enchaîner, vous piochez la pile entière et perdez votre tour.',
        },
        bots: {
          question: 'Les bots sont-ils bons ?',
          answer:
            'Les bots préfèrent les coups assortis en couleur, gardent le Joker +4 pour les tours bloqués, et choisissent la couleur dont ils ont le plus en main lors d’un joker. Décontractés mais crédibles.',
        },
      },
    },
    lobby: {
      stacking: 'Autoriser les pénalités enchaînables',
      startWithBots: 'Démarrer avec des bots',
      addBot: 'Ajouter un bot',
      waitingForPlayers: 'En attente des joueurs…',
      minPlayers: 'Minimum 2 joueurs',
    },
    modes: {
      classic: {
        name: 'Classique',
        description:
          'Règles complètes. Enchaînez les Pioche-Deux et Joker +4 pour submerger le joueur suivant.',
      },
      pure: {
        name: 'Pur',
        description:
          'Pas d’enchaînement. Pioche-Deux et Joker +4 se résolvent immédiatement. Plus simple pour les débutants.',
      },
      speed: {
        name: 'Rapide',
        description:
          'Chronomètre de 15 secondes par tour. Enchaînement actif ; pioche automatique si vous ne jouez pas à temps.',
      },
    },
    themedCards: {
      cosmic: {
        SKIP: 'Éclipse',
        REVERSE: 'Trou de ver',
        DRAW_TWO: 'Pluie de météores',
        WILD: 'Singularité',
        WILD_DRAW_FOUR: 'Supernova',
      },
      arcane: {
        SKIP: 'Bannissement',
        REVERSE: 'Miroir',
        DRAW_TWO: 'Maléfice',
        WILD: 'Polymorphie',
        WILD_DRAW_FOUR: 'Cataclysme',
      },
      cyberpunk: {
        SKIP: 'Firewall',
        REVERSE: 'Loopback',
        DRAW_TWO: 'DDoS',
        WILD: 'Glitch',
        WILD_DRAW_FOUR: 'Rootkit',
      },
      elemental: {
        SKIP: 'Blocage',
        REVERSE: 'Courant',
        DRAW_TWO: 'Séisme',
        WILD: 'Tempête',
        WILD_DRAW_FOUR: 'Ouragan',
      },
    },
    rules: {
      title: 'Règles',
      objective:
        'Soyez le premier à vider votre main. Assortissez le dessus de la défausse par couleur ou numéro, ou jouez un Joker.',
      steps:
        '• À votre tour, jouez une carte assortie ou un Joker.\n• Si vous ne pouvez pas jouer, piochez 1 carte.\n• Le premier joueur à 0 carte gagne.',
      actionCards:
        'Passer saute le joueur suivant. Inverser change le sens (agit comme Passer à 2 joueurs). Pioche-Deux force +2 ; le Joker permet de changer la couleur active ; le Joker +4 force +4 et change la couleur.',
      stacking:
        'Une Pioche-Deux peut être passée avec une autre Pioche-Deux de n’importe quelle couleur. Un Joker +4 peut être passé avec un autre Joker +4. L’enchaînement croisé (P2 sur +4 ou inversement) n’est pas autorisé.',
      headers: {
        objective: 'Objectif',
        howToPlay: 'Comment jouer',
        actionCards: 'Cartes d’action',
        stacking: 'Pénalités enchaînables',
      },
    },
    gameOver: {
      won: 'Vous avez gagné !',
      lost: 'Vous avez perdu.',
      draw: 'Tour terminé.',
      messages: {
        won: 'Vous avez vidé votre main en premier. Prêt pour un autre tour ?',
        lost: 'Quelqu’un d’autre est arrivé à zéro avant. Une revanche ?',
        draw: 'Tour terminé. Encore une ?',
      },
    },
    actions: {
      play: 'Jouer la carte',
      draw: 'Piocher',
      nameColor: 'Choisir la couleur',
      rematch: 'Revanche',
      leave: 'Quitter',
      forfeit: 'Abandonner',
    },
    chat: {
      played: '{{name}} a joué une carte.',
      drew: '{{name}} a pioché une carte.',
      drewStack: '{{name}} a pioché {{n}} de la pile.',
      namedColor: '{{name}} a choisi {{color}}.',
      won: '{{name}} a vidé sa main !',
      joined: '{{name}} a rejoint.',
      left: '{{name}} est parti.',
      forfeit: '{{name}} a abandonné.',
    },
    errors: {
      notYourTurn: 'Ce n’est pas encore votre tour.',
      notPlayable: 'Cette carte ne peut pas être jouée maintenant.',
      colorRequired: 'Choisissez d’abord une couleur.',
      gameOver: 'La partie est terminée.',
    },
    status: {
      turn: 'Tour de {{player}}',
      winner: '{{player}} a gagné',
      pendingDraw: '+{{n}} enchaînés',
      activeColor: 'Couleur active : {{color}}',
    },
  },
};
