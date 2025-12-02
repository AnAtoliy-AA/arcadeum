// Game detail page and room detail page messages
export const gameDetailMessages = {
  en: {
    backToLobby: 'Browse games',
    emptyTitle: 'Game coming soon',
    emptyDescription: "We couldn't find that title. Browse the lounge for active prototypes and upcoming releases.",
    inviteButton: 'Invite friends',
    openRoomsTitle: 'Open rooms',
    openRoomsCaption: "Jump into a live lobby or create your own session if nothing's open yet.",
    highlightsTitle: 'Highlights',
    howToPlayTitle: 'How to play',
    howToPlayCaption: 'Three quick beats so new players can jump in without a rulebook.',
    comingSoonTitle: "What's next",
    comingSoonCaption: "We're polishing these systems before the public beta drops.",
    refresh: 'Refresh',
    loadingRooms: 'Loading rooms...',
    errorTitle: "Can't fetch rooms",
    emptyRoomsTitle: 'No rooms open yet',
    emptyRoomsCaption: 'Check back soon or start the first lobby yourself.'
  },
  es: {
    backToLobby: 'Explorar juegos',
    emptyTitle: 'Juego disponible pronto',
    emptyDescription:
      'No encontramos ese título. Explora el salón para ver prototipos activos y próximos lanzamientos.',
    inviteButton: 'Invitar amigos',
    openRoomsTitle: 'Salas abiertas',
    openRoomsCaption:
      'Únete a un lobby activo o crea tu propia sesión si no hay otra abierta.',
    highlightsTitle: 'Destacados',
    howToPlayTitle: 'Cómo jugar',
    howToPlayCaption:
      'Tres consejos rápidos para que los nuevos jugadores se unan sin manual.',
    comingSoonTitle: 'Qué sigue',
    comingSoonCaption:
      'Estamos puliendo estos sistemas antes del lanzamiento público de la beta.',
    refresh: 'Actualizar',
    loadingRooms: 'Cargando salas...',
    errorTitle: 'No se pueden obtener las salas',
    emptyRoomsTitle: 'No hay salas abiertas aún',
    emptyRoomsCaption: 'Vuelve pronto o lanza tú el primer lobby.',
  },
  fr: {
    backToLobby: 'Explorer les jeux',
    emptyTitle: 'Jeu à venir',
    emptyDescription:
      "Nous n'avons pas trouvé ce titre. Parcourez le salon pour découvrir les prototypes actifs et les sorties à venir.",
    inviteButton: 'Inviter des amis',
    openRoomsTitle: 'Salles ouvertes',
    openRoomsCaption:
      "Rejoignez un lobby actif ou créez votre propre session si aucune n'est disponible.",
    highlightsTitle: 'Points forts',
    howToPlayTitle: 'Comment jouer',
    howToPlayCaption:
      'Trois repères rapides pour que les nouveaux joueurs se lancent sans livret de règles.',
    comingSoonTitle: 'Et ensuite',
    comingSoonCaption:
      'Nous peaufinons ces systèmes avant la sortie de la bêta publique.',
    refresh: 'Actualiser',
    loadingRooms: 'Chargement des salles...',
    errorTitle: 'Impossible de récupérer les salles',
    emptyRoomsTitle: 'Aucune salle ouverte pour le moment',
    emptyRoomsCaption:
      'Revenez bientôt ou lancez vous-même le premier lobby.',
  },
};

export const roomDetailMessages = {
  en: {
    defaultName: 'Game room',
    heroTagline: 'Match lobby overview',
    controlsTitle: 'Room controls',
    controlsSubtitle: 'Quick actions for hosts and players.',
    hostLabel: 'Host',
    gameLabel: 'Game',
    createdLabel: 'Created',
    playersLabel: 'Players',
    meta: {
      host: 'Host',
      players: 'Players',
      created: 'Created',
      access: 'Access',
      inviteCode: 'Invite code'
    },
    loading: 'Syncing room details...',
    preparationTitle: 'Table preparation',
    preparationCopy: "We'll guide players through setup, turn flow, and scoring once the interactive tabletop is ready. For now, coordinate in chat, review the rules, and gather your crew while we finish the real-time experience.",
    waitingTitle: 'Waiting on more players?',
    waitingCopy: "Keep this screen open—we'll auto-refresh the lobby when teammates join or the host starts the match.",
    errors: {
      signInRequired: 'Sign in to load room details.',
      notFound: 'Room not found. The invite link may be incomplete.',
      inactive: 'This room is no longer active or you have left the lobby.'
    },
    buttons: {
      viewGame: 'View game',
      deleteRoom: 'Delete room',
      enterFullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      hideControls: 'Hide controls',
      showControls: 'Show controls'
    }
  },
  es: {
    defaultName: 'Sala de juego',
    heroTagline: 'Resumen del lobby',
    controlsTitle: 'Controles de la sala',
    controlsSubtitle: 'Acciones rápidas para anfitriones y jugadores.',
    hostLabel: 'Anfitrión',
    gameLabel: 'Juego',
    createdLabel: 'Creada',
    playersLabel: 'Jugadores',
    meta: {
      host: 'Anfitrión',
      players: 'Jugadores',
      created: 'Creada',
      access: 'Acceso',
      inviteCode: 'Código de invitación',
    },
    loading: 'Sincronizando detalles de la sala...',
    preparationTitle: 'Preparación de la mesa',
    preparationCopy:
      'Te guiaremos por la preparación, los turnos y la puntuación cuando la mesa interactiva esté lista. Mientras tanto, coordina por chat, repasa las reglas y reúne a tu equipo mientras terminamos la experiencia en tiempo real.',
    waitingTitle: '¿Esperando a más jugadores?',
    waitingCopy:
      'Mantén esta pantalla abierta: actualizaremos el lobby automáticamente cuando entren compañeros o el anfitrión inicie la partida.',
    errors: {
      signInRequired: 'Inicia sesión para cargar los detalles de la sala.',
      notFound:
        'Sala no encontrada. El enlace de invitación puede estar incompleto.',
      inactive: 'Esta sala ya no está activa o has abandonado el lobby.',
    },
    buttons: {
      viewGame: 'Ver juego',
      deleteRoom: 'Eliminar sala',
      enterFullscreen: 'Pantalla completa',
      exitFullscreen: 'Salir de pantalla completa',
      hideControls: 'Ocultar controles',
      showControls: 'Mostrar controles',
    },
  },
  fr: {
    defaultName: 'Salle de jeu',
    heroTagline: 'Vue d’ensemble du lobby',
    controlsTitle: 'Contrôles de la salle',
    controlsSubtitle: 'Actions rapides pour hôtes et joueurs.',
    hostLabel: 'Hôte',
    gameLabel: 'Jeu',
    createdLabel: 'Créée',
    playersLabel: 'Joueurs',
    meta: {
      host: 'Hôte',
      players: 'Joueurs',
      created: 'Créée',
      access: 'Accès',
      inviteCode: "Code d'invitation",
    },
    loading: 'Synchronisation des détails de la salle...',
    preparationTitle: 'Préparation de la table',
    preparationCopy:
      "Nous vous guiderons dans la mise en place, le déroulement des tours et le score dès que la table interactive sera prête. En attendant, coordonnez-vous dans le chat, relisez les règles et rassemblez votre équipe pendant que nous finalisons l'expérience en temps réel.",
    waitingTitle: 'En attente de joueurs ?',
    waitingCopy:
      "Gardez cet écran ouvert : nous actualiserons le lobby automatiquement quand des coéquipiers rejoignent ou que l'hôte lance la partie.",
    errors: {
      signInRequired:
        'Connectez-vous pour charger les détails de la salle.',
      notFound:
        "Salle introuvable. Le lien d'invitation est peut-être incomplet.",
      inactive:
        "Cette salle n'est plus active ou vous avez quitté le lobby.",
    },
    buttons: {
      viewGame: 'Voir le jeu',
      deleteRoom: 'Supprimer la salle',
      enterFullscreen: 'Plein écran',
      exitFullscreen: 'Quitter le plein écran',
      hideControls: 'Masquer les contrôles',
      showControls: 'Afficher les contrôles',
    },
  },
};
