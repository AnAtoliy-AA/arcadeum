import type { GamesMessages, Locale } from "../types";

type ExtendedGamesMessages = GamesMessages & {
  "exploding-kittens"?: { name: string };
  "exploding-cats"?: { name: string };
  "texas-holdem"?: { name: string };
  coup?: { name: string };
  "pandemic-lite"?: { name: string };
  rooms?: GamesMessages["rooms"] & {
    hostLabel?: string;
    playersLabel?: string;
    statusLabel?: string;
    visibilityLabel?: string;
    visibility?: {
      public?: string;
      private?: string;
    };
  };
  roomPage?: {
    loading?: string;
    loadingGame?: string;
    errors?: {
      notAuthenticated?: string;
      loginButton?: string;
      loadingRoom?: string;
      roomNotFound?: string;
      unsupportedGame?: string;
    };
  };
  table?: {
    cards?: {
      explodingCat?: string;
      defuse?: string;
      attack?: string;
      skip?: string;
      favor?: string;
      shuffle?: string;
      seeTheFuture?: string;
      tacocat?: string;
      hairyPotatoCat?: string;
      rainbowRalphingCat?: string;
      cattermelon?: string;
      beardedCat?: string;
      generic?: string;
    };
    actions?: {
      start?: string;
      starting?: string;
      draw?: string;
      drawing?: string;
      playSkip?: string;
      playingSkip?: string;
      playAttack?: string;
      playingAttack?: string;
    };
    state?: {
      deck?: string;
      discard?: string;
      pendingDraws?: string;
      cards?: string;
      card?: string;
    };
    players?: {
      you?: string;
      alive?: string;
      eliminated?: string;
      yourTurn?: string;
      waitingFor?: string;
    };
    lobby?: {
      waitingToStart?: string;
      playersInLobby?: string;
      needTwoPlayers?: string;
      hostCanStart?: string;
      waitingForHost?: string;
    };
    hand?: {
      title?: string;
      empty?: string;
    };
    log?: {
      title?: string;
      empty?: string;
    };
    chat?: {
      title?: string;
      empty?: string;
      send?: string;
      show?: string;
      hide?: string;
      placeholderAll?: string;
      placeholderPlayers?: string;
      hintAll?: string;
      hintPlayers?: string;
      scope?: {
        all?: string;
        players?: string;
      };
    };
    eliminated?: {
      title?: string;
      message?: string;
    };
    fullscreen?: {
      enter?: string;
      exit?: string;
      hint?: string;
    };
    controlPanel?: {
      fullscreen?: string;
      exitFullscreen?: string;
      enterFullscreen?: string;
      leaveRoom?: string;
      moveControls?: {
        moveUp?: string;
        moveDown?: string;
        moveLeft?: string;
        moveRight?: string;
        centerView?: string;
        shortcuts?: {
          up?: string;
          down?: string;
          left?: string;
          right?: string;
          center?: string;
          fullscreen?: string;
          exitFullscreen?: string;
        };
      };
    };
  };
};

export const gamesMessages: Record<Locale, ExtendedGamesMessages> = {
  en: {
    "exploding-kittens": { name: "Exploding Cats" },
    "exploding-cats": { name: "Exploding Cats" },
    "texas-holdem": { name: "Texas Hold'em" },
    coup: { name: "Coup" },
    "pandemic-lite": { name: "Pandemic: Rapid Response" },
    lounge: {
      activeTitle: "Game Rooms",
      emptyTitle: "No rooms found. Create one to get started!",
      filters: {
        statusLabel: "Status",
        participationLabel: "Participation",
        status: {
          all: "All",
          lobby: "Lobby",
          in_progress: "In Progress",
          completed: "Completed",
        },
        participation: {
          all: "All",
          hosting: "Hosting",
          joined: "Joined",
          not_joined: "Not Joined",
        },
      },
    },
    rooms: {
      status: {
        lobby: "Lobby",
        in_progress: "In Progress",
        completed: "Completed",
      },
      hostedBy: "Hosted by {host}",
      participants: "Participants",
      hostLabel: "Hosted by",
      playersLabel: "Players",
      statusLabel: "Status",
      visibilityLabel: "Visibility",
      visibility: {
        public: "Public",
        private: "Private",
      },
    },
    room: {
      gameArea: "Game area - Real-time game integration coming soon",
    },
    detail: {
      title: "Game Rooms",
      empty: "No rooms found for this game",
    },
    common: {
      createRoom: "Create Room",
      joinRoom: "Join Room",
      joining: "Joining...",
      watchRoom: "Watch",
    },
    create: {
      title: "Create Game Room",
      sectionGame: "Select Game",
      sectionDetails: "Room Details",
      fieldName: "Room Name",
      namePlaceholder: "Enter room name",
      fieldMaxPlayers: "Max Players (optional)",
      maxPlayersAria: "Maximum number of players",
      autoPlaceholder: "Auto",
      fieldVisibility: "Visibility",
      fieldNotes: "Notes (optional)",
      notesPlaceholder: "Add notes...",
      notesAria: "Additional notes for the room",
      submitCreating: "Creating...",
    },
    roomPage: {
      loading: "Loading...",
      loadingGame: "Loading game...",
      errors: {
        notAuthenticated: "You must be logged in to view this game room.",
        loginButton: "Go to Login",
        loadingRoom: "Loading room...",
        roomNotFound: "Room not found",
        unsupportedGame: "Unsupported game type: {gameId}",
      },
    },
    table: {
      cards: {
        explodingCat: "Exploding Cat",
        defuse: "Defuse",
        attack: "Attack",
        skip: "Skip",
        favor: "Favor",
        shuffle: "Shuffle",
        seeTheFuture: "See the Future",
        tacocat: "Tacocat",
        hairyPotatoCat: "Hairy Potato Cat",
        rainbowRalphingCat: "Rainbow-Ralphing Cat",
        cattermelon: "Cattermelon",
        beardedCat: "Bearded Cat",
        generic: "Cat",
      },
      actions: {
        start: "Start Game",
        starting: "Starting...",
        draw: "Draw Card",
        drawing: "Drawing...",
        playSkip: "Play Skip",
        playingSkip: "Playing...",
        playAttack: "Play Attack",
        playingAttack: "Playing...",
      },
      state: {
        deck: "Deck",
        discard: "Discard",
        pendingDraws: "Pending draws",
        cards: "cards",
        card: "card",
      },
      players: {
        you: "You",
        alive: "Alive",
        eliminated: "Eliminated",
        yourTurn: "Your turn",
        waitingFor: "Waiting for player...",
      },
      lobby: {
        waitingToStart: "Waiting for game to start...",
        playersInLobby: "players in lobby",
        needTwoPlayers: "Need at least 2 players to start",
        hostCanStart: "Click 'Start Game' when ready",
        waitingForHost: "Waiting for host to start the game",
      },
      hand: {
        title: "Your Hand",
        empty: "No cards",
      },
      log: {
        title: "Game Log",
        empty: "No activity yet",
      },
      chat: {
        title: "Table Chat",
        empty: "No messages yet. Break the ice!",
        send: "Send",
        show: "Show Chat",
        hide: "Hide Chat",
        placeholderAll: "Send a note to everyone at the table",
        placeholderPlayers: "Send a note only to active players",
        hintAll: "Visible to everyone in room",
        hintPlayers: "Visible to alive players only",
        scope: {
          all: "All",
          players: "Players",
        },
      },
      eliminated: {
        title: "You have been eliminated!",
        message: "Watch the remaining players battle it out",
      },
      fullscreen: {
        enter: "Enter fullscreen (F)",
        exit: "Exit fullscreen (Esc)",
        hint: "Press F to toggle fullscreen",
      },
      controlPanel: {
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit fullscreen",
        enterFullscreen: "Enter fullscreen",
        leaveRoom: "Leave",
        moveControls: {
          moveUp: "Move Up",
          moveDown: "Move Down",
          moveLeft: "Move Left",
          moveRight: "Move Right",
          centerView: "Center View",
          shortcuts: {
            up: "W/Arrow Up",
            down: "S/Arrow Down",
            left: "A/Arrow Left",
            right: "D/Arrow Right",
            center: "C",
            fullscreen: "F",
            exitFullscreen: "Esc",
          },
        },
      },
    },
  },
  es: {
    lounge: {
      activeTitle: "Salas de Juego",
      emptyTitle: "No se encontraron salas. ¡Crea una para empezar!",
      filters: {
        statusLabel: "Estado",
        participationLabel: "Participación",
        status: {
          all: "Todos",
          lobby: "Sala de espera",
          in_progress: "En progreso",
          completed: "Completado",
        },
        participation: {
          all: "Todos",
          hosting: "Anfitrión",
          joined: "Unido",
          not_joined: "No unido",
        },
      },
    },
    rooms: {
      status: {
        lobby: "Sala de espera",
        in_progress: "En progreso",
        completed: "Completado",
      },
      hostedBy: "Anfitrión: {host}",
      participants: "Participantes",
      hostLabel: "Anfitrión",
      playersLabel: "Jugadores",
      statusLabel: "Estado",
      visibilityLabel: "Visibilidad",
      visibility: {
        public: "Pública",
        private: "Privada",
      },
    },
    room: {
      gameArea: "Área de juego - Integración en tiempo real próximamente",
    },
    detail: {
      title: "Salas de Juego",
      empty: "No se encontraron salas para este juego",
    },
    common: {
      createRoom: "Crear Sala",
      joinRoom: "Unirse a Sala",
      joining: "Uniéndose...",
      watchRoom: "Ver",
    },
    create: {
      title: "Crear Sala de Juego",
      sectionGame: "Seleccionar Juego",
      sectionDetails: "Detalles de la Sala",
      fieldName: "Nombre de la Sala",
      namePlaceholder: "Ingresa el nombre de la sala",
      fieldMaxPlayers: "Jugadores Máximos (opcional)",
      maxPlayersAria: "Número máximo de jugadores",
      autoPlaceholder: "Automático",
      fieldVisibility: "Visibilidad",
      fieldNotes: "Notas (opcional)",
      notesPlaceholder: "Agregar notas...",
      notesAria: "Notas adicionales para la sala",
      submitCreating: "Creando...",
    },
    roomPage: {
      loading: "Cargando...",
      loadingGame: "Cargando juego...",
      errors: {
        notAuthenticated: "Debe iniciar sesión para ver esta sala de juego.",
        loginButton: "Ir a Iniciar Sesión",
        loadingRoom: "Cargando sala...",
        roomNotFound: "Sala no encontrada",
        unsupportedGame: "Tipo de juego no compatible: {gameId}",
      },
    },
    table: {
      cards: {
        explodingCat: "Gato Explosivo",
        defuse: "Desactivar",
        attack: "Ataque",
        skip: "Saltar",
        favor: "Favor",
        shuffle: "Mezclar",
        seeTheFuture: "Ver el Futuro",
        tacocat: "Gato Taco",
        hairyPotatoCat: "Gato Papa Peludo",
        rainbowRalphingCat: "Gato Arcoíris",
        cattermelon: "Gato Sandía",
        beardedCat: "Gato Barbudo",
        generic: "Gato",
      },
      actions: {
        start: "Iniciar Juego",
        starting: "Iniciando...",
        draw: "Robar Carta",
        drawing: "Robando...",
        playSkip: "Jugar Saltar",
        playingSkip: "Jugando...",
        playAttack: "Jugar Ataque",
        playingAttack: "Jugando...",
      },
      state: {
        deck: "Mazo",
        discard: "Descarte",
        pendingDraws: "Robos pendientes",
        cards: "cartas",
        card: "carta",
      },
      players: {
        you: "Tú",
        alive: "Vivo",
        eliminated: "Eliminado",
        yourTurn: "Tu turno",
        waitingFor: "Esperando jugador...",
      },
      lobby: {
        waitingToStart: "Esperando que comience el juego...",
        playersInLobby: "jugadores en la sala",
        needTwoPlayers: "Se necesitan al menos 2 jugadores para comenzar",
        hostCanStart: "Haz clic en 'Iniciar Juego' cuando estés listo",
        waitingForHost: "Esperando que el anfitrión inicie el juego",
      },
      hand: {
        title: "Tu Mano",
        empty: "Sin cartas",
      },
      log: {
        title: "Registro del Juego",
        empty: "Sin actividad aún",
      },
      chat: {
        title: "Chat de la Mesa",
        empty: "Sin mensajes aún. ¡Rompe el hielo!",
        send: "Enviar",
        show: "Mostrar chat",
        hide: "Ocultar chat",
        placeholderAll: "Envía una nota a todos en la mesa",
        placeholderPlayers: "Envía una nota solo a los jugadores activos",
        hintAll: "Visible para todos en la sala",
        hintPlayers: "Visible solo para jugadores vivos",
        scope: {
          all: "Todos",
          players: "Jugadores",
        },
      },
      eliminated: {
        title: "¡Has sido eliminado!",
        message: "Observa cómo los jugadores restantes batallan",
      },
      fullscreen: {
        enter: "Pantalla completa (F)",
        exit: "Salir de pantalla completa (Esc)",
        hint: "Presiona F para pantalla completa",
      },
      controlPanel: {
        fullscreen: "Pantalla completa",
        exitFullscreen: "Salir de pantalla completa",
        enterFullscreen: "Entrar en pantalla completa",
        leaveRoom: "Salir",
        moveControls: {
          moveUp: "Mover arriba",
          moveDown: "Mover abajo",
          moveLeft: "Mover izquierda",
          moveRight: "Mover derecha",
          centerView: "Centrar vista",
          shortcuts: {
            up: "W/Flecha arriba",
            down: "S/Flecha abajo",
            left: "A/Flecha izquierda",
            right: "D/Flecha derecha",
            center: "C",
            fullscreen: "F",
            exitFullscreen: "Esc",
          },
        },
      },
    },
  },
  fr: {
    lounge: {
      activeTitle: "Salles de Jeu",
      emptyTitle: "Aucune salle trouvée. Créez-en une pour commencer !",
      filters: {
        statusLabel: "Statut",
        participationLabel: "Participation",
        status: {
          all: "Tous",
          lobby: "Salon d'attente",
          in_progress: "En cours",
          completed: "Terminé",
        },
        participation: {
          all: "Tous",
          hosting: "Hôte",
          joined: "Rejoint",
          not_joined: "Non rejoint",
        },
      },
    },
    rooms: {
      status: {
        lobby: "Salon d'attente",
        in_progress: "En cours",
        completed: "Terminé",
      },
      hostedBy: "Hébergé par {host}",
      participants: "Participants",
      hostLabel: "Hébergé par",
      playersLabel: "Joueurs",
      statusLabel: "Statut",
      visibilityLabel: "Visibilité",
      visibility: {
        public: "Publique",
        private: "Privée",
      },
    },
    room: {
      gameArea: "Zone de jeu - Intégration en temps réel bientôt disponible",
    },
    detail: {
      title: "Salles de Jeu",
      empty: "Aucune salle trouvée pour ce jeu",
    },
    common: {
      createRoom: "Créer une Salle",
      joinRoom: "Rejoindre une Salle",
      joining: "Rejoindre...",
      watchRoom: "Regarder",
    },
    create: {
      title: "Créer une Salle de Jeu",
      sectionGame: "Sélectionner un Jeu",
      sectionDetails: "Détails de la Salle",
      fieldName: "Nom de la Salle",
      namePlaceholder: "Entrez le nom de la salle",
      fieldMaxPlayers: "Joueurs Maximum (optionnel)",
      maxPlayersAria: "Nombre maximum de joueurs",
      autoPlaceholder: "Automatique",
      fieldVisibility: "Visibilité",
      fieldNotes: "Notes (optionnel)",
      notesPlaceholder: "Ajouter des notes...",
      notesAria: "Notes supplémentaires pour la salle",
      submitCreating: "Création...",
    },
    roomPage: {
      loading: "Chargement...",
      loadingGame: "Chargement du jeu...",
      errors: {
        notAuthenticated: "Vous devez vous connecter pour voir cette salle de jeu.",
        loginButton: "Aller à la Connexion",
        loadingRoom: "Chargement de la salle...",
        roomNotFound: "Salle non trouvée",
        unsupportedGame: "Type de jeu non pris en charge: {gameId}",
      },
    },
    table: {
      cards: {
        explodingCat: "Chat Explosif",
        defuse: "Désamorcer",
        attack: "Attaque",
        skip: "Passer",
        favor: "Faveur",
        shuffle: "Mélanger",
        seeTheFuture: "Voir l'Avenir",
        tacocat: "Chat Taco",
        hairyPotatoCat: "Chat Patate Poilu",
        rainbowRalphingCat: "Chat Arc-en-ciel",
        cattermelon: "Chat Pastèque",
        beardedCat: "Chat Barbu",
        generic: "Chat",
      },
      actions: {
        start: "Démarrer la Partie",
        starting: "Démarrage...",
        draw: "Piocher une Carte",
        drawing: "Pioche...",
        playSkip: "Jouer Passer",
        playingSkip: "En cours...",
        playAttack: "Jouer Attaque",
        playingAttack: "En cours...",
      },
      state: {
        deck: "Paquet",
        discard: "Défausse",
        pendingDraws: "Pioches en attente",
        cards: "cartes",
        card: "carte",
      },
      players: {
        you: "Vous",
        alive: "En vie",
        eliminated: "Éliminé",
        yourTurn: "Votre tour",
        waitingFor: "En attente d'un joueur...",
      },
      lobby: {
        waitingToStart: "En attente du début de la partie...",
        playersInLobby: "joueurs dans le salon",
        needTwoPlayers: "Au moins 2 joueurs sont nécessaires pour commencer",
        hostCanStart: "Cliquez sur 'Démarrer la Partie' quand vous êtes prêt",
        waitingForHost: "En attente que l'hôte démarre la partie",
      },
      hand: {
        title: "Votre Main",
        empty: "Aucune carte",
      },
      log: {
        title: "Journal de la Partie",
        empty: "Aucune activité pour le moment",
      },
      chat: {
        title: "Chat de Table",
        empty: "Aucun message. Lancez la conversation !",
        send: "Envoyer",
        show: "Afficher le chat",
        hide: "Masquer le chat",
        placeholderAll: "Envoyez une note à toute la table",
        placeholderPlayers: "Envoyez une note uniquement aux joueurs actifs",
        hintAll: "Visible par tout le monde dans la salle",
        hintPlayers: "Visible uniquement par les joueurs encore en vie",
        scope: {
          all: "Tous",
          players: "Joueurs",
        },
      },
      eliminated: {
        title: "Vous avez été éliminé !",
        message: "Regardez les joueurs restants se battre",
      },
      fullscreen: {
        enter: "Plein écran (F)",
        exit: "Quitter le plein écran (Échap)",
        hint: "Appuyez sur F pour le plein écran",
      },
      controlPanel: {
        fullscreen: "Plein écran",
        exitFullscreen: "Quitter le plein écran",
        enterFullscreen: "Entrer en plein écran",
        leaveRoom: "Quitter",
        moveControls: {
          moveUp: "Déplacer vers le haut",
          moveDown: "Déplacer vers le bas",
          moveLeft: "Déplacer vers la gauche",
          moveRight: "Déplacer vers la droite",
          centerView: "Centrer la vue",
          shortcuts: {
            up: "W/Flèche haut",
            down: "S/Flèche bas",
            left: "A/Flèche gauche",
            right: "D/Flèche droite",
            center: "C",
            fullscreen: "F",
            exitFullscreen: "Échap",
          },
        },
      },
    },
  },
};
