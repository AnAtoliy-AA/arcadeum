export const frMessages = {
  sudoku_v1: {
    name: 'Sudoku',
    description:
      'Sudoku classique — remplissez la grille 9×9 pour que chaque ligne, colonne et bloc contienne les chiffres 1–9 une seule fois',
    summary:
      'Le casse-tête chiffré préféré du monde : logique pure, trois difficultés et annotations au crayon incluses.',
    board: {
      loading: 'Préparation…',
    },
    hud: {
      time: 'Temps',
      mistakes: 'Erreurs',
      newGame: 'Nouvelle partie',
      difficulty: 'Difficulté',
    },
    difficulty: {
      easy: 'Facile',
      medium: 'Moyen',
      hard: 'Difficile',
    },
    controls: {
      notes: 'Notes',
      notesHint:
        'Activez les annotations — les chiffres s’inscrivent dans la case comme candidats, pas comme réponses',
      erase: 'Effacer',
      placeDigit: 'Placer le chiffre {{digit}}',
      noteDigit: 'Note {{digit}}',
    },
    result: {
      wonTitle: 'Résolu !',
      wonBody:
        'Grille complétée avec {{mistakes}} erreur(s) en chemin. Bien joué.',
      flawlessBody: 'Résolution impeccable — pas une seule erreur.',
      playAgain: 'Rejouer',
    },
    rules: {
      objective:
        'Remplissez toute la grille 9×9 pour que chaque ligne, chaque colonne et chaque bloc 3×3 contiennent les chiffres de 1 à 9 exactement une fois.',
      gameplay:
        'Touchez une case puis choisissez un chiffre sur le pavé ou au clavier. Passez en mode Notes pour annoter les candidats avant de trancher.',
      scoring:
        'Les erreurs se comptent mais restent visibles à corriger — l’objectif est une résolution propre et rapide.',
    },
    landing: {
      tagline: 'Solo · Sans inscription',
      meta: {
        title: 'Sudoku — Jeu de puzzle de chiffres gratuit en ligne | Arcadeum',
        description:
          'Jouez gratuitement au Sudoku en ligne sur Arcadeum. Niveaux facile, moyen et difficile à solution unique, crayon, clavier et progression sauvegardée. Sans téléchargement ni inscription.',
        keywords:
          'sudoku, puzzle de chiffres, jeu de logique, solo, gratuit, en ligne, jeu navigateur, sudoku en ligne',
      },
      hero: {
        title: 'Sudoku',
        subtitle:
          'Le casse-tête logique 9×9 classique avec des niveaux de difficulté soignés, des annotations et aucune publicité.',
        ctaPlay: 'Jouer maintenant',
      },
      features: {
        solo: {
          title: 'Vraiment solo',
          body: 'Ni comptes ni salles d’attente — une nouvelle grille unique en un clic.',
        },
        progress: {
          title: 'Progression sauvegardée',
          body: 'Fermez l’onglet en pleine résolution et retrouvez la grille exactement comme vous l’avez laissée.',
        },
        stats: {
          title: 'Résultats suivis',
          body: 'Chaque grille terminée alimente automatiquement votre tableau de statistiques Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: 'Le Sudoku est-il gratuit ?',
          answer:
            'Oui — le Sudoku d’Arcadeum est entièrement gratuit, sans téléchargement et sans compte pour commencer.',
        },
        q2: {
          question: 'Chaque grille a-t-elle une solution unique ?',
          answer:
            'Oui. Chaque grille générée est vérifiée : elle n’admet qu’une seule solution, accessible par pur raisonnement.',
        },
        q3: {
          question: 'Peut-on jouer sur mobile ?',
          answer:
            'Bien sûr. Le pavé numérique est adapté au tactile et le mode Notes permet de noter les candidats comme sur papier.',
        },
      },
      steps: {
        create: {
          title: 'Choisissez la difficulté',
          body: 'Les grilles faciles comptent environ quarante indices ; les difficiles descendent vers vingt-six.',
        },
        join: {
          title: 'Scannez les lignes',
          body: 'Trouvez par élimination où va un chiffre — touchez la case puis son numéro sur le pavé.',
        },
        play: {
          title: 'Complétez la grille',
          body: 'Servez-vous des Notes pour suivre les candidats et remplissez chaque case de 1 à 9 sans doublon.',
        },
      },
    },
  },
};
