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
  },
};
