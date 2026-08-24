export const frMessages = {
  game_2048_v1: {
    name: '2048',
    description:
      'Le casse-tête de fusion de tuiles addictif — glissez, fusionnez et visez la tuile 2048',
    summary:
      'Faites glisser les tuiles numérotées, doublez-les encore et encore, et voyez jusqu’où vous irez après 2048.',
    board: {
      loading: 'Distribution des tuiles…',
      controlsHint:
        'Flèches ou WASD sur ordinateur · balayage ou pavé ci-dessous sur mobile',
    },
    hud: {
      score: 'Score',
      best: 'Record',
      time: 'Temps',
      newGame: 'Nouvelle partie',
      movesLabel: 'Coups',
    },
    result: {
      wonTitle: '2048 !',
      wonBody:
        'Vous avez créé la tuile légendaire. Continuer pour un score encore plus élevé ?',
      lostTitle: 'Grille bloquée',
      lostBody:
        'Plus aucun mouvement — toutes les cases sont pleines. À vous de rejouer !',
      playAgain: 'Rejouer',
      keepGoing: 'Continuer',
    },
    rules: {
      objective:
        'Glissez les tuiles sur la grille 4×4 et fusionnez les nombres égaux jusqu’à créer la tuile 2048.',
      gameplay:
        'Chaque coup déplace toutes les tuiles d’un cran ; les voisines identiques fusionnent en leur somme. Une nouvelle tuile 2 ou 4 apparaît après chaque coup.',
      scoring:
        'Chaque fusion ajoute sa nouvelle valeur au score. La partie s’achève quand la grille est bloquée sans mouvement possible.',
    },
    landing: {
      tagline: 'Solo · Sans inscription',
      meta: {
        title: '2048 — Jeu de puzzle à fusion de tuiles gratuit en ligne | Arcadeum',
        description:
          'Jouez gratuitement à 2048 en ligne sur Arcadeum. Glissez et fusionnez des tuiles sur une grille 4×4, battez votre record, progression sauvegardée. Sans téléchargement ni inscription.',
        keywords:
          '2048, jeu de tuiles, jeu de fusion, casse-tête, solo, gratuit, en ligne, jeu navigateur',
      },
      hero: {
        title: '2048',
        subtitle:
          'Le célèbre casse-tête de fusion addictive. Règles simples, profondeur infinie — jusqu’où irez-vous après 2048 ?',
        ctaPlay: 'Jouer maintenant',
      },
      features: {
        solo: {
          title: 'Vraiment solo',
          body: 'Ni comptes ni salles d’attente — une nouvelle grille à un clic.',
        },
        progress: {
          title: 'Progression sauvegardée',
          body: 'Fermez l’onglet en pleine partie et retrouvez votre grille et votre record intacts.',
        },
        stats: {
          title: 'Résultats suivis',
          body: 'Chaque partie terminée alimente automatiquement votre tableau de statistiques Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: '2048 est-il gratuit ?',
          answer:
            'Oui — 2048 sur Arcadeum est entièrement gratuit, sans téléchargement et sans compte pour commencer.',
        },
        q2: {
          question: 'Comment jouer sur mobile ?',
          answer:
            'Balayez simplement la grille — haut, bas, gauche ou droite. Sur ordinateur, utilisez les flèches ou WASD.',
        },
        q3: {
          question: 'Que se passe-t-il après 2048 ?',
          answer:
            'Vous gagnez — et vous pouvez continuer sur la même grille pour un score encore plus élevé.',
        },
      },
      steps: {
        create: {
          title: 'Commencez à glisser',
          body: 'Deux tuiles sont posées. Balayez ou appuyez sur une flèche pour tout déplacer d’un coup.',
        },
        join: {
          title: 'Fusionnez les égales',
          body: 'Quand deux tuiles identiques se rencontrent, elles fusionnent en une tuile de valeur doublée.',
        },
        play: {
          title: 'Visez 2048',
          body: 'Pensez coins et chaînes — la grille se remplit vite et un blocage termine la partie.',
        },
      },
    },
  },
};
