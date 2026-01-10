// Room list/card display messages
export const roomsMessages = {
  en: {
    status: {
      lobby: 'Lobby open',
      inProgress: 'Match running',
      completed: 'Session wrapped',
      unknown: 'Unknown status',
    },
    capacityWithMax: '{{current}}/{{max}} players',
    capacityWithoutMax: '{{count}} players',
    hostedBy: 'Hosted by {{host}}',
    visibility: {
      private: 'Invite only',
      public: 'Open lobby',
    },
    created: 'Created {{timestamp}}',
    unknownGame: 'Unknown game',
    mysteryHost: 'mystery captain',
    justCreated: 'Just created',
    fastRoom: 'Fast room',
  },
  es: {
    status: {
      lobby: 'Lobby abierto',
      inProgress: 'Partida en curso',
      completed: 'Sesión terminada',
      unknown: 'Estado desconocido',
    },
    capacityWithMax: '{{current}}/{{max}} jugadores',
    capacityWithoutMax: '{{count}} jugadores',
    hostedBy: 'Organizado por {{host}}',
    visibility: {
      private: 'Solo con invitación',
      public: 'Lobby abierto',
    },
    created: 'Creada {{timestamp}}',
    unknownGame: 'Juego desconocido',
    mysteryHost: 'anfitrión misterioso',
    justCreated: 'Recién creada',
    fastRoom: 'Partida rápida',
  },
  fr: {
    status: {
      lobby: 'Lobby ouvert',
      inProgress: 'Partie en cours',
      completed: 'Session terminée',
      unknown: 'Statut inconnu',
    },
    capacityWithMax: '{{current}}/{{max}} joueurs',
    capacityWithoutMax: '{{count}} joueurs',
    hostedBy: 'Animé par {{host}}',
    visibility: {
      private: 'Sur invitation',
      public: 'Lobby ouvert',
    },
    created: 'Créée {{timestamp}}',
    unknownGame: 'Jeu inconnu',
    unknownHost: 'Hôte inconnu',
    mysteryHost: 'capitaine mystère',
    justCreated: 'Tout juste créée',
    fastRoom: 'Partie rapide',
  },
};
