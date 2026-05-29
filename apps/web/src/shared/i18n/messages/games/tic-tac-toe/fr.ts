export const frMessages = {
  tic_tac_toe_v1: {
    name: 'Morpion',
    description:
      'Aligne 3 en classique, avec variantes thématiques et plateaux 3×3 – 9×9',
    summary:
      'Place ta marque, atteins la longueur gagnante et joue dans six variantes thématiques.',
    variants: {
      classic: {
        name: 'Classique',
        description: 'Grille noire nette sur blanc papier',
      },
      neon: {
        name: 'Néon',
        description: 'Marques violettes et cyan lumineuses',
      },
      paper: {
        name: 'Papier',
        description: 'Tracé manuscrit sur parchemin chaud',
      },
      pixel: { name: 'Pixel', description: 'Verts 8-bit rétro' },
      chalkboard: { name: 'Tableau noir', description: 'Craie sur ardoise' },
      retro: {
        name: 'TV Rétro',
        description: 'Ambre coucher de soleil et rouge chaud',
      },
    },
    landing: {
      meta: {
        title: 'Morpion — multijoueur sur plateaux 3×3, 5×5, 7×7, 9×9',
        description:
          'Joue au morpion multijoueur en ligne. Six variantes thématiques, 2–5 joueurs, mode équipes optionnel, bots dès le premier jour. Gratuit, salons instantanés, sans installation.',
        keywords:
          'morpion, tic tac toe en ligne, morpion multijoueur, gomoku, cinq en ligne, jeux de plateau',
      },
      hero: {
        title: 'Morpion — soigné et multijoueur',
        subtitle:
          'Plateaux thématiques, équipes et bots. Joue seul ou entre amis, du 3×3 au 9×9.',
        createRoom: 'Créer un salon',
        browseRooms: 'Parcourir les salons',
      },
      highlights: {
        players: {
          title: '2–5 joueurs',
          body: 'Chacun pour soi ou en équipes ; les bots remplissent les places vides.',
        },
        sizes: {
          title: '4 tailles de plateau',
          body: 'Manches express en 3×3 jusqu’aux parties épiques de cinq en ligne en 9×9.',
        },
        themes: {
          title: '6 variantes thématiques',
          body: 'Classique, Néon, Papier, Pixel, Tableau noir, TV Rétro.',
        },
      },
      steps: {
        create: {
          title: 'Crée un salon',
          body: 'Choisis une variante et une taille de plateau. Public ou sur invitation.',
        },
        join: {
          title: 'Invite un ami ou ajoute un bot',
          body: 'Partage le lien ou clique sur « Commencer avec des bots » pour jouer aussitôt.',
        },
        play: {
          title: 'Joue et discute',
          body: 'À tour de rôle, atteins la longueur gagnante et discute à chaque mouvement.',
        },
      },
      themes: {
        title: 'Choisis l’ambiance',
        subtitle:
          'Chaque variante restylise le plateau, les marques et la grille.',
      },
      faq: {
        sizes: {
          question: 'Comment la taille du plateau change-t-elle les règles ?',
          answer:
            'La longueur gagnante évolue avec le plateau : 3 en ligne en 3×3, 4 en ligne en 5×5, 5 en ligne en 7×7 comme en 9×9.',
        },
        teams: {
          question: 'Peut-on jouer en équipes ?',
          answer:
            'Oui — active le mode équipes dans le salon. Jusqu’à 4 joueurs répartis en deux équipes ; les coéquipiers partagent une marque et alternent les tours.',
        },
        bots: {
          question: 'Les bots sont-ils bons ?',
          answer:
            'En 3×3 le bot joue un minimax parfait — il ne perd jamais. En 5×5 il bloque les menaces immédiates et privilégie le centre. En 7×7 et 9×9 il joue une heuristique rapide gagner/bloquer avec un espacement aléatoire.',
        },
      },
    },
    lobby: {
      boardSize: 'Taille du plateau',
      maxPlayersShort: 'jusqu’à {{n}}',
      teamMode: 'Mode équipes',
      startWithBots: 'Commencer avec des bots',
      addBot: 'Ajouter un bot',
      waitingForPlayers: 'En attente de joueurs…',
      minPlayers: 'Minimum 2 joueurs',
    },
    rules: {
      title: 'Règles',
      objective:
        'Sois le premier à placer ta marque sur {{winLength}} cases alignées — horizontalement, verticalement ou en diagonale.',
      steps:
        '• À ton tour, clique sur une case vide.\n• Gagne en complétant une ligne.\n• Si le plateau se remplit sans gagnant, la manche est nulle.',
      winLengths:
        'Longueur gagnante par plateau : 3×3 → 3, 5×5 → 4, 7×7 → 5, 9×9 → 5.',
      headers: {
        objective: 'Objectif',
        howToPlay: 'Comment jouer',
        boardSizes: 'Tailles de plateau',
      },
      inARow: '{{n}} d’affilée',
    },
    gameOver: {
      won: 'Tu as gagné !',
      lost: 'Tu as perdu.',
      draw: 'Match nul.',
      you: 'Toi',
      team: 'Équipe {{name}}',
      messages: {
        won: 'Tu as complété la ligne en premier. Prêt pour un autre round ?',
        lost: 'L’autre côté a fermé la ligne. Tu veux une revanche ?',
        draw: 'Personne n’a pu fermer de ligne. Essayer un autre plateau ?',
      },
    },
    actions: {
      place: 'Placer la marque',
      rematch: 'Revanche',
      leave: 'Quitter',
      forfeit: 'Abandonner',
    },
    chat: {
      markPlaced: '{{name}} a placé une marque en ({{row}},{{col}})',
      won: '{{name}} remporte la manche !',
      draw: 'Manche terminée sur un match nul.',
      joined: '{{name}} a rejoint.',
      left: '{{name}} a quitté.',
      forfeit: '{{name}} a abandonné.',
    },
    errors: {
      notYourTurn: 'Pas encore ton tour.',
      cellTaken: 'Cette case est déjà prise.',
      gameOver: 'La partie est terminée.',
      gameNotStarted: 'La partie n’a pas commencé.',
    },
    status: {
      turn: 'Tour de {{player}}',
      winner: '{{player}} a gagné',
      draw: 'Match nul',
    },
    score: {
      x: 'Victoires X',
      o: 'Victoires O',
      draws: 'Matchs nuls',
    },
  },
};
