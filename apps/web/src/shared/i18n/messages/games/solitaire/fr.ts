export const frMessages = {
  solitaire_v1: {
    name: 'Solitaire',
    description:
      'Le solitaire Klondike classique : construisez les quatre fondations de l’as au roi',
    summary:
      'Le casse-tête de cartes intemporel : retournez les cartes, alternez les couleurs dans les colonnes et empilez chaque couleur de l’as au roi.',
    board: {
      draw: 'Tirer une carte',
      recycle: 'Recycler la défausse',
      foundation: 'Fondation',
      pile: 'Colonne',
      selectedHint: 'Carte sélectionnée — choisissez une destination',
      loading: 'Mélange…',
    },
    hud: {
      score: 'Score',
      moves: 'Coups',
      time: 'Temps',
      newGame: 'Nouvelle partie',
    },
    result: {
      wonTitle: 'Gagné !',
      wonBody: 'Les quatre fondations sont complètes. Partie brillante !',
      lostTitle: 'Plus aucun coup',
      lostBody: 'La position est bloquée — mélangez et réessayez !',
      playAgain: 'Rejouer',
    },
    rules: {
      objective:
        'Déplacez les 52 cartes vers les quatre fondations en construisant chaque couleur par ordre croissant, de l’as au roi.',
      gameplay:
        'Les cartes sont distribuées en sept colonnes. Retournez les cartes accessibles, ordonnez les colonnes en couleurs alternées décroissantes et piochez quand vous êtes bloqué.',
      scoring:
        'Chaque mouvement vers une fondation vaut 10 points, vers une colonne 5, et chaque carte retournée ajoute encore 5 points.',
    },
    landing: {
      tagline: 'Solo · Sans inscription',
      meta: {
        title: 'Solitaire — Jeu de cartes Klondike gratuit en ligne | Arcadeum',
        description:
          'Jouez au solitaire Klondike classique gratuitement sur Arcadeum. Sans téléchargement ni inscription : casse-tête solo avec score, chronomètre et progression sauvegardée.',
        keywords:
          'solitaire, klondike, patience, réussite, jeu de cartes, solo, gratuit, en ligne, sans téléchargement',
      },
      hero: {
        title: 'Solitaire',
        subtitle:
          'La réussite préférée du monde. Retournez les cartes, alternez les couleurs et construisez chaque couleur de l’as au roi.',
        ctaPlay: 'Jouer maintenant',
      },
      features: {
        solo: {
          title: 'Vraiment solo',
          body: 'Sans compte ni salle d’attente : la partie est distribuée instantanément.',
        },
        progress: {
          title: 'Progression sauvegardée',
          body: 'Fermez l’onglet en pleine partie et reprenez exactement où vous étiez.',
        },
        stats: {
          title: 'Résultats suivis',
          body: 'Victoires et défaites alimentent automatiquement votre tableau de statistiques Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: 'Le solitaire est-il gratuit ?',
          answer:
            'Oui — le solitaire sur Arcadeum est entièrement gratuit, sans téléchargement et sans compte pour commencer.',
        },
        q2: {
          question: 'Faut-il un adversaire ?',
          answer:
            'Non. Le solitaire est un jeu solo qui tourne entièrement dans votre navigateur — parfait pour une petite pause.',
        },
        q3: {
          question: 'Ma progression est-elle sauvegardée ?',
          answer:
            'Oui. Votre donne en cours, votre score et vos statistiques sont stockés localement pour reprendre à tout moment.',
        },
        q4: {
          question: 'Quel est l’objectif du Solitaire Klondike ?',
          answer:
            'Construire quatre piles de fondation par couleur de l’As au Roi, tout en classant les colonnes du tableau en ordre décroissant de couleurs alternées.',
        },
        q5: {
          question:
            'Peut-on placer n’importe quelle carte sur un espace vide ?',
          answer:
            'Selon les règles officielles du Klondike, seul un Roi ou une suite débutant par un Roi peut occuper une colonne vide.',
        },
        q6: {
          question:
            'Quelle est la différence entre la donne 1 carte et 3 cartes ?',
          answer:
            'Tirer 1 carte retourne une seule carte du talon pour un jeu détendu, tandis que tirer 3 cartes demande une gestion stratégique plus poussée.',
        },
        q7: {
          question: 'Toutes les donnes de Solitaire sont-elles gagnables ?',
          answer:
            'Toutes les donnes ne sont pas solvables mathématiquement, mais révéler les cartes cachées au plus tôt optimise fortement vos chances.',
        },
        q8: {
          question:
            'Peut-on redescendre des cartes des fondations vers le tableau ?',
          answer:
            'Oui. Vous pouvez redescendre une carte d’une fondation vers le tableau pour débloquer des cartes face cachée cruciales.',
        },
        q9: {
          question: 'Peut-on jouer au Solitaire sur smartphone et tablette ?',
          answer:
            'Oui. Le Solitaire Arcadeum propose des commandes tactiles réactives et des animations douces adaptées à tous les écrans mobiles.',
        },
        q10: {
          question: 'Existe-t-il une option d’annulation des coups ?',
          answer:
            'Oui. Vous pouvez annuler vos mouvements à tout moment pour corriger un mauvais coup ou tester une autre séquence de jeu.',
        },
      },
      steps: {
        create: {
          title: 'Distribuez les cartes',
          body: 'Ouvrez le jeu : sept colonnes sont distribuées instantanément, carte supérieure visible.',
        },
        join: {
          title: 'Maîtrisez les coups',
          body: 'Touchez une carte pour la sélectionner, puis touchez sa destination. Un double toucher l’envoie à sa fondation.',
        },
        play: {
          title: 'Construisez les fondations',
          body: 'Empilez chaque couleur de l’as au roi. Libérez toutes les cartes pour gagner.',
        },
      },
    },
  },
};
