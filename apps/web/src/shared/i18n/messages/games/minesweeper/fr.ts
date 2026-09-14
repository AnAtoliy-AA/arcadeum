export const frMessages = {
  minesweeper_v1: {
    name: 'Démineur',
    description:
      'Le Démineur classique — déblayez la grille sans faire exploser une seule mine',
    summary:
      'Le casse-tête logique iconique : révélez chaque case sûre, marquez les mines et battez le chrono.',
    board: {
      label: 'Champ de mines',
      loading: 'Déminage…',
      cellHidden: 'Case cachée',
      cellFlagged: 'Case marquée',
      cellMine: 'Mine',
      cellEmpty: 'Case vide',
    },
    hud: {
      mines: 'Mines restantes',
      time: 'Temps',
      newGame: 'Nouvelle partie',
      flagMode: 'Mode drapeau',
      flagModeHint:
        'Activez-le pour planter des drapeaux d’un simple toucher — idéal sur écran tactile',
      difficulty: 'Difficulté',
    },
    difficulty: {
      beginner: 'Débutant (9×9 · 10 mines)',
      intermediate: 'Intermédiaire (16×16 · 40 mines)',
      expert: 'Expert (22×16 · 80 mines)',
    },
    result: {
      wonTitle: 'Terrain déblayé !',
      wonBody: 'Toutes les cases sûres sont révélées. Un déminage impeccable.',
      lostTitle: 'Boum !',
      lostBody: 'C’était une mine. Étudiez les chiffres et réessayez.',
      playAgain: 'Rejouer',
    },
    rules: {
      objective:
        'Révélez toutes les cases qui ne cachent pas de mine. Découvrez toutes les cases sûres pour gagner.',
      gameplay:
        'Les chiffres indiquent combien de mines se trouvent parmi les huit cases voisines. Marquez les suspects d’un clic droit ou d’un appui long ; touchez un chiffre satisfait pour ouvrir ses voisines.',
      scoring:
        'Votre premier clic est toujours sûr et lance le chrono. Déblayez le terrain au plus vite — le temps est votre seul score.',
    },
    landing: {
      tagline: 'Solo · Sans inscription',
      meta: {
        title:
          'Démineur — Jeu de réflexion classique gratuit en ligne | Arcadeum',
        description:
          'Jouez gratuitement au Démineur en ligne sur Arcadeum. Grilles de débutant à expert, drapeaux, chrono et progression sauvegardée. Sans téléchargement ni inscription.',
        keywords:
          'démineur, minesweeper, jeu de puzzle, jeu de logique, solo, gratuit, en ligne, jeu navigateur',
      },
      hero: {
        title: 'Démineur',
        subtitle:
          'Le casse-tête légendaire. Lisez les chiffres, marquez les bombes et déblayez toutes les grilles, du 9×9 au niveau expert.',
        ctaPlay: 'Jouer maintenant',
      },
      features: {
        solo: {
          title: 'Vraiment solo',
          body: 'Ni comptes ni salles d’attente — un champ de mines neuf à un clic.',
        },
        progress: {
          title: 'Progression sauvegardée',
          body: 'Fermez l’onglet en pleine partie et retrouvez le terrain exactement comme vous l’avez laissé.',
        },
        stats: {
          title: 'Résultats suivis',
          body: 'Victoires et défaites alimentent automatiquement votre tableau de statistiques Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: 'Le Démineur est-il gratuit ?',
          answer:
            'Oui — le Démineur d’Arcadeum est entièrement gratuit, sans téléchargement et sans compte pour commencer.',
        },
        q2: {
          question: 'Comment poser des drapeaux sur mobile ?',
          answer:
            'Activez le mode drapeau ou appuyez longuement sur une case cachée. Le clic droit fonctionne sur ordinateur.',
        },
        q3: {
          question: 'Ma progression est-elle sauvegardée ?',
          answer:
            'Oui. Le terrain en cours, la difficulté et vos statistiques sont stockés localement pour reprendre à tout moment.',
        },
        q4: {
          question: 'Que signifient les numéros sur les cases ?',
          answer:
            'Chaque chiffre dévoilé indique le nombre exact de mines cachées dans les huit cases immédiatement adjacentes.',
        },
        q5: {
          question: 'Peut-on perdre dès le premier clic ?',
          answer:
            'Non. Le Démineur d’Arcadeum garantit que votre tout premier clic est toujours sécurisé et libère un espace de jeu.',
        },
        q6: {
          question: 'Qu’est-ce que le chording et comment s’en servir ?',
          answer:
            'Le chording permet de révéler instantanément toutes les cases voisines non marquées dès que les drapeaux adjacents sont posés.',
        },
        q7: {
          question: 'Quels niveaux de difficulté sont proposés ?',
          answer:
            'Jouez en Débutant (9×9 avec 10 mines), Intermédiaire (16×16 avec 40 mines) ou Expert (30×16 avec 99 mines).',
        },
        q8: {
          question: 'Quelle est la meilleure tactique face à une incertitude ?',
          answer:
            'Analysez les probabilités de mines entre groupes de chiffres croisés pour choisir la case présentant le risque minimal.',
        },
        q9: {
          question: 'Peut-on personnaliser les dimensions de la grille ?',
          answer:
            'Oui. Le mode personnalisé permet d’ajuster largeur, hauteur et densité de mines selon votre niveau de défi souhaité.',
        },
        q10: {
          question: 'Les meilleurs temps de victoire sont-ils conservés ?',
          answer:
            'Oui. Un chronomètre précis enregistre vos temps de déminage sur chaque difficulté et conserve vos records personnels.',
        },
      },
      steps: {
        create: {
          title: 'Choisissez votre grille',
          body: 'Commencez sur le terrain 9×9 débutant ou foncez directement sur le niveau expert.',
        },
        join: {
          title: 'Lisez les chiffres',
          body: 'Chaque chiffre compte les mines qui touchent cette case. Touchez pour révéler, appuyez longtemps pour marquer.',
        },
        play: {
          title: 'Déblayez le terrain',
          body: 'Utilisez les chiffres satisfaits pour ouvrir vite les cases sûres et éviter toutes les bombes.',
        },
      },
    },
  },
};
