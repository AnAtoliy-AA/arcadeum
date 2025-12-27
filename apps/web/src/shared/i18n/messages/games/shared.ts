import type { Locale } from '../../types';

export const sharedMessages = {
  en: {
    coup: { name: 'Coup' },
    'pandemic-lite': { name: 'Pandemic: Rapid Response' },
    lounge: {
      activeTitle: 'Game Rooms',
      emptyTitle: 'No rooms found. Create one to get started!',
      loadingRooms: 'Loading rooms...',
      participantsCount: '{count} participants',
      filters: {
        statusLabel: 'Status',
        participationLabel: 'Participation',
        status: {
          all: 'All',
          lobby: 'Lobby',
          in_progress: 'In Progress',
          completed: 'Completed',
        },
        participation: {
          all: 'All',
          hosting: 'Hosting',
          joined: 'Joined',
          not_joined: 'Not Joined',
        },
      },
    },
    rooms: {
      status: {
        lobby: 'Lobby',
        in_progress: 'In Progress',
        completed: 'Completed',
      },
      hostedBy: 'Hosted by {host}',
      participants: 'Participants',
      hostLabel: 'Hosted by',
      playersLabel: 'Players',
      statusLabel: 'Status',
      visibilityLabel: 'Visibility',
      visibility: {
        public: 'Public',
        private: 'Private',
      },
    },
    room: {
      gameArea: 'Game area - Real-time game integration coming soon',
      loading: 'Server is loading...',
      pendingNotice: {
        title: 'Free hosts are spinning back up...',
        message:
          'Our free-tier backend servers snooze when idle, so everything is stretching its legs. Back us on the support page to help keep it running 24/7!',
      },
    },
    detail: {
      title: 'Game Rooms',
      empty: 'No rooms found for this game',
    },
    common: {
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      joining: 'Joining...',
      watchRoom: 'Watch',
    },
    create: {
      title: 'Create Game Room',
      sectionGame: 'Select Game',
      sectionDetails: 'Room Details',
      fieldName: 'Room Name',
      namePlaceholder: 'Enter room name',
      fieldMaxPlayers: 'Max Players (optional)',
      maxPlayersAria: 'Maximum number of players',
      autoPlaceholder: 'Auto',
      fieldVisibility: 'Visibility',
      fieldNotes: 'Notes (optional)',
      notesPlaceholder: 'Add notes...',
      notesAria: 'Additional notes for the room',
      submitCreating: 'Creating...',
    },
    roomPage: {
      loading: 'Loading...',
      loadingGame: 'Loading game...',
      errors: {
        notAuthenticated: 'You must be logged in to view this game room.',
        loginButton: 'Go to Login',
        loadingRoom: 'Loading room...',
        roomNotFound: 'Room not found',
        unsupportedGame: 'Unsupported game type: {gameId}',
        privateRoomError: 'This is a private room. Please log in to access it.',
        roomNotFoundError: 'Room not found',
        failedToLoadError: 'Failed to load room',
        failedToCheckAccess: 'Failed to check room access',
      },
    },
  },
  es: {
    lounge: {
      activeTitle: 'Salas de Juego',
      emptyTitle: 'No se encontraron salas. ¡Crea una para empezar!',
      loadingRooms: 'Cargando salas...',
      participantsCount: '{count} participantes',
      filters: {
        statusLabel: 'Estado',
        participationLabel: 'Participación',
        status: {
          all: 'Todos',
          lobby: 'Sala de espera',
          in_progress: 'En progreso',
          completed: 'Completado',
        },
        participation: {
          all: 'Todos',
          hosting: 'Anfitrión',
          joined: 'Unido',
          not_joined: 'No unido',
        },
      },
    },
    rooms: {
      status: {
        lobby: 'Sala de espera',
        in_progress: 'En progreso',
        completed: 'Completado',
      },
      hostedBy: 'Anfitrión: {host}',
      participants: 'Participantes',
      hostLabel: 'Anfitrión',
      playersLabel: 'Jugadores',
      statusLabel: 'Estado',
      visibilityLabel: 'Visibilidad',
      visibility: {
        public: 'Pública',
        private: 'Privada',
      },
    },
    room: {
      gameArea: 'Área de juego - Integración en tiempo real próximamente',
      loading: 'Cargando servidor...',
      pendingNotice: {
        title: 'Los servidores gratuitos están reactivándose...',
        message:
          'Nuestros servidores de backend gratuitos se duermen si no hay tráfico, así que ahora mismo están despertando. Visita la página de soporte para ayudarnos a mantenerlos activos.',
      },
    },
    detail: {
      title: 'Salas de Juego',
      empty: 'No se encontraron salas para este juego',
    },
    common: {
      createRoom: 'Crear Sala',
      joinRoom: 'Unirse a Sala',
      joining: 'Uniéndose...',
      watchRoom: 'Ver',
    },
    create: {
      title: 'Crear Sala de Juego',
      sectionGame: 'Seleccionar Juego',
      sectionDetails: 'Detalles de la Sala',
      fieldName: 'Nombre de la Sala',
      namePlaceholder: 'Ingresa el nombre de la sala',
      fieldMaxPlayers: 'Jugadores Máximos (opcional)',
      maxPlayersAria: 'Número máximo de jugadores',
      autoPlaceholder: 'Automático',
      fieldVisibility: 'Visibilidad',
      fieldNotes: 'Notas (opcional)',
      notesPlaceholder: 'Agregar notas...',
      notesAria: 'Notas adicionales para la sala',
      submitCreating: 'Creando...',
    },
    roomPage: {
      loading: 'Cargando...',
      loadingGame: 'Cargando juego...',
      errors: {
        notAuthenticated: 'Debe iniciar sesión para ver esta sala de juego.',
        loginButton: 'Ir a Iniciar Sesión',
        loadingRoom: 'Cargando sala...',
        roomNotFound: 'Sala no encontrada',
        unsupportedGame: 'Tipo de juego no compatible: {gameId}',
        privateRoomError:
          'Esta es una sala privada. Por favor inicie sesión para acceder.',
        roomNotFoundError: 'Sala no encontrada',
        failedToLoadError: 'Error al cargar la sala',
        failedToCheckAccess: 'Error al verificar acceso a la sala',
      },
    },
  },
  fr: {
    lounge: {
      activeTitle: 'Salles de Jeu',
      emptyTitle: 'Aucune salle trouvée. Créez-en une pour commencer !',
      loadingRooms: 'Chargement des salles...',
      participantsCount: '{count} participants',
      filters: {
        statusLabel: 'Statut',
        participationLabel: 'Participation',
        status: {
          all: 'Tous',
          lobby: "Salon d'attente",
          in_progress: 'En cours',
          completed: 'Terminé',
        },
        participation: {
          all: 'Tous',
          hosting: 'Hôte',
          joined: 'Rejoint',
          not_joined: 'Non rejoint',
        },
      },
    },
    rooms: {
      status: {
        lobby: "Salon d'attente",
        in_progress: 'En cours',
        completed: 'Terminé',
      },
      hostedBy: 'Hébergé par {host}',
      participants: 'Participants',
      hostLabel: 'Hébergé par',
      playersLabel: 'Joueurs',
      statusLabel: 'Statut',
      visibilityLabel: 'Visibilité',
      visibility: {
        public: 'Publique',
        private: 'Privée',
      },
    },
    room: {
      gameArea: 'Zone de jeu - Intégration en temps réel bientôt disponible',
      loading: 'Serveur en cours de chargement...',
      pendingNotice: {
        title: 'Les serveurs gratuits se relancent...',
        message:
          "Nos serveurs backend gratuits s'endorment quand ils sont inactifs, ils se remettent donc en route. Passe sur la page de soutien pour nous aider \u00e0 les garder \u00e9veill\u00e9s !",
      },
    },
    detail: {
      title: 'Salles de Jeu',
      empty: 'Aucune salle trouvée pour ce jeu',
    },
    common: {
      createRoom: 'Créer une Salle',
      joinRoom: 'Rejoindre une Salle',
      joining: 'Rejoindre...',
      watchRoom: 'Regarder',
    },
    create: {
      title: 'Créer une Salle de Jeu',
      sectionGame: 'Sélectionner un Jeu',
      sectionDetails: 'Détails de la Salle',
      fieldName: 'Nom de la Salle',
      namePlaceholder: 'Entrez le nom de la salle',
      fieldMaxPlayers: 'Joueurs Maximum (optionnel)',
      maxPlayersAria: 'Nombre maximum de joueurs',
      autoPlaceholder: 'Automatique',
      fieldVisibility: 'Visibilité',
      fieldNotes: 'Notes (optionnel)',
      notesPlaceholder: 'Ajouter des notes...',
      notesAria: 'Notes supplémentaires pour la salle',
      submitCreating: 'Création...',
    },
    roomPage: {
      loading: 'Chargement...',
      loadingGame: 'Chargement du jeu...',
      errors: {
        notAuthenticated:
          'Vous devez vous connecter pour voir cette salle de jeu.',
        loginButton: 'Aller à la Connexion',
        loadingRoom: 'Chargement de la salle...',
        roomNotFound: 'Salle non trouvée',
        unsupportedGame: 'Type de jeu non pris en charge: {gameId}',
        privateRoomError:
          'Ceci est une salle privée. Veuillez vous connecter pour y accéder.',
        roomNotFoundError: 'Salle non trouvée',
        failedToLoadError: 'Échec du chargement de la salle',
        failedToCheckAccess: "Échec de la vérification de l'accès à la salle",
      },
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

/** Derived type from the sharedMessages object - English locale structure */
export type SharedGamesMessages = (typeof sharedMessages)['en'];
