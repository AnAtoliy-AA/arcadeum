import { variants } from './fr-variants';

export const frMessages = {
  critical_v1: {
    name: 'Critique',
    description:
      'Un jeu de cartes stratégique où vous évitez les incidents critiques',
    rules: {
      title: 'Règles du Jeu',
      headers: {
        objective: 'Objectif',
        gameplay: 'Gameplay',
        combos: 'Combos',
        fastGame: 'Partie Rapide ⚡',
        privateRoom: 'Salle Privée 🔒',
        chat: 'Chat & Communication',
      },
      cardGroups: {
        core: 'Cartes Principales',
        attack: 'Pack Attaque',
        future: 'Pack Futur',
        theft: 'Pack Vol',
        chaos: 'Pack Chaos',
        deity: 'Pack Divinité',
        collection: 'Cartes de Collection',
      },
      objective:
        "N'explosez pas. Le dernier joueur en vie gagne. Si vous piochez un {{criticalEvent}}, vous devez jouer un {{neutralizer}} ou vous êtes éliminé.",
      gameplay:
        'À votre tour, jouez autant de Cartes Action que vous le souhaitez, ou aucune. Pour terminer votre tour, piochez une carte de la Pile de Pioche.',
      combos:
        "Les combos vous permettent de voler d'autres joueurs ! \n• Deux identiques : Jouez 2 cartes identiques pour voler une carte au hasard à un autre joueur. \n• Trois identiques : Jouez 3 cartes identiques pour nommer une carte et forcer un autre joueur à vous la donner. \n• 5 Cartes Différentes : Jouez 5 cartes avec des titres différents pour choisir une carte de la Pile de Défausse.",
      fastGame:
        '⚡ Partie Rapide : Cette salle a un minuteur de tour ! Si vous prenez trop de temps, le jeu jouera automatiquement pour vous. Ne traînez pas !',
      privateRoom:
        "🔒 Salle Privée : Cette salle est sur invitation uniquement. Partagez le code ou le lien d'invitation pour jouer avec des amis !",
      chat: '💬 Chat de Table : \n• Tous : Visible par tous (y compris les spectateurs). \n• Joueurs : Uniquement pour les joueurs en vie. \n• Privé : Notes pour vous-même (vous seul pouvez les voir).',
      setup:
        'Chaque joueur commence avec une carte Désamorçage et une main de cartes aléatoires. Le paquet contient des cartes Explosives... attention !',
    },
    variants: {
      cyberpunk: {
        name: 'Court-circuit',
        description: 'Des hackers cyberpunk évitent la surcharge du système',
      },
      underwater: {
        name: 'Pression Profonde',
        description: 'Horreur sous-marine dans un sous-marin qui fuit',
      },
      crime: {
        name: 'Le Casse',
        description: 'Thème noir avec descentes de police et évasions',
      },
      horror: {
        name: 'Banquet Maudit',
        description: 'Thème d’horreur sociale à la fête d’un mage noir',
      },
      adventure: {
        name: 'Randonnée en Montagne',
        description: 'Survie dans une aventure en échappant à une avalanche',
      },
      random: {
        name: 'Thème Aléatoire',
        description: 'Surprenez-moi avec un thème au hasard !',
      },
    },
  },

  table: {
    cards: {
      criticalEvent: 'Incident Critique',
      neutralizer: 'Désamorcer',
      strike: 'Attaque',
      evade: 'Passer',
      trade: 'Faveur',
      reorder: 'Mélanger',
      insight: "Voir l'Avenir",
      cancel: 'Non',
      collectionAlpha: 'Module Alpha',
      collectionBeta: 'Module Bêta',
      collectionGamma: 'Module Gamma',
      collectionDelta: 'Module Delta',
      collectionEpsilon: 'Module Epsilon',
      generic: 'Module',
      // Future Pack cards
      seeFuture5x: "Voir l'Avenir (5x)",
      alterFuture3x: "Altérer l'Avenir (3x)",
      alterFuture5x: "Altérer l'Avenir (5x)",
      revealFuture3x: "Révéler l'Avenir (3x)",
      shareFuture3x: "Partager l'Avenir (3x)",
      seeFuture_5x: "Voir l'Avenir (5x)",
      alterFuture_3x: "Altérer l'Avenir (3x)",
      alterFuture_5x: "Altérer l'Avenir (5x)",
      revealFuture_3x: "Révéler l'Avenir (3x)",
      shareFuture_3x: "Partager l'Avenir (3x)",
      drawBottom: 'Piocher du Fond',
      swapTopBottom: 'Échanger Haut & Fond',
      bury: 'Enterrer',
      // Attack Pack cards
      targetedStrike: 'Attaque Ciblée',
      privateStrike: 'Attaque Personnelle',
      recursiveStrike: 'Attaque des Morts',
      megaEvade: 'Super Passer',
      invert: 'Inverser',
      // Theft Pack cards
      wildcard: 'Joker',
      mark: 'Marquer',
      stealDraw: 'Je Prends Ça',
      stash: 'Tour de Pouvoir',
      // Chaos Pack cards
      criticalImplosion: 'Implosion Critique',
      containmentField: 'Champ de Confinement',
      fission: 'Fission',
      tribute: 'Tribut',
      blackout: 'Blackout',
      // Deity Pack cards
      omniscience: 'Omniscience',
      miracle: 'Miracle',
      smite: 'Châtiment',
      rapture: 'Le Ravissement',
      descriptions: {
        criticalEvent: 'Vous devez le désamorcer ou vous explosez !',
        neutralizer: 'Utilisez pour désamorcer un Incident Critique',
        strike: 'Fin du tour sans piocher, le joueur suivant joue 2 tours',
        evade: 'Terminez votre tour sans piocher de carte',
        trade: 'Forcez un autre joueur à vous donner une carte',
        reorder: 'Mélangez la pioche',
        insight: 'Regardez les 3 premières cartes du paquet',
        cancel: 'Annule toute action sauf Incident Critique ou Désamorcer',
        collectionAlpha:
          'Collectez des modules identiques pour voler des cartes',
        collectionBeta:
          'Collectez des modules identiques pour voler des cartes',
        collectionGamma:
          'Collectez des modules identiques pour voler des cartes',
        collectionDelta:
          'Collectez des modules identiques pour voler des cartes',
        collectionEpsilon:
          'Collectez des modules identiques pour voler des cartes',
        // Future Pack descriptions
        seeFuture5x: 'Regardez les 5 premières cartes du paquet',
        alterFuture3x: 'Réorganisez les 3 premières cartes',
        alterFuture5x: 'Réorganisez les 5 premières cartes',
        revealFuture3x: 'Révélez les 3 premières cartes à tout le monde',
        shareFuture3x:
          'Réorganisez les 3 premières cartes, puis montrez-les au joueur suivant',
        seeFuture_5x: 'Regardez les 5 premières cartes du paquet',
        alterFuture_3x: 'Réorganisez les 3 premières cartes',
        alterFuture_5x: 'Réorganisez les 5 premières cartes',
        revealFuture_3x: 'Révélez les 3 premières cartes à tout le monde',
        shareFuture_3x:
          'Réorganisez les 3 premières cartes, puis montrez-les au joueur suivant',
        drawBottom: 'Piochez la carte du fond du paquet',
        swapTopBottom: 'Échangez la carte du dessus et du dessous du paquet',
        bury: 'Piochez la carte du dessus, puis enterrez-la dans le paquet',
        // Attack Pack descriptions
        targetedStrike: 'Choisissez un joueur pour prendre 2 tours',
        privateStrike: 'Vous devez prendre 3 tours de suite',
        recursiveStrike: 'Joueur suivant prend 3 tours par joueur mort',
        megaEvade: 'Terminez TOUS vos tours restants sans piocher',
        invert: 'Inversez le sens du jeu',
        // Theft Pack descriptions
        wildcard:
          "Joker - peut remplacer n'importe quelle carte de collection dans les combos",
        mark: "Marquez une carte au hasard dans la main d'un autre joueur. Si il la joue ou la défausse, vous la volez !",
        stealDraw: 'La prochaine carte que ce joueur pioche va dans votre main',
        stash:
          "Déplacez jusqu'à 2 cartes dans votre réserve protégée. Les cartes cachées ne peuvent pas être volées",
        // Chaos Pack descriptions
        criticalImplosion:
          'Si pioché face visible, explose immédiatement et ne peut pas être désamorcé',
        containmentField:
          'Permet de garder un Incident Critique en main sans exploser',
        fission:
          'Mélange les Incidents Critiques dans le paquet et termine le tour sans piocher',
        tribute:
          'Tous les joueurs (vous inclus) mettent une carte de leur main sur le paquet',
        blackout: "Cible un joueur. Il jouera son prochain tour à l'aveugle",
        // Deity Pack descriptions
        omniscience:
          'Révèle les mains de tous les autres joueurs à vous en privé',
        miracle: 'Gagnez une carte Désamorcer hors du jeu',
        smite: 'Choisissez un joueur. Il doit prendre 3 tours immédiatement',
        rapture: 'Tous les autres joueurs doivent vous donner une carte',
      },
      variants,
    },
    actions: {
      start: 'Démarrer le Jeu',
      starting: 'Démarrage...',
      draw: 'Piocher',
      drawing: 'Pioche...',
      playSkip: 'Passer son Tour',
      playingSkip: 'Joue...',
      playAttack: 'Attaquer',
      playingAttack: 'Joue...',
      playNope: 'Non !',
      playingNope: 'Joue...',
    },
    autoplay: {
      title: '⚡ Jeu Automatique',
      autoPlay: '🎮 Jouer automatique',
      autoDraw: '🤖 Piocher automatique',
      autoSkip: '⏭️ Auto-passer le tour',
      autoShuffle: '🔀 Auto-mélanger après Désamorçage',
      autoDrawSkipAfterShuffle: '↪️ Piocher/Passer après Mélange',
      autoNopeAttack: '🚫 Auto-nope Attaque',
      autoGiveFavor: '🤲 Auto-donner Faveur (module→action→désamorcer)',
      autoDefuse: '🛡️ Auto-désamorcer (position aléatoire)',
    },
    idleTimer: {
      enableLabel: "Activer l'autoplay avec minuterie",
      enableHint: "L'autoplay démarre après {{seconds}} secondes d'inactivité",
      countdown: 'Autoplay dans {{seconds}}s',
      active: 'Autoplay Actif',
      stop: 'Arrêter',
    },
    state: {
      deck: 'Paquet',
      discard: 'Défausse',
      pendingDraws: 'Pioches en attente',
      cards: 'cartes',
      card: 'carte',
    },
    players: {
      you: 'Vous',
      alive: 'En vie',
      eliminated: 'Éliminé',
      yourTurn: 'Votre tour',
      waitingFor: "En attente d'un joueur...",
    },
    status: {
      gameCompleted: 'Partie Terminée',
    },
    lobby: {
      waitingToStart: 'En attente du début de la partie...',
      playersInLobby: 'Joueurs dans le Salon',
      needTwoPlayers: 'Au moins 2 joueurs sont nécessaires pour commencer',
      hostCanStart: "Cliquez sur 'Démarrer la Partie' quand vous êtes prêt",
      waitingForHost: "En attente que l'hôte démarre la partie",
      gameLoading: 'Le jeu est en cours de chargement...',
      hostControls: "Contrôles de l'Hôte",
      host: 'Hôte',
      players: 'Joueurs',
      roomInfo: 'Info de la Salle',
      status: 'Statut',
      statusWaiting: 'En attente',
      statusActive: 'Actif',
      visibility: 'Visibilité',
      visibilityPublic: 'Public',
      visibilityPrivate: 'Privé',
      inviteCode: "Code d'Invitation",
      waitingForPlayer: "En attente d'un joueur...",
      invitedPlayers: 'Joueurs Invités',
      statusDeclined: 'Refusé',
      reinvite: 'Réinviter',
    },
    hand: {
      title: 'Votre Main',
      empty: 'Aucune carte',
      showNames: 'Afficher les Noms',
      hideNames: 'Masquer les Noms',
      showDescriptions: 'Afficher les Descriptions',
      hideDescriptions: 'Masquer les Descriptions',
      layout: {
        grid: 'Grille',
        grid3: 'Grille 3x',
        grid4: 'Grille 4x',
        grid5: 'Grille 5x',
        grid6: 'Grille 6x',
        scroll: 'Défilement',
      },
    },
    log: {
      title: 'Journal de la Partie',
      empty: 'Aucune activité pour le moment',
    },
    chat: {
      title: 'Chat de Table',
      empty: 'Aucun message. Lancez la conversation !',
      send: 'Envoyer',
      show: 'Afficher le chat',
      hide: 'Masquer le chat',
      placeholderAll: 'Envoyez une note à toute la table',
      placeholderPlayers: 'Envoyez une note uniquement aux joueurs actifs',
      placeholderPrivate: 'Écrivez une note privée pour vous-même',
      hintAll: 'Visible par tout le monde dans la salle',
      hintPlayers: 'Visible uniquement par les joueurs encore en vie',
      hintPrivate: 'Vous seul pouvez voir ceci',
      scope: { all: 'Tous', players: 'Joueurs', private: 'Privé' },
    },
    eliminated: {
      title: 'Vous avez été éliminé !',
      message: 'Regardez les joueurs restants se battre',
    },
    victory: {
      title: 'Victoire !',
      message: 'Félicitations ! Vous avez survécu !',
    },
    defeat: {
      title: 'Fin de Partie',
      message: 'Meilleure chance la prochaine fois !',
    },
    rematch: {
      button: 'Rejouer',
      loading: 'Création...',
      modalTitle: 'Démarrer la Revanche',
      modalDescription: 'Sélectionnez les joueurs à inviter:',
      noPlayers: "Pas d'autres joueurs dans cette partie",
      messagePlaceholder: 'Message optionnel...',
      message: 'Message',
      invitationTitle: 'Invitation à une Revanche',
      invitationDescription: 'vous a invité à une revanche !',
      toDecide: 'pour décider',
      decline: 'Refuser',
      accept: 'Accepter',
      joining: 'Rejoindre...',
      blockThisRematch: 'Bloquer cette revanche uniquement',
      blockInvitations: 'Bloquer toutes les invitations de ce joueur',
    },
    fullscreen: {
      enter: 'Plein écran (F)',
      exit: 'Quitter le plein écran (Échap)',
      hint: 'Appuyez sur F pour le plein écran',
    },
    modals: {
      common: { cancel: 'Annuler', confirm: 'Confirmer', close: 'Fermer' },
      omniscience: {
        title: 'Omniscience',
        subtitle: 'Vous voyez toutes les cartes en jeu !',
        emptyHand: 'Pas de cartes en main.',
      },
      alterTheFuture: {
        title: "Altérer l'Avenir",
        description:
          'Réorganisez les cartes du dessus du paquet. La carte du dessus (#1) sera piochée ensuite.',
        confirm: 'Confirmer',
      },
      shareTheFuture: {
        title: "Partager l'Avenir",
      },
      eventCombo: {
        title: 'Jouer un Combo',
        selectType: 'Sélectionner le type de Combo',
        pairTrio: 'Paire/Trio',
        selectComboCard: 'Sélectionner une carte',
        fiver: 'Cinq',
        anyFive: '5 cartes différentes',
        selectMode: 'Sélectionner le mode de Combo',
        pair: 'Paire',
        pairDesc: 'Carte aléatoire de la cible',
        trio: 'Trio',
        trioDesc: 'Choisir une carte spécifique',
        trioMode: '2-3 cartes',
        selectTarget: 'Sélectionner le Joueur Cible',
        selectCard: 'Sélectionner la Carte à Demander',
        cardsCount: '{{count}} cartes',
        confirm: 'Jouer le Combo',
        stashCards: 'Sélectionner {{count}} cartes différentes',
        pickDiscard: 'Choisir une carte dans la pile de défausse',
        selectCardHint: 'Sélectionnez une carte ci-dessous',
        pickCardBlind: "Choisissez une carte (à l'aveugle)",
        cardLabel: 'Carte {{index}}',
      },
      seeTheFuture: { title: 'Cartes du Dessus', confirm: 'Compris !' },
      targetedAttack: {
        title: 'Attaque Ciblée',
        selectPlayer: 'Sélectionner un Joueur',
        description:
          'Choisissez un joueur pour prendre 2 tours à la place du joueur suivant.',
      },
      favor: {
        title: 'Demander une Faveur',
        selectPlayer: 'Sélectionner un Joueur',
        description:
          'Le joueur sélectionné vous donnera une carte aléatoire de sa main.',
        cardsCount: '{{count}} cartes',
        confirm: 'Prendre Carte Aléatoire',
      },
      giveFavor: {
        title: 'Donner une Carte',
        description:
          '{{player}} a demandé une faveur. Choisissez une carte à lui donner.',
        confirm: 'Donner Carte',
      },
      defuse: {
        title: "Désamorcer l'Incident Critique !",
        description: "Choisissez où placer l'Incident Critique dans le paquet",
        positionLabel: 'Position dans le paquet :',
        confirm: 'Placer la Carte',
      },
      stash: {
        title: 'Tour de Pouvoir',
        description:
          "Sélectionnez jusqu'à 3 cartes à protéger dans votre réserve. Les cartes cachées ne peuvent pas être volées ou données.",
        confirm: 'Réserver Cartes',
      },
      mark: {
        title: 'Marquer Joueur',
        description:
          "Choisissez un joueur à marquer. Une carte aléatoire de sa main sera marquée. S'il la joue ou la défausse, vous la volez !",
        confirm: 'Marquer Joueur',
      },
      stealDraw: {
        title: 'Je Prends Ça',
        description:
          "Choisissez un joueur. La prochaine carte qu'il piochera sera volée et ajoutée à votre main à la place !",
        confirm: 'Confirmer le Vol',
      },
    },
    controlPanel: {
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter le plein écran',
      enterFullscreen: 'Entrer en plein écran',
      leaveRoom: 'Quitter',
      leaveConfirmMessage:
        'Êtes-vous sûr de vouloir quitter la partie ? Vous serez retiré de la liste des participants.',
      exitRoom: 'Sortir',
      exitRoomTooltip: 'Retourner au lobby mais rester dans la partie',
      leaveGameTooltip: 'Se retirer de la partie et retourner au lobby',
      moveControls: {
        moveUp: 'Déplacer vers le haut',
        moveDown: 'Déplacer vers le bas',
        moveLeft: 'Déplacer vers la gauche',
        moveRight: 'Déplacer vers la droite',
        centerView: 'Centrar la vue',
        shortcuts: {
          up: 'W/Flèche haut',
          down: 'S/Flèche bas',
          left: 'A/Flèche gauche',
          right: 'D/Flèche droite',
          center: 'C',
          fullscreen: 'F',
          exitFullscreen: 'Échap',
        },
      },
    },
  },
};
