export const frMessages = {
  sea_battle_v1: {
    name: 'Bataille Navale',
    rules: {
      title: 'Règles du Jeu',
      headers: {
        objective: 'Objectif',
        gameplay: 'Déroulement',
        placement: 'Placement des Navires',
        battle: 'Phase de Bataille',
        ships: 'Votre Flotte',
      },
      objective:
        "Coulez tous les navires ennemis avant qu'ils ne coulent les vôtres ! Le dernier joueur avec des navires restants gagne.",
      gameplay:
        "Le jeu a deux phases : Placement et Bataille. D'abord, placez secrètement vos navires sur votre grille 10×10. Ensuite, tirez à tour de rôle sur les grilles adverses pour trouver et couler leurs navires.",
      placement:
        'Placez les 5 navires sur votre grille avant que la bataille ne commence. Les navires ne peuvent pas se chevaucher ni se toucher. Cliquez pour placer, utilisez le bouton pour tourner.',
      battle:
        "À votre tour, cliquez sur la grille d'un adversaire pour tirer. Les touches sont marquées en rouge, les ratés en blanc. Quand toutes les cellules d'un navire sont touchées, il coule !",
      ships: `• Porte-avions (5 cases) - Le plus grand navire
• Cuirassé (4 cases) - Croiseur lourd
• Croiseur (3 cases) - Navire d'attaque rapide
• Sous-marin (3 cases) - Navire furtif
• Destroyer (2 cases) - Petit mais agile`,
    },
  },
  seaBattle: {
    table: {
      state: {
        yourBoard: 'Votre Plateau',
        opponentBoard: 'Plateau Adversaire',
        shipsRemaining: 'Navires Restants',
      },
      players: {
        you: 'Vous',
        alive: 'En vie',
        eliminated: 'Éliminé',
        yourTurn: 'Votre tour',
        yourTurnAttack: '🎯 À vous de jouer - Attaquez un adversaire !',
        placeShips: 'Placez vos navires',
        waitingFor: 'En attente de {{player}}...',
      },
      phase: {
        lobby: 'Salon',
        placement: 'Placement',
        battle: 'Bataille',
        completed: 'Partie Terminée',
      },
      actions: {
        start: 'Démarrer',
        starting: 'Démarrage...',
        confirmPlacement: 'Confirmer Placement',
        rotate: 'Pivoter',
        fire: 'Feu !',
        autoPlace: 'Placement Auto',
        randomize: 'Aléatoire',
        resetPlacement: 'Réinitialiser',
        waitingForOthers: 'En attente des autres...',
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
        needTwoPlayers: 'Il faut au moins 2 joueurs',
        maxFourPlayers: 'Maximum 4 joueurs',
        hostCanStart: "Cliquez sur 'Démarrer' quand vous êtes prêt",
        waitingForHost: "En attente de l'hôte",
        hostControls: "Contrôles de l'Hôte",
        roomInfo: 'Infos du Salon',
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
      chat: {
        title: 'Chat de Bataille',
        empty: 'Aucun message',
        send: 'Envoyer',
        placeholder: 'Écrivez un message...',
      },
    },
  },
};
