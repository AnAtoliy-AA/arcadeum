export const frMessages = {
  cat_dash_v1: {
    name: 'Cat Dash',
    description: 'Course de chats avec dés, capacités uniques et thèmes',
    summary:
      "Faites courir votre chat sur la piste, lancez les dés, utilisez les capacités et soyez le premier à franchir la ligne d'arrivée!",
    variants: {
      neon: { name: 'Cyber Néon', description: 'Paysage cyberpunk lumineux' },
      village: {
        name: 'Village Classique',
        description: 'Courses rurales chaleureuses',
      },
      space: {
        name: 'Chats Spatial',
        description: 'Course cosmique en apesanteur',
      },
      nature: {
        name: 'Nature Sauvage',
        description: 'Sentiers de forêt et prairie',
      },
    },
    landing: {
      meta: {
        title: 'Cat Dash — jeu de course de chats multijoueur',
        description:
          'Jouez à Cat Dash en ligne gratuitement. 2–6 joueurs, chats uniques, dés + capacités.',
        keywords: 'jeu de chats, jeu de dés, course, multijoueur',
      },
      hero: {
        title: 'Cat Dash — faites courir votre chat vers la victoire',
        subtitle:
          "Lancez les dés, esquivez les obstacles et utilisez les capacités pour arriver premier à la ligne d'arrivée.",
        ctaQuickplay: 'Jouer vs IA',
        ctaQuickplayError: 'Impossible de démarrer — réessayez',
        createRoom: 'Créer une salle',
        browseRooms: 'Voir les salles',
      },
      highlights: {
        players: {
          title: '2–6 joueurs',
          body: 'Affrontez vos amis ou complétez avec des bots.',
        },
        cats: {
          title: '6 chats uniques',
          body: 'Chaque chat a des capacités spéciales.',
        },
        themes: {
          title: '4 pistes thématiques',
          body: 'Cyber Néon, Village Classique, Chats Spatial et Nature Sauvage.',
        },
      },
      steps: {
        create: {
          title: 'Créez une salle',
          body: 'Choisissez le thème de la piste.',
        },
        join: {
          title: 'Invitez un ami ou ajoutez un bot',
          body: 'Partagez le lien ou jouez avec des bots.',
        },
        play: {
          title: 'Lancez et courez',
          body: 'Lancez les dés, esquivez les obstacles et franchissez la ligne.',
        },
      },
      themes: {
        title: 'Choisissez une piste',
        subtitle: 'Chaque thème change le style visuel de la piste.',
      },
      rules: {
        title: 'Règles',
        objective:
          "Soyez le premier chat à atteindre l'espace 20 — la ligne d'arrivée.",
        howToPlay: 'À votre tour, cliquez sur "Lancer les Dés".',
        abilities:
          'Chaque chat a 2 capacités uniques. Dépensez les jetons de pouvoir (3 par partie).',
        trackSpaces:
          '🟢 Normal — aucun effet. 🔴 Obstacle — passez votre prochain tour. 🟡 Bonus — relancez.',
      },
      faq: {
        abilities: {
          question: 'Que font les capacités?',
          answer:
            'Chaque chat a deux capacités uniques — une offensive et une défensive.',
        },
        tokens: {
          question: 'Comment fonctionnent les jetons?',
          answer:
            'Vous commencez avec 3 jetons. Chaque utilisation coûte 1 jeton.',
        },
        bots: {
          question: 'Comment jouent les bots?',
          answer: 'Les bots lancent les dés automatiquement à chaque tour.',
        },
      },
    },
    lobby: {
      theme: 'Thème de piste',
      trackType: 'Type de piste',
      columns: 'Largeur du plateau (colonnes)',
      columnsUnit: 'colonnes',
      trackLength: 'Longueur de la piste (cases)',
      spacesUnit: 'cases',
      startWithBots: 'Jouer avec des bots',
      addBot: 'Ajouter un bot',
      waitingForPlayers: 'En attente de joueurs…',
      minPlayers: 'Minimum 2 joueurs',
    },
    tutorial: {
      s1: {
        title: 'Lancez et foncez',
        body: 'À votre tour, appuyez sur Lancer le Dé pour bondir en avant. Le premier chat à atteindre la case 20 gagne la course.',
      },
      s2: {
        title: 'Attention à la piste',
        body: 'Les obstacles rouges sautent votre prochain tour, les bonus jaunes offrent un lancer supplémentaire et les fourches bleues proposent des raccourcis risqués.',
      },
      s3: {
        title: 'Dépensez vos jetons à bon escient',
        body: 'Chaque chat possède deux capacités uniques — dépensez vos trois jetons de pouvoir au moment parfait.',
      },
      s4: {
        title: 'Photo finish',
        body: 'Franchissez la ligne d’arrivée en premier, puis revanchez-vous ou célébrez dans le chat.',
      },
    },
    rules: {
      title: 'Règles de Cat Dash',
      objectiveTitle: 'Objectif',
      objective:
        "Soyez le premier chat à atteindre la ligne d'arrivée (espace 20).",
      howToPlayTitle: 'Comment Jouer',
      howToPlay:
        'À votre tour, cliquez sur "Lancer les Dés". Dé à 6 faces standard.',
      trackSpacesTitle: 'Cases de Piste',
      trackSpaces:
        '🟢 Normal. 🔴 Obstacle — passez tour. 🟡 Bonus — relancez. 🔵 Fourche — choisissez le chemin.',
      abilitiesTitle: 'Capacités',
      abilities:
        'Chaque chat a 2 capacités. Utilisez les jetons de pouvoir (3 par partie).',
      catsTitle: 'Chats',
      cats: '🐱 Chat Néon: Dash Numérique + Bouclier Néon. 🐱 Moustaches: Vie Extra + Pouvoir de Ronronnement. 🐱 Poussière Stellaire: Saut Warp + Bouclier Stellaire. 🐱 Félix: Sentier de la Nature + Charge Sauvage.',
      trackTypesTitle: 'Types de Piste',
      trackTypes:
        'Linéaire — course directe. Circulaire — raccourcis et obstacles. Plusieurs chemins — fourches.',
    },
    gameOver: {
      won: 'Vous avez gagné!',
      lost: 'Vous avez perdu.',
      draw: 'Match nul.',
      you: 'Vous',
      messages: {
        won: 'Votre chat a franchi la ligne en premier! Encore une course?',
        lost: 'Un autre chat a gagné. Revanche?',
        draw: "La course s'est terminée par un match nul.",
      },
    },
    actions: {
      rollDice: 'Lancer les Dés',
      useAbility: 'Utiliser Capacité',
      choosePath: 'Choisir le Chemin',
      rematch: 'Revanche',
      leave: 'Quitter',
      forfeit: 'Abandonner',
    },
    chat: {
      rolled: '{{name}} a lancé {{roll}} et avancé de {{move}} cases.',
      ability: '{{name}} a utilisé une capacité!',
      won: '{{name}} a franchi la ligne!',
      joined: '{{name}} a rejoint la course.',
      left: '{{name}} a quitté la course.',
      forfeit: '{{name}} a abandonné la course.',
    },
    errors: {
      notYourTurn: "Ce n'est pas encore votre tour.",
      gameOver: 'La partie est terminée.',
      gameNotStarted: "La partie n'a pas commencé.",
    },
    status: {
      turn: '{{player}} lance…',
      winner: '{{player}} a gagné la course!',
      draw: 'Match nul',
    },
  },
};
