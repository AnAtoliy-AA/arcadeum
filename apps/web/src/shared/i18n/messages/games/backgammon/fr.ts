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
        description: 'Règles classiques du backgammon avec captures et sorties',
      },
      long: {
        name: 'Nardes Longs',
        description: 'Règles traditionnelles des nardes longs sans capture',
      },
      hyper: {
        name: 'Hypergammon',
        description: 'Partie tactique et ultra-rapide avec 3 pions chacun',
      },
      tavla: {
        name: 'Tavla',
        description: 'Règles rapides de Tavla traditionnelle',
      },
      nackgammon: {
        name: 'Nackgammon',
        description: 'Variante stratégique avec 2 pions sur la flèche 23',
      },
      gulbara: {
        name: 'Gulbara',
        description:
          'Variante sans capture où les doubles jouent tous les numéros supérieurs',
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
      ruleVariant: 'Mode de Jeu',
      rules: 'Règles du Jeu',
      startWithBots: 'Jouer avec un Bot',
      aiDifficulty: 'Difficulté de l’IA',
      ruleVariants: {
        standard: {
          name: 'Standard',
          description:
            'Backgammon classique à 15 pions, captures à la barre et sortie du plateau.',
        },
        long: {
          name: 'Nardes Longs',
          description:
            'Nardes longs traditionnels : 15 pions en tête, sans aucune capture.',
        },
        hyper: {
          name: 'Hypergammon',
          description:
            'Blitz ultra-rapide et stratégique avec seulement 3 pions par joueur.',
        },
        tavla: {
          name: 'Tavla',
          description:
            'Tavla turque avec rythme accéléré et règles directes de capture.',
        },
        nackgammon: {
          name: 'Nackgammon',
          description:
            'Variante tactique approfondie avec 2 pions positionnés sur la flèche 23.',
        },
        gulbara: {
          name: 'Gulbara',
          description:
            'Variante orientale sans capture où les doubles jouent les paires suivantes.',
        },
      },
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
      barZone: 'Zone du bar',
      bearOffZone: 'Zone de sortie',
      offCount: 'Sortis',
      pipCount: 'Pips',
      movesRemaining: 'coups restants',
      noLegalMoves: 'Aucun coup possible avec ces dés',
      checkerMoved: 'Pion déplacé',
      checkerHit: 'Pion envoyé sur la barre !',
    },
    tutorial: {
      s1: {
        title: 'Lancez et avancez',
        body: 'Lancez deux dés et déplacez vos pions selon les points. Un double permet de jouer le chiffre quatre fois.',
      },
      s2: {
        title: 'Frappez les blots',
        body: 'Un pion isolé est un blot — atterrissez dessus pour l’envoyer à la barre. Les pions sur la barre doivent rentrer avant tout autre mouvement.',
      },
      s3: {
        title: 'Sortez pour gagner',
        body: 'Ramenez vos quinze pions dans votre jan intérieur, puis retirez-les. Le premier à sortir ses quinze pions gagne.',
      },
      s4: {
        title: 'Entre deux lancers',
        body: 'Son, musique, plein écran et le livre complet des Règles se trouvent dans ce panneau.',
      },
    },
    rules: {
      title: 'Règles du Backgammon',
      objectiveTitle: 'Objectif',
      objective:
        "Le but est d'amener vos 15 pions dans votre jan intérieur puis de les sortir du plateau.",
      movementTitle: 'Déplacement et Dés',
      movement:
        'Les joueurs lancent à tour de rôle deux dés et déplacent leurs pions en conséquence.',
      hittingTitle: 'Capture et Entrée',
      hitting:
        'Un pion seul sur une flèche peut être frappé et envoyé sur la barre.',
      bearingOffTitle: 'Sortie des Pions',
      bearingOff:
        'Quand tous les pions sont dans votre jan intérieur, vous pouvez les sortir.',
      modes: {
        standard: {
          objectiveTitle: 'Objectif',
          objective:
            'Amenez vos 15 pions dans votre jan intérieur et sortez-les avant votre adversaire.',
          movementTitle: 'Déplacement et Dés',
          movement:
            'Lancez deux dés et déplacez vos pions according aux valeurs obtenues. Un double (ex. 4-4) donne quatre mouvements au lieu de deux.',
          hittingTitle: 'Capture et Barre',
          hitting:
            "Atterrissez sur une flèche avec un pion isolé adverse pour l'envoyer à la barre. Les pions sur la barre doivent rentrer dans le jan adverse avant tout autre mouvement.",
          bearingOffTitle: 'Sortie des Pions',
          bearingOff:
            'Quand les 15 pions sont dans votre jan intérieur, sortez-les avec le numéro exact ou supérieur. Si aucun pion ne reste plus loin, le dépassement est autorisé.',
        },
        long: {
          objectiveTitle: 'Objectif',
          objective:
            "Conduisez vos 15 pions de la tête à votre jan intérieur et sortez-les. Tous commencent sur une seule flèche — la course est d'endurance.",
          movementTitle: 'Déplacement et Dés',
          movement:
            "Lancez deux dés et déplacez vos pions. Un double donne quatre mouvements. Les flèches occupées par l'adversaire sont complètement bloquées — vous ne pouvez ni y atterrir ni les franchir.",
          hittingTitle: 'Pas de Capture',
          hitting:
            'Les captures ne sont pas autorisées. Les flèches adverses sont toujours bloquées. Vous devez contourner les piles — la position est décisive.',
          bearingOffTitle: 'Sortie des Pions',
          bearingOff:
            "Quand les 15 pions sont dans votre jan intérieur, sortez-les avec le numéro exact ou supérieur. L'interdiction des captures rend l'arrivée au jan le principal défi.",
        },
        hyper: {
          objectiveTitle: 'Objectif',
          objective:
            'Avec seulement 3 pions chacun, sortez-les tous avant votre adversaire. Chaque mouvement compte.',
          movementTitle: 'Déplacement et Dés',
          movement:
            'Lancez deux dés et déplacez vos pions. Un double donne quatre mouvements. Avec si peu de pions, les parties sont rapides et tactiques.',
          hittingTitle: 'Capture et Barre',
          hitting:
            "Les captures sont autorisées. Atterrissez sur un pion isolé adverse pour l'envoyer à la barre. Une seule capture peut décider de la partie.",
          bearingOffTitle: 'Sortie des Pions',
          bearingOff:
            'Quand les 3 pions sont dans votre jan intérieur, sortez-les. Avec si peu de pions, la sortie est rapide et chaque pip compte.',
        },
        tavla: {
          objectiveTitle: 'Objectif',
          objective:
            'Amenez vos 15 pions dans votre jan intérieur et sortez-les. Le Tavla suit les règles classiques avec la tradition turque.',
          movementTitle: 'Déplacement et Dés',
          movement:
            'Lancez deux dés et déplacez vos pions. Un double donne quatre mouvements. Le Tavla privilégie un jeu rapide et agressif.',
          hittingTitle: 'Capture et Barre',
          hitting:
            "Atterrissez sur un pion isolé adverse (blot) pour l'envoyer à la barre. Les pions sur la barre doivent rentrer avant les autres mouvements.",
          bearingOffTitle: 'Sortie des Pions',
          bearingOff:
            'Quand les 15 pions sont dans votre jan intérieur, sortez-les avec le numéro exact ou supérieur.',
        },
        nackgammon: {
          objectiveTitle: 'Objectif',
          objective:
            'Amenez vos 15 pions dans votre jan intérieur et sortez-les. La position de départ modifiée crée des ouvertures stratégiques plus profondes.',
          movementTitle: 'Déplacement et Dés',
          movement:
            'Lancez deux dés et déplacez vos pions. Un double donne quatre mouvements. Les 2 pions sur la flèche 23 réduisent les lancers initial désordonnés.',
          hittingTitle: 'Capture et Barre',
          hitting:
            "Les captures sont autorisées. L'ouverture modifiée crée des décisions complexes entre capturer et construire des ancres.",
          bearingOffTitle: 'Sortie des Pions',
          bearingOff:
            'Quand les 15 pions sont dans votre jan intérieur, sortez-les avec le numéro exact ou supérieur.',
        },
        gulbara: {
          objectiveTitle: 'Objectif',
          objective:
            'Conduisez vos 15 pions de la tête à votre jan intérieur et sortez-les. Pas de capture — stratégie de course pure.',
          movementTitle: 'Déplacement et Dés',
          movement:
            'Lancez deux dés et déplacez vos pions. Les flèches adverses sont bloquées. Avec un double, tous les doubles supérieurs suivants sont joués.',
          hittingTitle: 'Pas de Capture',
          hitting:
            'Les captures ne sont pas autorisées. Les flèches adverses sont infranchissables. La position et le timing sont tout.',
          bearingOffTitle: 'Sortie des Pions',
          bearingOff:
            'Quand les 15 pions sont dans votre jan intérieur, sortez-les avec le numéro exact ou supérieur.',
        },
      },
    },
  },
};
