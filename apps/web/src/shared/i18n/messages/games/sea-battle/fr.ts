export const frMessages = {
  sea_battle_v1: {
    name: 'Bataille Navale',
    description: 'Jeu de combat naval classique jusqu’à 6 joueurs',
    colors: {
      ship: 'Navire',
      hit: 'Touché',
      miss: 'Manqué',
      empty: 'Vide',
    },
    challengePlayer: 'Défier {{name}} à la Bataille Navale ?',
    rules: {
      title: 'Règles du Jeu',
      headers: {
        objective: 'Objectif',
        gameplay: 'Système de jeu',
        placement: 'Placement des navires',
        battle: 'Phase de bataille',
        ships: 'Votre flotte',
      },
      objective:
        'Coulez tous les navires ennemis avant qu’ils ne coulent les vôtres ! Le dernier joueur avec des navires restants gagne.',
      gameplay:
        'Le jeu se déroule en deux phases : Placement des navires et Bataille. D’abord, placez secrètement vos navires on votre grille 10×10. Ensuite, tirez à tour de rôle sur les grilles adverses pour trouver et couler leurs navires.',
      placement:
        'Placez les 5 navires sur votre grille avant le début de la bataille. Les navires ne peuvent pas se chevaucher ou se toucher. Cliquez pour placer, faites pivoter avec le bouton.',
      battle:
        "À votre tour, cliquez sur la grille d'un adversaire pour tirer. Les touches sont marquées en rouge, les ratés en blanc. Quand toutes les cases d'un navire sont touchées, il coule !",
      ships: `• Porte-avions (5 cases) - Le plus grand navire
• Cuirassé (4 cases) - Croiseur lourd
• Croiseur (3 cases) - Navire d'attaque rapide
• Sous-marin (3 cases) - Vaisseau furtif
• Destroyer (2 cases) - Petit mais agile`,
    },
    variants: {
      classic: {
        name: 'Classique',
        description: 'Thème traditionnel de bataille navale',
      },
      modern: {
        name: 'Moderne II',
        description: 'Guerre navale moderne',
      },
      pixel: {
        name: 'Pixel Art',
        description: 'Style pixel art rétro',
      },
      cartoon: {
        name: 'Dessin Animé',
        description: 'Personnages de dessins animés amusants',
      },
      cyber: {
        name: 'Guerre néon high-tech',
        description: 'Cyberpunk',
      },
      vintage: {
        name: 'Vintage',
        description: 'Ancienne carte maritime',
      },
      nebula: {
        name: 'Nébuleuse',
        description: 'Flote de l’espace lointain',
      },
      forest: {
        name: 'Forêt',
        description: 'Opérations de camouflage',
      },
      sunset: {
        name: 'Coucher de Soleil',
        description: 'Engagement au crépuscule',
      },
      monochrome: {
        name: 'Noir',
        description: 'Style monochrome élégant',
      },
    },
    table: {
      state: {
        yourBoard: 'Votre Plateau',
        opponentBoard: 'Plateau Adverse',
        shipsRemaining: 'Navires Restants',
        shipsPalette: 'Navires à Placer',
        vertical: 'Vertical',
        horizontal: 'Horizontal',
        cells: 'Cases',
      },
      players: {
        you: 'Vous',
        alive: 'En vie',
        eliminated: 'Éliminé',
        yourTurn: 'À vous de jouer',
        yourTurnAttack: '🎯 C’est votre tour - Attaquez un adversaire !',
        placeShips: 'Placez vos navires',
        waitingFor: 'En attente de {{player}}...',
        targetBadge: 'Cible',
        defendingBadge: 'En défense',
        opponentBadge: 'Adversaire',
      },
      phase: {
        lobby: 'Salon',
        placement: 'Placement des navires',
        battle: 'Bataille',
        completed: 'Partie terminée',
      },
      actions: {
        start: 'Démarrer la partie',
        starting: 'Démarrage...',
        confirmPlacement: 'Confirmer le placement',
        rotate: 'Pivoter',
        challenge: 'Défi',
        fire: 'Feu !',
        autoPlace: 'Placement auto',
        randomize: 'Aléatoire',
        resetPlacement: 'Réinitialiser',
        waitingForOthers: 'En attente des autres...',
        dragHint: 'Glisser sur le plateau · Cliquer pour sélectionner',
      },
      attack: {
        hit: 'Touché !',
        miss: 'Manqué',
        sunk: 'Coulé !',
        shipSunk: '{{ship}} a été coulé !',
      },
      lobby: {
        waitingToStart: 'En attente du début de la partie...',
        playersInLobby: 'Joueurs dans le salon',
        needTwoPlayers: 'Au moins 2 joueurs requis',
        maxFourPlayers: 'Maximum 4 joueurs',
        hostCanStart: "Cliquez sur 'Démarrer' quand vous êtes prêt",
        waitingForHost: 'En attente du démarrage par l’hôte',
        hostControls: 'Contrôles de l’hôte',
        theme: 'Thème',
        roomInfo: 'Infos de la salle',
        host: 'Hôte',
      },
      victory: {
        title: 'Victoire !',
        message: 'Vous avez coulé tous les navires ennemis !',
      },
      defeat: {
        title: 'Défaite',
        message: 'Tous vos navires ont été coulés.',
      },
      controlPanel: {
        spectating: 'Observation',
        fullscreen: 'Plein écran',
        exitFullscreen: 'Quitter le plein écran',
        enterFullscreen: 'Entrer en plein écran',
        rules: 'Règles',
        leaveRoom: 'Quitter',
        leaveConfirmMessage:
          'Êtes-vous sûr de vouloir quitter la partie ? Vous serez retiré de la liste des participants.',
        exitRoom: 'Sortir',
        exitRoomTooltip: 'Retourner au lobby tout en restant dans le jeu',
        leaveGameTooltip: 'Vous retirer du jeu et retourner au lobby',
      },
      chat: {
        title: 'Chat de Bataille',
        empty: 'Aucun message pour le moment',
        send: 'Envoyer',
        show: 'Afficher le chat',
        hide: 'Masquer le chat',
        placeholder: 'Tapez un message...',
      },
    },
    teamMode: {
      enableLabel: 'Mode équipe',
      disableLabel: 'Désactiver le mode équipe',
      hideShipsLabel: 'Masquer les navires aux coéquipiers',
      teammateBadge: 'Coéquipier',
      cannotAttackTeammate: 'Impossible d’attaquer un coéquipier',
      description:
        'Jouez en équipes. Définissez le nombre d’équipes et leurs tailles — les joueurs peuvent choisir ou être assignés par l’hôte.',
      setup: {
        title: 'Configuration des équipes',
        teamNamePlaceholder: 'Nom de l’équipe',
        teamColorLabel: 'Couleur',
        slotCountLabel: 'Cases',
        addTeam: 'Ajouter une équipe',
        removeTeam: 'Supprimer l’équipe',
        addBot: 'Ajouter un bot',
        removeBot: 'Supprimer',
        totalSlots: 'Cases totales : {{used}} / {{max}}',
        minTeamsHint: 'Au moins 2 équipes requises',
        maxTeamsHint: 'Jusqu’à 4 équipes (chacune avec au moins 2 joueurs)',
        minSizeHint: 'Chaque équipe nécessite au moins 2 cases',
      },
      slots: {
        joinTeam: 'Rejoindre l’équipe',
        leaveTeam: 'Quitter l’équipe',
        moveTo: 'Déplacer vers {{team}}',
        botLabel: 'Bot',
        emptySlot: 'Place libre',
      },
      unassigned: {
        title: 'Non assigné',
        empty: 'Tout le monde est dans une équipe',
      },
      start: {
        disabledNotFull:
          'Toutes les places doivent être remplies avant de commencer',
        disabledNotEnoughTeams: 'Au moins 2 équipes requises',
      },
      errors: {
        roomFull: 'La salle ne peut pas dépasser 8 joueurs en mode équipe',
        teamFull: 'Cette équipe est pleine',
        teamNotFound: 'Équipe introuvable',
        notHost: 'Seul l’hôte peut modifier la configuration des équipes',
      },
      chat: {
        channelTeam: 'Équipe',
        channelAll: 'Tous',
        channelPrivate: 'Privé',
      },
      banner: {
        eliminatedSpectator:
          'Vous avez été éliminé. Vous pouvez toujours discuter avec votre équipe et regarder la bataille.',
        teamWon: 'Victoire de {{team}} !',
      },
    },
    landing: {
      meta: {
        title:
          'Bataille Navale — Jouez en ligne gratuitement avec vos amis | Arcadeum',
        description:
          'Jouez à Bataille Navale en ligne gratuitement. Combat naval classique pour 2 à 4 joueurs, avec bots IA, mode équipes et plus de 10 thèmes. Sans téléchargement ni inscription — créez une salle et partagez le lien.',
        ogTitle: 'Bataille Navale en ligne — Multijoueur gratuit (Battleship)',
        ogDescription:
          'Placez votre flotte, tirez sur les grilles ennemies et coulez tous leurs navires. Jouez dans votre navigateur avec des amis ou contre l’IA.',
        keywords:
          'bataille navale, bataille navale en ligne, jouer bataille navale, battleship en ligne, bataille navale multijoueur',
      },
      hero: {
        title: 'Bataille Navale',
        tagline: 'Jouez à la Bataille Navale en ligne — gratuit et multijoueur',
        intro:
          'La Bataille Navale est le jeu de combat naval intemporel où deux amiraux ou plus placent secrètement leurs flottes sur une grille 10×10 et échangent des salves jusqu’à ce qu’une seule flotte reste à flot. Sur Arcadeum, vous pouvez jouer à la Bataille Navale directement dans votre navigateur — sans téléchargement, sans inscription — avec des amis, des inconnus ou des bots IA.',
        ctaPlay: 'Créer une salle de Bataille Navale',
        ctaRooms: 'Voir les salles ouvertes',
        ctaQuickplay: 'Jouer contre l’IA maintenant',
        ctaGroupLabel: 'Démarrage rapide de Bataille Navale',
        eyebrow: 'Gratuit · 2–4 joueurs · Sans inscription',
        chips: [
          'Dans le navigateur',
          'Jouez contre des bots IA',
          'Mode équipes',
          '10+ thèmes',
        ],
      },
      sections: {
        highlightsKicker: 'Pourquoi Arcadeum',
        howToKicker: 'Quatre étapes · ~20 minutes',
        themesKicker: 'Choisissez votre flotte',
        themesTitle: '10+ thèmes, un seul jeu',
        themesLead:
          'Chaque salle laisse choisir l’apparence du plateau — du classique élégant à la nébuleuse spatiale et au pixel-art rétro.',
        rulesKicker: 'Référence',
        faqKicker: 'FAQ',
      },
      board: {
        label: 'Sonar · En direct',
      },
      highlights: {
        title: 'Pourquoi jouer à la Bataille Navale sur Arcadeum',
        players: {
          title: '2 à 4 joueurs',
          body: 'Duels en tête-à-tête ou mêlée jusqu’à quatre amiraux par salle.',
        },
        teams: {
          title: 'Mode équipes',
          body: 'Jusqu’à quatre équipes avec plateaux partagés, chat d’équipe privé et option navires cachés.',
        },
        themes: {
          title: 'Plus de 10 thèmes',
          body: 'Classique, moderne, pixel-art, cyberpunk, nébuleuse, vintage, coucher de soleil et plus.',
        },
        free: {
          title: 'Gratuit et instantané',
          body: 'Aucune installation, aucun paywall. Ouvrez une salle et partagez le lien.',
        },
      },
      howToPlay: {
        title: 'Comment jouer à la Bataille Navale',
        steps: {
          create: {
            title: '1. Créez une salle',
            body: 'Choisissez un thème, invitez des amis ou ajoutez des bots IA, et choisissez le duel ou le mode équipes.',
          },
          place: {
            title: '2. Placez votre flotte',
            body: 'Glissez vos cinq navires sur votre grille 10×10. Les navires ne peuvent pas se chevaucher ni se toucher.',
          },
          fire: {
            title: '3. Tirez sur l’ennemi',
            body: 'À tour de rôle, choisissez une case sur la grille de chaque adversaire. Touches en rouge, ratés en blanc.',
          },
          win: {
            title: '4. Coulez-les tous',
            body: 'Le dernier amiral avec au moins un navire à flot remporte la bataille.',
          },
        },
      },
      faq: {
        title: 'Questions fréquentes',
        items: {
          free: {
            question: 'La Bataille Navale est-elle gratuite ?',
            answer:
              'Oui. La Bataille Navale sur Arcadeum est entièrement gratuite et se joue dans le navigateur sans téléchargement.',
          },
          players: {
            question: 'Combien de joueurs peuvent jouer ?',
            answer:
              'De deux à quatre joueurs par salle. Le mode équipes permet jusqu’à quatre équipes de deux joueurs ou plus.',
          },
          ai: {
            question: 'Puis-je jouer contre l’ordinateur ?',
            answer:
              'Oui. Vous pouvez remplir n’importe quelle place vide avec un bot IA pour vous entraîner seul ou compléter un petit groupe.',
          },
          duration: {
            question: 'Combien de temps dure une partie ?',
            answer:
              'Une partie typique dure environ 20 minutes, selon le nombre de joueurs et la vitesse des tirs.',
          },
          rules: {
            question: 'Quelles sont les règles de la Bataille Navale ?',
            answer:
              'Chaque joueur place secrètement une flotte sur une grille 10×10, puis les joueurs tirent à tour de rôle sur une case de la grille de chaque adversaire. Les touches sont marquées en rouge, les ratés en blanc. Quand toutes les cases d’un navire sont touchées, il coule. Le dernier joueur avec au moins un navire à flot gagne.',
          },
        },
      },
      finalCta: {
        title: 'Prêt à jouer ?',
        subtitle:
          'Ouvrez une salle et partagez le lien — votre flotte vous attend.',
      },
      breadcrumb: {
        home: 'Accueil',
        games: 'Jeux',
        seaBattle: 'Bataille Navale',
      },
    },
  },
};
