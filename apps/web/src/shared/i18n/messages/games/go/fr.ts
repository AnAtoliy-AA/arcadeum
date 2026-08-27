export const frMessages = {
  go_v1: {
    name: 'Go',
    description:
      'Go classique sur plateaux de 9×9, 13×13 et 19×19 avec captures, règle du ko et comptage par aire',
    summary:
      'Encerclez du territoire, capturez des groupes et surpassez votre adversaire au jeu de société le plus élégant jamais inventé !',
    landing: {
      meta: {
        title: 'Go — Jeu de Plateau Multijoueur en Ligne Gratuit | Arcadeum',
        description:
          'Jouez au Go en ligne gratuitement sur Arcadeum. Règles classiques de Baduk/Weiqi sur plateaux de 9×9, 13×13 et 19×19 avec captures, règle du ko, comptage par aire et adversaires IA.',
        keywords:
          'go, baduk, weiqi, igo, jeu de plateau, multijoueur, en ligne, gratuit, stratégie',
      },
      hero: {
        title: 'Go',
        subtitle:
          'Le jeu ancestral consistant à encercler du territoire. Des règles simples, une profondeur infinie.',
        ctaQuickplay: 'Jouer contre l’IA',
        ctaQuickplayError: 'Échec de la création de partie',
        createRoom: 'Créer un salon',
        browseRooms: 'Parcourir les salons',
      },
      highlights: {
        players: { title: '2 Joueurs', body: 'Stratégie pure en face à face' },
        boards: {
          title: 'Trois Plateaux',
          body: 'Apprenez sur 9×9, progressez sur 13×13, maîtrisez le 19×19',
        },
        captures: {
          title: 'Captures & Ko',
          body: 'Encerclez des groupes pour les éliminer — la règle du ko garantit l’équité',
        },
        botAI: {
          title: 'Adversaires IA',
          body: 'Quatre niveaux de difficulté, du hasard amical à la recherche MCTS',
        },
      },
      steps: {
        create: {
          title: 'Créez un Salon',
          body: 'Choisissez la taille du plateau et un thème, puis partagez le lien.',
          tip: 'Astuce : commencez sur 9×9 si vous débutez au Go.',
        },
        join: {
          title: 'Invitez Votre Adversaire',
          body: 'Ou comblez le siège vide avec un bot IA à la difficulté choisie.',
          tip: 'Les noirs jouent toujours en premier.',
        },
        play: {
          title: 'Encerclez & Capturez',
          body: 'Posez des pierres, encerclez du territoire, capturez des groupes — deux passes terminent la partie et le comptage par aire désigne le vainqueur.',
          tip: 'Le komi de 7,5 points compense les blancs qui jouent en second.',
        },
      },
      themes: {
        title: 'Jouez à Votre Façon',
        subtitle:
          'Tous les thèmes partagés d’Arcadeum sont disponibles — le plateau s’adapte à votre style.',
      },
      sections: {
        faqTitle: 'Questions Fréquentes',
        faqKicker: 'FAQ',
        rulesTitle: 'Règles Officielles du Go',
        rulesKicker: 'Livret de Règles',
        themesKicker: 'Personnalisation Visuelle',
        highlightsTitle: 'Règles Simples, Profondeur Infinie',
        highlightsKicker: 'Points Clés',
        howToPlayTitle: 'Comment Jouer au Go',
        howToPlayKicker: 'Démarrage Rapide',
        howToPlayIntro:
          'Apprenez les fondamentaux du territoire, des captures et du comptage.',
        relatedTitle: 'Plus de Jeux de Plateau',
        relatedKicker: 'Découvrir',
        finalCtaTitle: 'Encerclez Plus, Gagnez Plus',
        finalCtaSubtitle:
          'Affrontez des bots intelligents ou jouez contre vos amis en parties en temps réel.',
        backToGames: 'Tous les Jeux',
        heroEyebrow: 'L’Ancien Jeu du Territoire',
        heroIntro:
          'Posez des pierres, entourez du territoire et capturez des groupes sur le plateau stratégique le plus élégant qui soit.',
        heroCategory: 'Jeu de Plateau',
        playersBadge: '2 Joueurs',
        durationBadge: '10–40 min',
        difficultyBadge: 'Stratégie Profonde',
        chipTerritory: 'Captures',
        chipKoRule: 'Règle du Ko',
        chipAreaScoring: 'Comptage par Aire',
        chipAiBots: 'Bots IA',
      },
      faq: {
        whatIsGo: {
          question: 'Qu’est-ce que le Go ?',
          answer:
            'Le Go (aussi appelé Baduk ou Weiqi) est un jeu de plateau millénaire où deux joueurs posent des pierres noires et blanches pour encercler plus de territoire que l’adversaire. Ses règles s’apprennent en quelques minutes, mais sa stratégie dépasse celle des échecs.',
        },
        scoring: {
          question: 'Comment le gagnant est-il déterminé ?',
          answer:
            'Arcadeum utilise le comptage par aire chinois : votre score correspond à vos pierres sur le plateau plus les points vides entièrement entourés par vos pierres. Les blancs reçoivent 7,5 points de komi pour avoir joué en second — les égalités sont impossibles.',
        },
        koRule: {
          question: 'Qu’est-ce que la règle du ko ?',
          answer:
            'Il est interdit de recapturer immédiatement d’une manière qui recréerait la position précédente. Après une capture de ko, vous devez jouer ailleurs — le point interdit est marqué sur le plateau.',
        },
        boardSize: {
          question: 'Quelle taille de plateau choisir ?',
          answer:
            'Les parties en 9×9 durent environ 10 minutes, parfaites pour apprendre. Le 13×13 est un compromis, tandis que le 19×19 offre l’expérience classique complète utilisée par les professionnels.',
        },
      },
    },
    lobby: {
      boardSize: 'Taille du plateau',
      boardSizeHint: '9×9 ≈ 10 min · 13×13 ≈ 20 min · 19×19 ≈ 40+ min',
      startWithBots: 'Commencer avec des bots',
    },
    status: {
      yourTurn: 'À vous de jouer',
      playerTurn: 'Tour de {{name}}',
      waiting: 'En attente…',
      gameOver: 'Partie terminée',
    },
    game: {
      pass: 'Passer',
    },
    board: {
      ariaLabel: 'Plateau de Go ({{size}}×{{size}})',
    },
    gameOver: {
      won: 'Victoire !',
      lost: 'Défaite',
      draw: 'Match nul',
      messages: {
        won: 'Victoire ! Vous avez encerclé plus de territoire. Prêt pour une revanche ?',
        lost: 'Défaite — votre adversaire a contrôlé plus d’aire. Rejouer ?',
        draw: 'Match nul — plateau parfaitement équilibré. Rejouer ?',
      },
    },
    tutorial: {
      s1: {
        title: 'Entourez du territoire',
        body: 'Placez des pierres pour clôturer des intersections vides. Quand les deux joueurs passent, la plus grande aire gagne — Blanc démarre avec le komi.',
      },
      s2: {
        title: 'Coupez les libertés',
        body: 'Un groupe sans intersection vide adjacente (liberté) est capturé et retiré. Encerclez les pierres ennemies pour leur retirer leur dernière liberté.',
      },
      s3: {
        title: 'Attention au ko',
        body: 'Il est interdit de reprendre immédiatement en recréant la position précédente — jouez ailleurs d’abord. Deux passes consécutives terminent la partie.',
      },
      s4: {
        title: 'Les outils du métier',
        body: 'Son, musique, plein écran et le livre des Règles vous attendent ici pendant que vous ourdissez votre prochain coup.',
      },
    },
    rules: {
      title: 'Règles du Go',
      objectiveTitle: 'Objectif',
      objective:
        'Contrôlez plus de territoire que votre adversaire en entourant des points vides et en capturant ses groupes.',
      captureTitle: 'Captures',
      capture:
        'Un groupe sans point vide adjacent (liberté) est capturé et retiré du plateau.',
      koTitle: 'Règle du Ko',
      ko: 'Recapturer immédiatement en recréant la position précédente est interdit — jouez d’abord ailleurs.',
      passTitle: 'Passes',
      pass: 'Deux passes consécutives terminent la partie. Passez quand aucun coup utile ne reste.',
      scoringTitle: 'Comptage',
      scoring:
        'Comptage par aire chinois : pierres + territoire entouré ; les blancs débutent avec 7,5 points de komi.',
    },
  },
};
