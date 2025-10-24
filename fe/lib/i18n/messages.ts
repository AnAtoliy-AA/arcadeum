import type { TranslationLeafPaths, TranslationMap } from "./types";

export const translations = {
  en: {
    navigation: {
      homeTab: "Home",
      gamesTab: "Games",
      chatsTab: "Chats",
      settingsTitle: "Settings",
      openSettingsHint: "Open settings",
    },
    common: {
      learnMore: "Learn more",
      cancel: "Cancel",
      signIn: "Sign in",
      back: "Back",
      retry: "Retry",
      loading: "Loading...",
      actions: {
        login: "Login",
        logout: "Logout",
        register: "Register",
        openApp: "Open the app",
        getStarted: "Get started",
        leave: "Leave",
        stay: "Stay",
        ok: "OK",
      },
      prompts: {
        haveAccount: "Have an account?",
        needAccount: "Need an account?",
      },
      labels: {
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
      },
      statuses: {
        authenticated: "Authenticated",
      },
    },
    auth: {
      sections: {
        oauth: "OAuth",
        local: "Login",
      },
      shortcuts: {
        browseGames: "Browse games without signing in",
      },
      oauth: {
        loginButton: "Login with OAuth",
        authorizationCodeLabel: "Authorization Code",
        accessTokenLabel: "Access Token",
      },
      local: {
        heading: {
          register: "Create Account",
          login: "Login",
        },
        helper: {
          allowedCharacters:
            "Allowed characters: letters, numbers, underscores, hyphens",
        },
        errors: {
          passwordMismatch: "Passwords do not match",
          usernameTooShort: "Username must be at least 3 characters",
        },
      },
    },
    chat: {
      notFound: "Chat not found",
      nav: {
        backToChats: "Back to chats",
        goHome: "Go to home",
      },
      status: {
        connected: "Connected to chat server",
        connecting: "Connecting...",
      },
    },
    chatList: {
      search: {
        placeholder: "Search users by username or email",
        searching: "Searching...",
        signInRequired: "Sign in to start a chat.",
        noResults: "No users found.",
      },
      messages: {
        directChat: "Direct chat",
        noMessagesYet: "No messages yet",
      },
      empty: {
        unauthenticated: "Sign in to view your chats.",
        noChats: "No chats yet.",
      },
      errors: {
        authRequired: "You need to be signed in to start a chat.",
      },
    },
    games: {
      common: {
        newRoom: "New room",
        createRoom: "Create room",
        joinRoom: "Join room",
        watchRoom: "Watch room",
        viewRules: "View rules",
        invitePending: "pending",
      },
      lounge: {
        title: "Tabletop Lounge",
        subtitle:
          "Spin up real-time rooms, invite your friends, and let AICO handle rules, scoring, and moderation.",
        featuredTitle: "Featured games",
        featuredCaption:
          "Early access titles we're polishing for launch. Tap to explore rules and reserve a playtest slot.",
        activeTitle: "Active rooms",
        activeCaption:
          "Jump into a lobby that's already spinning up or scope what's happening live.",
        haveInvite: "Have an invite code?",
        loadingRooms: "Fetching rooms...",
        errorTitle: "Can't reach the lounge",
        emptyTitle: "No rooms yet",
        emptyDescription:
          "Be the trailblazer—kick off the first lobby or tap refresh to check again in a few.",
        footerTitle: "Want a specific game?",
        footerText:
          "Drop requests in #feature-votes or submit your own custom deck idea. Community picks go live every sprint.",
      },
      rooms: {
        status: {
          lobby: "Lobby open",
          inProgress: "Match running",
          completed: "Session wrapped",
          unknown: "Unknown status",
        },
        capacityWithMax: "{{current}}/{{max}} players",
        capacityWithoutMax: "{{count}} players",
        hostedBy: "Hosted by {{host}}",
        visibility: {
          private: "Invite only",
          public: "Open lobby",
        },
        created: "Created {{timestamp}}",
        unknownGame: "Unknown game",
        mysteryHost: "mystery captain",
        justCreated: "Just created",
      },
      alerts: {
        inviteRequired: "This lobby needs an invite code from the host.",
        inviteInvalid: "Invite code didn't work. Double-check and try again.",
        roomFullTitle: "Room is full",
        roomFullMessage:
          "That lobby has hit its player cap. Try another room or create your own.",
        roomFullManualMessage:
          "That lobby has already reached its player cap. Try another code or create a new room.",
        roomLockedTitle: "Match already started",
        roomLockedMessage:
          "This lobby is already in progress. Join a different room or check back later.",
        roomLockedManualMessage:
          "The host already kicked off that session. Ask them for a fresh invite code.",
        genericJoinFailedTitle: "Couldn't join room",
        signInRequiredTitle: "Sign in required",
        signInInviteMessage:
          "Log in to redeem an invite code and sync your seat with the host.",
        signInJoinMessage:
          "Log in to join a lobby and sync your seat with the host.",
        signInDetailMessage: "Log in to grab a seat in this lobby.",
        inviteInvalidManual:
          "We couldn't find a room with that invite code. Double-check the letters and try again.",
        inviteShareFailedTitle: "Invite not sent",
        inviteShareFailedMessage:
          "Copy a link or ping friends manually while we add native invites.",
        actionFailedTitle: "Action failed",
        genericError: "Something went wrong.",
        couldNotLeaveTitle: "Could not leave room",
        couldNotLeaveMessage: "Could not leave the room.",
        unableToStartTitle: "Unable to start match",
        unableToStartMessage: "Unable to start the match right now.",
        leavePromptTitle: "Leave this room?",
        leavePromptMessage:
          "You will give up your seat and may need a new invite to return.",
        deletePromptTitle: "Delete this room?",
        deletePromptMessage:
          "This will remove the lobby for everyone. Players will be disconnected immediately.",
        signInManageSeatMessage: "Sign in to manage your seat in this lobby.",
        signInTakeTurnMessage: "Log in to take turns at the table.",
        signInPlayCardMessage: "Log in to play action cards.",
        signInStartMatchMessage: "Sign in to start the match for this lobby.",
        roomDeletedTitle: "Room deleted",
        roomDeletedMessage: "This lobby has been removed by the host.",
      },
      inviteDialog: {
        title: "Enter invite code",
        placeholder: "ABC123",
        manualDescription:
          "Got an invite from a host? Enter their six-character code to hop into their lobby instantly.",
        roomDescriptionWithName:
          "This lobby is invite-only. Ask the host for their code to join “{{room}}”.",
        roomDescription:
          "This lobby is invite-only. Enter the code from the host to join.",
        helper:
          "We'll uppercase automatically—just type the letters you received.",
      },
      errors: {
        loadRooms: "Unable to load rooms right now.",
        loadRoomDetails: "Unable to load room details.",
      },
      share: {
        title: "Join me for {{game}}",
        message:
          "Jump into {{game}} on AICO. I'll create a room as soon as the prototype opens!",
      },
      create: {
        title: "Create a room",
        subtitle:
          "Pick your game, name the lobby, and share the invite with your crew.",
        sectionGame: "Game",
        sectionDetails: "Room details",
        sectionPreview: "Preview",
        fieldName: "Room name",
        namePlaceholder: "e.g. {{example}} squad",
        fieldMaxPlayers: "Max players",
        autoPlaceholder: "Auto",
        fieldVisibility: "Visibility",
        fieldNotes: "Notes",
        notesPlaceholder: "Rules, house twists, or reminders",
        visibilityPublic: "Public room",
        visibilityPrivate: "Private room",
        pillPublic: "Public",
        pillPrivate: "Private",
        loadingFallback: "Hold tight while we load your session...",
        submitCreating: "Creating...",
        submit: "Create room",
        alerts: {
          signInMessage: "Please sign in again to create a game room.",
          nameRequiredTitle: "Name required",
          nameRequiredMessage:
            "Give your room a fun name to help friends recognize it.",
          invalidPlayersTitle: "Invalid player count",
          invalidPlayersMessage:
            "Max players should be a number greater than or equal to 2.",
          roomCreatedTitle: "Room created",
          roomCreatedMessage: "Invite code: {{code}}",
          invitePending: "pending",
          createFailedTitle: "Couldn't create room",
          createFailedMessage: "Failed to create room.",
        },
      },
      detail: {
        backToLobby: "Browse games",
        emptyTitle: "Game coming soon",
        emptyDescription:
          "We couldn't find that title. Browse the lounge for active prototypes and upcoming releases.",
        inviteButton: "Invite friends",
        openRoomsTitle: "Open rooms",
        openRoomsCaption:
          "Jump into a live lobby or create your own session if nothing's open yet.",
        highlightsTitle: "Highlights",
        howToPlayTitle: "How to play",
        howToPlayCaption:
          "Three quick beats so new players can jump in without a rulebook.",
        comingSoonTitle: "What's next",
        comingSoonCaption:
          "We're polishing these systems before the public beta drops.",
        refresh: "Refresh",
        loadingRooms: "Loading rooms...",
        errorTitle: "Can't fetch rooms",
        emptyRoomsTitle: "No rooms open yet",
        emptyRoomsCaption: "Check back soon or start the first lobby yourself.",
      },
      room: {
        defaultName: "Game room",
        meta: {
          host: "Host",
          players: "Players",
          created: "Created",
          access: "Access",
          shortcuts: {
            browseGames: "Voir les salles sans se connecter",
          },
          inviteCode: "Invite code",
        },
        loading: "Syncing room details...",
        preparationTitle: "Table preparation",
        preparationCopy:
          "We'll guide players through setup, turn flow, and scoring once the interactive tabletop is ready. For now, coordinate in chat, review the rules, and gather your crew while we finish the real-time experience.",
        waitingTitle: "Waiting on more players?",
        waitingCopy:
          "Keep this screen open—we'll auto-refresh the lobby when teammates join or the host starts the match.",
        errors: {
          signInRequired: "Sign in to load room details.",
          notFound: "Room not found. The invite link may be incomplete.",
          inactive: "This room is no longer active or you have left the lobby.",
        },
        buttons: {
          viewGame: "View game",
          deleteRoom: "Delete room",
        },
      },
      table: {
        headerTitle: "Exploding Cats table",
        sessionStatus: {
          active: "Active",
          completed: "Completed",
          pending: "Pending",
          unknown: "Status unknown",
        },
        messageCompleted: "Session completed. Start a new match to play again.",
        info: {
          inDeck: "in deck",
          topDiscard: "last discarded card",
          empty: "Empty",
          none: "None",
          pendingSingular: "draw pending",
          pendingPlural: "draws pending",
        },
        seats: {
          cardsSingular: "{{count}} card",
          cardsPlural: "{{count}} cards",
          status: {
            alive: "Alive",
            out: "Out",
          },
        },
        hand: {
          title: "Your cards",
          cardLabel: "Card",
          empty: "No cards in hand",
          statusAlive: "Alive",
          statusOut: "Out",
          eliminatedNote:
            "You blew up this round. Hang tight for the next match.",
        },
        placeholder: {
          waiting: "Waiting for the host to start the interactive tabletop.",
          hostSuffix: "Fire it up when everyone is ready.",
        },
        actions: {
          start: "Start match",
          draw: "Draw card",
          playSkip: "Play Skip",
          playAttack: "Play Attack",
          playCatCombo: "Play Cat Combo",
        },
        logs: {
          title: "Recent turns",
        },
        cards: {
          explodingCat: "Exploding Cat",
          defuse: "Defuse",
          attack: "Attack",
          skip: "Skip",
          tacocat: "Tacocat",
          hairyPotatoCat: "Hairy Potato Cat",
          rainbowRalphingCat: "Rainbow-Ralphing Cat",
          cattermelon: "Cattermelon",
          beardedCat: "Bearded Cat",
          generic: "Cat",
        },
        cardDescriptions: {
          explodingCat: "Draw it without a Defuse and boom—you’re out of the round.",
          defuse: "Cancels an Exploding Cat and lets you tuck it back into the deck.",
          attack: "End your turn and make the next player draw two cards.",
          skip: "Finish your turn immediately without drawing.",
          tacocat: "Play two or three copies to steal a card from an opponent.",
          hairyPotatoCat: "Pairs or trios yank a random or named card.",
          rainbowRalphingCat: "Combo copies to snatch cards from another player.",
          cattermelon: "Collect duplicates to swipe cards and set up combos.",
          beardedCat: "Pairs or trios swipe cards straight from rivals.",
          generic: "Cat cards need pairs or trios to trigger their steal effects.",
        },
        catCombo: {
          title: "Play a combo with {{card}}",
          description:
            "Pick a combo type, choose who to target, and confirm the effect.",
          modePair: "Pair (2 cards)",
          modeTrio: "Trio (3 cards)",
          targetLabel: "Select a target player",
          noTargets: "No eligible targets right now.",
          desiredCardLabel: "Request a specific card",
          optionPair: "Pair ready",
          optionTrio: "Trio ready",
          optionPairOrTrio: "Pair or trio ready",
          cancel: "Cancel",
          confirm: "Play combo",
        },
      },
    },
    home: {
      welcomeTitle: "Welcome!",
      step1Title: "Step 1: Try it",
      step1Body:
        "Edit {{file}} to see changes. Press {{shortcut}} to open developer tools.",
      step2Title: "Step 2: Personalize",
      step2Body: "Open Settings to manage your preferences and account access.",
      step3Title: "Step 3: Get a fresh start",
      step3Body:
        "When you're ready, run {{command}} to get a fresh {{appName}} directory. This will move the current {{appName}} to {{exampleName}}.",
    },
    welcome: {
      tagline: "Intelligent, secure, and extensible real-time collaboration.",
      description:
        "Experience OAuth and local email/password authentication, JWT access with upcoming refresh rotation, and real-time messaging powered by websockets. This playground app demonstrates secure patterns, modular architecture, and theming for mobile and web via Expo.",
      runningOn: "Running on {{platform}}",
    },
    settings: {
      appearanceTitle: "Appearance",
      appearanceDescription:
        "Tweak how the interface looks regardless of your device theme.",
      themeOptions: {
        system: {
          label: "System default",
          description: "Follow your device appearance settings.",
        },
        light: {
          label: "Light",
          description: "Always use the light interface.",
        },
        dark: {
          label: "Dark",
          description: "Always use the dark interface.",
        },
      },
      languageTitle: "Language",
      languageDescription:
        "Choose the language you prefer for in-app copy. We're rolling out more translations soon.",
      languageOptions: {
        en: "English",
        es: "Español",
        fr: "Français",
      },
      activeSelection: "Active selection",
      tapToSwitch: "Tap to switch",
      accountTitle: "Account",
      accountDescription:
        "Manage your sign-in status and session tokens for this device.",
      accountSignedOut: "You are browsing without signing in.",
      signedInAs: "Signed in as {{user}}",
    },
  },
  es: {
    navigation: {
      homeTab: "Inicio",
      gamesTab: "Juegos",
      chatsTab: "Chats",
      settingsTitle: "Ajustes",
      openSettingsHint: "Abrir ajustes",
    },
    common: {
      learnMore: "Más información",
      cancel: "Cancelar",
      signIn: "Iniciar sesión",
      back: "Atrás",
      retry: "Reintentar",
      loading: "Cargando...",
      actions: {
        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        register: "Registrarse",
        openApp: "Abrir la app",
        getStarted: "Comenzar",
        leave: "Salir",
        stay: "Quedarse",
        ok: "Aceptar",
      },
      prompts: {
        haveAccount: "¿Ya tienes cuenta?",
        needAccount: "¿Necesitas una cuenta?",
      },
      labels: {
        username: "Nombre de usuario",
        email: "Correo electrónico",
        password: "Contraseña",
        confirmPassword: "Confirmar contraseña",
      },
      statuses: {
        authenticated: "Autenticado",
      },
    },
    auth: {
      sections: {
        oauth: "OAuth",
        local: "Iniciar sesión",
      },
      shortcuts: {
        browseGames: "Explorar salas sin iniciar sesión",
      },
      oauth: {
        loginButton: "Iniciar sesión con OAuth",
        authorizationCodeLabel: "Código de autorización",
        accessTokenLabel: "Token de acceso",
      },
      local: {
        heading: {
          register: "Crear cuenta",
          login: "Iniciar sesión",
        },
        helper: {
          allowedCharacters:
            "Caracteres permitidos: letras, números, guiones bajos y guiones",
        },
        errors: {
          passwordMismatch: "Las contraseñas no coinciden",
          usernameTooShort:
            "El nombre de usuario debe tener al menos 3 caracteres",
        },
      },
    },
    chat: {
      notFound: "Chat no encontrado",
      nav: {
        backToChats: "Volver a chats",
        goHome: "Ir al inicio",
      },
      status: {
        connected: "Conectado al servidor de chat",
        connecting: "Conectando...",
      },
    },
    chatList: {
      search: {
        placeholder: "Busca usuarios por nombre o correo",
        searching: "Buscando...",
        signInRequired: "Inicia sesión para comenzar un chat.",
        noResults: "No se encontraron usuarios.",
      },
      messages: {
        directChat: "Chat directo",
        noMessagesYet: "Aún no hay mensajes",
      },
      empty: {
        unauthenticated: "Inicia sesión para ver tus chats.",
        noChats: "Aún no hay chats.",
      },
      errors: {
        authRequired: "Debes iniciar sesión para iniciar un chat.",
      },
    },
    games: {
      common: {
        newRoom: "Sala nueva",
        createRoom: "Crear sala",
        joinRoom: "Unirse a la sala",
        watchRoom: "Ver sala",
        viewRules: "Ver reglas",
        invitePending: "pendiente",
      },
      lounge: {
        title: "Salón de juegos de mesa",
        subtitle:
          "Crea salas en tiempo real, invita a tus amigos y deja que AICO se encargue de las reglas, la puntuación y la moderación.",
        featuredTitle: "Juegos destacados",
        featuredCaption:
          "Títulos de acceso anticipado que seguimos puliendo. Toca para explorar las reglas y reservar un lugar de prueba.",
        activeTitle: "Salas activas",
        activeCaption:
          "Entra a un lobby que ya está arrancando o mira qué está pasando en vivo.",
        haveInvite: "¿Tienes un código de invitación?",
        loadingRooms: "Cargando salas...",
        errorTitle: "No podemos conectar con el salón",
        emptyTitle: "Sin salas por ahora",
        emptyDescription:
          "Sé el pionero: crea el primer lobby o toca refrescar para volver a mirar en unos minutos.",
        footerTitle: "¿Quieres un juego específico?",
        footerText:
          "Deja tus solicitudes en #feature-votes o envía tu propia idea de mazo. Las elecciones de la comunidad salen en cada sprint.",
      },
      rooms: {
        status: {
          lobby: "Lobby abierto",
          inProgress: "Partida en curso",
          completed: "Sesión terminada",
          unknown: "Estado desconocido",
        },
        capacityWithMax: "{{current}}/{{max}} jugadores",
        capacityWithoutMax: "{{count}} jugadores",
        hostedBy: "Organizado por {{host}}",
        visibility: {
          private: "Solo con invitación",
          public: "Lobby abierto",
        },
        created: "Creada {{timestamp}}",
        unknownGame: "Juego desconocido",
        mysteryHost: "anfitrión misterioso",
        justCreated: "Recién creada",
      },
      alerts: {
        inviteRequired:
          "Este lobby necesita un código de invitación del anfitrión.",
        inviteInvalid:
          "El código de invitación no funcionó. Revísalo e inténtalo de nuevo.",
        roomFullTitle: "La sala está llena",
        roomFullMessage:
          "Ese lobby alcanzó el máximo de jugadores. Prueba con otra sala o crea la tuya.",
        roomFullManualMessage:
          "Ese lobby ya alcanzó el máximo de jugadores. Prueba con otro código o crea una sala nueva.",
        roomLockedTitle: "La partida ya comenzó",
        roomLockedMessage:
          "Este lobby ya está en progreso. Únete a otra sala o inténtalo más tarde.",
        roomLockedManualMessage:
          "El anfitrión ya inició esa sesión. Pídele un código nuevo.",
        genericJoinFailedTitle: "No se pudo unir a la sala",
        signInRequiredTitle: "Se requiere iniciar sesión",
        signInInviteMessage:
          "Inicia sesión para canjear un código de invitación y sincronizar tu asiento con el anfitrión.",
        signInJoinMessage:
          "Inicia sesión para unirte a un lobby y sincronizar tu asiento con el anfitrión.",
        signInDetailMessage:
          "Inicia sesión para asegurar tu asiento en esta sala.",
        inviteInvalidManual:
          "No encontramos una sala con ese código. Revisa las letras e inténtalo de nuevo.",
        inviteShareFailedTitle: "Invitación no enviada",
        inviteShareFailedMessage:
          "Copia un enlace o avisa a tus amigos manualmente mientras agregamos invitaciones nativas.",
        actionFailedTitle: "Acción fallida",
        genericError: "Algo salió mal.",
        couldNotLeaveTitle: "No se pudo salir de la sala",
        couldNotLeaveMessage: "No se pudo abandonar la sala.",
        unableToStartTitle: "No se puede iniciar la partida",
        unableToStartMessage: "No se puede iniciar la partida en este momento.",
        leavePromptTitle: "¿Salir de esta sala?",
        leavePromptMessage:
          "Perderás tu asiento y podrías necesitar una nueva invitación para volver.",
        deletePromptTitle: "¿Eliminar esta sala?",
        deletePromptMessage:
          "Esto eliminará el lobby para todos. Los jugadores se desconectarán de inmediato.",
        signInManageSeatMessage:
          "Inicia sesión para gestionar tu asiento en este lobby.",
        signInTakeTurnMessage: "Inicia sesión para tomar turnos en la mesa.",
        signInPlayCardMessage: "Inicia sesión para jugar cartas de acción.",
        signInStartMatchMessage:
          "Inicia sesión para comenzar la partida de este lobby.",
        roomDeletedTitle: "Sala eliminada",
        roomDeletedMessage: "El anfitrión eliminó este lobby.",
      },
      inviteDialog: {
        title: "Introduce el código de invitación",
        placeholder: "ABC123",
        manualDescription:
          "¿Recibiste una invitación? Introduce su código de seis caracteres para entrar al lobby al instante.",
        roomDescriptionWithName:
          "Este lobby es solo con invitación. Pide al anfitrión su código para unirte a “{{room}}”.",
        roomDescription:
          "Este lobby es solo con invitación. Introduce el código del anfitrión para unirte.",
        helper:
          "Convertiremos a mayúsculas automáticamente: solo escribe las letras que recibiste.",
      },
      errors: {
        loadRooms: "No se pudieron cargar las salas en este momento.",
        loadRoomDetails: "No se pudieron cargar los detalles de la sala.",
      },
      share: {
        title: "Únete conmigo a {{game}}",
        message:
          "Entra a {{game}} en AICO. Crearé una sala en cuanto abra el prototipo.",
      },
      create: {
        title: "Crear una sala",
        subtitle:
          "Elige tu juego, nombra el lobby y comparte la invitación con tu equipo.",
        sectionGame: "Juego",
        sectionDetails: "Detalles de la sala",
        sectionPreview: "Vista previa",
        fieldName: "Nombre de la sala",
        namePlaceholder: "p. ej. escuadrón {{example}}",
        fieldMaxPlayers: "Máx. de jugadores",
        autoPlaceholder: "Automático",
        fieldVisibility: "Visibilidad",
        fieldNotes: "Notas",
        notesPlaceholder: "Reglas, variantes o recordatorios",
        visibilityPublic: "Sala pública",
        visibilityPrivate: "Sala privada",
        pillPublic: "Pública",
        pillPrivate: "Privada",
        loadingFallback: "Espera mientras cargamos tu sesión...",
        submitCreating: "Creando...",
        submit: "Crear sala",
        alerts: {
          signInMessage: "Vuelve a iniciar sesión para crear una sala.",
          nameRequiredTitle: "Nombre requerido",
          nameRequiredMessage:
            "Ponle un nombre a tu sala para que tus amigos la reconozcan.",
          invalidPlayersTitle: "Número de jugadores no válido",
          invalidPlayersMessage:
            "El máximo de jugadores debe ser un número mayor o igual a 2.",
          roomCreatedTitle: "Sala creada",
          roomCreatedMessage: "Código de invitación: {{code}}",
          invitePending: "pendiente",
          createFailedTitle: "No se pudo crear la sala",
          createFailedMessage: "Error al crear la sala.",
        },
      },
      detail: {
        backToLobby: "Explorar juegos",
        emptyTitle: "Juego disponible pronto",
        emptyDescription:
          "No encontramos ese título. Explora el salón para ver prototipos activos y próximos lanzamientos.",
        inviteButton: "Invitar amigos",
        openRoomsTitle: "Salas abiertas",
        openRoomsCaption:
          "Únete a un lobby activo o crea tu propia sesión si no hay otra abierta.",
        highlightsTitle: "Destacados",
        howToPlayTitle: "Cómo jugar",
        howToPlayCaption:
          "Tres consejos rápidos para que los nuevos jugadores se unan sin manual.",
        comingSoonTitle: "Qué sigue",
        comingSoonCaption:
          "Estamos puliendo estos sistemas antes del lanzamiento público de la beta.",
        refresh: "Actualizar",
        loadingRooms: "Cargando salas...",
        errorTitle: "No se pueden obtener las salas",
        emptyRoomsTitle: "No hay salas abiertas aún",
        emptyRoomsCaption: "Vuelve pronto o lanza tú el primer lobby.",
      },
      room: {
        defaultName: "Sala de juego",
        meta: {
          host: "Anfitrión",
          players: "Jugadores",
          created: "Creada",
          access: "Acceso",
          inviteCode: "Código de invitación",
        },
        loading: "Sincronizando detalles de la sala...",
        preparationTitle: "Preparación de la mesa",
        preparationCopy:
          "Te guiaremos por la preparación, los turnos y la puntuación cuando la mesa interactiva esté lista. Mientras tanto, coordina por chat, repasa las reglas y reúne a tu equipo mientras terminamos la experiencia en tiempo real.",
        waitingTitle: "¿Esperando a más jugadores?",
        waitingCopy:
          "Mantén esta pantalla abierta: actualizaremos el lobby automáticamente cuando entren compañeros o el anfitrión inicie la partida.",
        errors: {
          signInRequired: "Inicia sesión para cargar los detalles de la sala.",
          notFound:
            "Sala no encontrada. El enlace de invitación puede estar incompleto.",
          inactive: "Esta sala ya no está activa o has abandonado el lobby.",
        },
        buttons: {
          viewGame: "Ver juego",
          deleteRoom: "Eliminar sala",
        },
      },
      table: {
        headerTitle: "Mesa de Exploding Cats",
        sessionStatus: {
          active: "Activa",
          completed: "Completada",
          pending: "Pendiente",
          unknown: "Estado desconocido",
        },
        messageCompleted:
          "Partida terminada. Inicia una nueva para volver a jugar.",
        info: {
          inDeck: "en el mazo",
          topDiscard: "última carta descartada",
          empty: "Vacío",
          none: "Ninguno",
          pendingSingular: "robo pendiente",
          pendingPlural: "robos pendientes",
        },
        seats: {
          cardsSingular: "{{count}} carta",
          cardsPlural: "{{count}} cartas",
          status: {
            alive: "Activo",
            out: "Fuera",
          },
        },
        hand: {
          title: "Tus cartas",
          cardLabel: "Carta",
          empty: "No tienes cartas",
          statusAlive: "Activo",
          statusOut: "Fuera",
          eliminatedNote: "Explotaste esta ronda. Espera la siguiente partida.",
        },
        placeholder: {
          waiting: "Esperando a que el anfitrión inicie la mesa interactiva.",
          hostSuffix: "Iníciala cuando todos estén listos.",
        },
        actions: {
          start: "Iniciar partida",
          draw: "Robar carta",
          playSkip: "Jugar Saltar",
          playAttack: "Jugar Ataque",
          playCatCombo: "Jugar combo de gatos",
        },
        logs: {
          title: "Turnos recientes",
        },
        cards: {
          explodingCat: "Gato explosivo",
          defuse: "Desactivar",
          attack: "Ataque",
          skip: "Saltar",
          tacocat: "Tacogato",
          hairyPotatoCat: "Gato patata peluda",
          rainbowRalphingCat: "Gato arcoíris vomitador",
          cattermelon: "Gatomelón",
          beardedCat: "Gato barbudo",
          generic: "Gato",
        },
        cardDescriptions: {
          explodingCat: "Si la robas sin un Defuse, boom: quedas fuera de la ronda.",
          defuse: "Anula un Gato explosivo y te deja esconderlo de nuevo en el mazo.",
          attack: "Termina tu turno y obliga al siguiente jugador a robar dos cartas.",
          skip: "Termina tu turno al instante sin robar carta.",
          tacocat: "Juega dos o tres copias para quitar cartas a un rival.",
          hairyPotatoCat: "Con pareja o trío robas una carta aleatoria o nombrada.",
          rainbowRalphingCat: "Combina copias para arrebatar cartas a otro jugador.",
          cattermelon: "Reúne duplicados para robar cartas y preparar combos.",
          beardedCat: "Quítales cartas a tus rivales cuando lo juegas en pareja o trío.",
          generic: "Las cartas de gato solo se activan en parejas o tríos para robar.",
        },
        catCombo: {
          title: "Jugar combo de {{card}}",
          description:
            "Elige el tipo de combo, selecciona un objetivo y confirma el efecto.",
          modePair: "Pareja (2 cartas)",
          modeTrio: "Trío (3 cartas)",
          targetLabel: "Selecciona un jugador objetivo",
          noTargets: "No hay jugadores disponibles para apuntar.",
          desiredCardLabel: "Elige la carta que quieres pedir",
          optionPair: "Pareja disponible",
          optionTrio: "Trío disponible",
          optionPairOrTrio: "Pareja o trío disponible",
          cancel: "Cancelar",
          confirm: "Confirmar combo",
        },
      },
    },
    home: {
      welcomeTitle: "¡Bienvenido!",
      step1Title: "Paso 1: Pruébalo",
      step1Body:
        "Edita {{file}} para ver los cambios. Pulsa {{shortcut}} para abrir las herramientas de desarrollador.",
      step2Title: "Paso 2: Personaliza",
      step2Body:
        "Abre Ajustes para administrar tus preferencias y el acceso a tu cuenta.",
      step3Title: "Paso 3: Empieza de nuevo",
      step3Body:
        "Cuando estés listo, ejecuta {{command}} para obtener un nuevo directorio {{appName}}. Esto moverá el {{appName}} actual a {{exampleName}}.",
    },
    welcome: {
      tagline: "Colaboración en tiempo real inteligente, segura y extensible.",
      description:
        "Experimenta autenticación OAuth y local con correo y contraseña, acceso JWT con próxima rotación de tokens refresh, y mensajería en tiempo real impulsada por websockets. Esta app de pruebas muestra patrones seguros, arquitectura modular y tematización para móvil y web con Expo.",
      runningOn: "Se ejecuta en {{platform}}",
    },
    settings: {
      appearanceTitle: "Aspecto",
      appearanceDescription:
        "Ajusta el aspecto de la interfaz sin importar el tema del dispositivo.",
      themeOptions: {
        system: {
          label: "Predeterminado del sistema",
          description: "Sigue los ajustes de apariencia de tu dispositivo.",
        },
        light: {
          label: "Claro",
          description: "Usa siempre la interfaz clara.",
        },
        dark: {
          label: "Oscuro",
          description: "Usa siempre la interfaz oscura.",
        },
      },
      languageTitle: "Idioma",
      languageDescription:
        "Elige el idioma que prefieres para los textos de la aplicación. Pronto añadiremos más traducciones.",
      languageOptions: {
        en: "English",
        es: "Español",
        fr: "Français",
      },
      activeSelection: "Selección activa",
      tapToSwitch: "Toca para cambiar",
      accountTitle: "Cuenta",
      accountDescription:
        "Administra tu estado de inicio de sesión y los tokens guardados en este dispositivo.",
      accountSignedOut: "Estás navegando sin iniciar sesión.",
      signedInAs: "Sesión iniciada como {{user}}",
    },
  },
  fr: {
    navigation: {
      homeTab: "Accueil",
      gamesTab: "Jeux",
      chatsTab: "Discussions",
      settingsTitle: "Paramètres",
      openSettingsHint: "Ouvrir les paramètres",
    },
    common: {
      learnMore: "En savoir plus",
      cancel: "Annuler",
      signIn: "Se connecter",
      back: "Retour",
      retry: "Réessayer",
      loading: "Chargement...",
      actions: {
        login: "Se connecter",
        logout: "Se déconnecter",
        register: "S'inscrire",
        openApp: "Ouvrir l'application",
        getStarted: "Commencer",
        leave: "Quitter",
        stay: "Rester",
        ok: "OK",
      },
      prompts: {
        haveAccount: "Vous avez déjà un compte ?",
        needAccount: "Besoin d'un compte ?",
      },
      labels: {
        username: "Nom d'utilisateur",
        email: "E-mail",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
      },
      statuses: {
        authenticated: "Authentifié",
      },
    },
    auth: {
      sections: {
        oauth: "OAuth",
        local: "Connexion",
      },
      oauth: {
        loginButton: "Se connecter avec OAuth",
        authorizationCodeLabel: "Code d'autorisation",
        accessTokenLabel: "Jeton d'accès",
      },
      local: {
        heading: {
          register: "Créer un compte",
          login: "Se connecter",
        },
        helper: {
          allowedCharacters:
            "Caractères autorisés : lettres, chiffres, underscores et tirets",
        },
        errors: {
          passwordMismatch: "Les mots de passe ne correspondent pas",
          usernameTooShort:
            "Le nom d'utilisateur doit comporter au moins 3 caractères",
        },
      },
    },
    chat: {
      notFound: "Discussion introuvable",
      nav: {
        backToChats: "Retour aux discussions",
        goHome: "Aller à l'accueil",
      },
      status: {
        connected: "Connecté au serveur de discussion",
        connecting: "Connexion...",
      },
    },
    chatList: {
      search: {
        placeholder: "Rechercher des utilisateurs par nom ou e-mail",
        searching: "Recherche...",
        signInRequired: "Connectez-vous pour lancer une discussion.",
        noResults: "Aucun utilisateur trouvé.",
      },
      messages: {
        directChat: "Discussion directe",
        noMessagesYet: "Pas encore de messages",
      },
      empty: {
        unauthenticated: "Connectez-vous pour voir vos discussions.",
        noChats: "Pas encore de discussions.",
      },
      errors: {
        authRequired: "Vous devez être connecté pour démarrer une discussion.",
      },
    },
    games: {
      common: {
        newRoom: "Nouvelle salle",
        createRoom: "Créer une salle",
        joinRoom: "Rejoindre la salle",
        watchRoom: "Observer la salle",
        viewRules: "Voir les règles",
        invitePending: "en attente",
      },
      lounge: {
        title: "Salon jeux de plateau",
        subtitle:
          "Crée des salles en temps réel, invite tes amis et laisse AICO gérer règles, score et modération.",
        featuredTitle: "Jeux à la une",
        featuredCaption:
          "Titres en accès anticipé que nous peaufinons encore. Touchez pour explorer les règles et réserver un créneau de test.",
        activeTitle: "Salles actives",
        activeCaption:
          "Rejoins un lobby déjà lancé ou regarde ce qui se passe en direct.",
        haveInvite: "Tu as un code d'invitation ?",
        loadingRooms: "Chargement des salles...",
        errorTitle: "Impossible d'atteindre le salon",
        emptyTitle: "Aucune salle pour le moment",
        emptyDescription:
          "Soyez le premier : lancez le premier lobby ou rafraîchissez dans quelques minutes.",
        footerTitle: "Un jeu en tête ?",
        footerText:
          "Déposez vos demandes dans #feature-votes ou proposez votre propre deck. Les choix de la communauté sortent à chaque sprint.",
      },
      rooms: {
        status: {
          lobby: "Lobby ouvert",
          inProgress: "Partie en cours",
          completed: "Session terminée",
          unknown: "Statut inconnu",
        },
        capacityWithMax: "{{current}}/{{max}} joueurs",
        capacityWithoutMax: "{{count}} joueurs",
        hostedBy: "Animé par {{host}}",
        visibility: {
          private: "Sur invitation",
          public: "Lobby ouvert",
        },
        created: "Créée {{timestamp}}",
        unknownGame: "Jeu inconnu",
        mysteryHost: "capitaine mystère",
        justCreated: "Tout juste créée",
      },
      alerts: {
        inviteRequired: "Ce lobby nécessite un code d'invitation de l'hôte.",
        inviteInvalid:
          "Le code d'invitation n'a pas fonctionné. Vérifiez-le et réessayez.",
        roomFullTitle: "Salle complète",
        roomFullMessage:
          "Ce lobby a atteint sa capacité. Essayez-en un autre ou créez le vôtre.",
        roomFullManualMessage:
          "Ce lobby a déjà atteint sa capacité. Essayez un autre code ou créez une nouvelle salle.",
        roomLockedTitle: "Partie déjà lancée",
        roomLockedMessage:
          "Ce lobby est déjà en cours. Rejoignez-en un autre ou revenez plus tard.",
        roomLockedManualMessage:
          "L'hôte a déjà lancé cette session. Demandez-lui un nouveau code.",
        genericJoinFailedTitle: "Impossible de rejoindre la salle",
        signInRequiredTitle: "Connexion requise",
        signInInviteMessage:
          "Connectez-vous pour utiliser un code d'invitation et synchroniser votre place avec l'hôte.",
        signInJoinMessage:
          "Connectez-vous pour rejoindre un lobby et synchroniser votre place avec l'hôte.",
        signInDetailMessage:
          "Connectez-vous pour réserver votre place dans cette salle.",
        inviteInvalidManual:
          "Nous n'avons trouvé aucune salle avec ce code. Vérifiez les caractères et réessayez.",
        inviteShareFailedTitle: "Invitation non envoyée",
        inviteShareFailedMessage:
          "Copiez un lien ou contactez vos amis manuellement en attendant les invitations natives.",
        actionFailedTitle: "Action échouée",
        genericError: "Une erreur est survenue.",
        couldNotLeaveTitle: "Impossible de quitter la salle",
        couldNotLeaveMessage: "Impossible de quitter la salle.",
        unableToStartTitle: "Impossible de lancer la partie",
        unableToStartMessage: "Impossible de lancer la partie pour le moment.",
        leavePromptTitle: "Quitter cette salle ?",
        leavePromptMessage:
          "Vous perdrez votre place et aurez peut-être besoin d'une nouvelle invitation pour revenir.",
        deletePromptTitle: "Supprimer cette salle ?",
        deletePromptMessage:
          "Cela supprimera le lobby pour tout le monde. Les joueurs seront déconnectés immédiatement.",
        signInManageSeatMessage:
          "Connectez-vous pour gérer votre place dans ce lobby.",
        signInTakeTurnMessage:
          "Connectez-vous pour jouer vos tours à la table.",
        signInPlayCardMessage: "Connectez-vous pour jouer des cartes d'action.",
        signInStartMatchMessage:
          "Connectez-vous pour lancer la partie dans ce lobby.",
        roomDeletedTitle: "Salle supprimée",
        roomDeletedMessage: "L'hôte a supprimé ce lobby.",
      },
      inviteDialog: {
        title: "Saisir le code d'invitation",
        placeholder: "ABC123",
        manualDescription:
          "Vous avez reçu une invitation ? Entrez son code à six caractères pour rejoindre le lobby instantanément.",
        roomDescriptionWithName:
          "Ce lobby est sur invitation. Demandez au hôte son code pour rejoindre « {{room}} ».",
        roomDescription:
          "Ce lobby est sur invitation. Entrez le code fourni par l'hôte.",
        helper:
          "Nous passerons en majuscules automatiquement : saisissez simplement les lettres reçues.",
      },
      errors: {
        loadRooms: "Impossible de charger les salles pour le moment.",
        loadRoomDetails: "Impossible de charger les détails de la salle.",
      },
      share: {
        title: "Rejoins-moi pour {{game}}",
        message:
          "Rejoins {{game}} sur AICO. Je créerai une salle dès que le prototype ouvrira !",
      },
      create: {
        title: "Créer une salle",
        subtitle:
          "Choisis ton jeu, nomme le lobby et partage l'invitation avec ton équipe.",
        sectionGame: "Jeu",
        sectionDetails: "Détails de la salle",
        sectionPreview: "Aperçu",
        fieldName: "Nom de la salle",
        namePlaceholder: "ex. escouade {{example}}",
        fieldMaxPlayers: "Nombre max. de joueurs",
        autoPlaceholder: "Automatique",
        fieldVisibility: "Visibilité",
        fieldNotes: "Notes",
        notesPlaceholder: "Règles, variantes ou rappels",
        visibilityPublic: "Salle publique",
        visibilityPrivate: "Salle privée",
        pillPublic: "Publique",
        pillPrivate: "Privée",
        loadingFallback: "Patientez pendant le chargement de votre session...",
        submitCreating: "Création...",
        submit: "Créer la salle",
        alerts: {
          signInMessage: "Reconnectez-vous pour créer une salle.",
          nameRequiredTitle: "Nom requis",
          nameRequiredMessage:
            "Donnez un nom à votre salle pour que vos amis la reconnaissent.",
          invalidPlayersTitle: "Nombre de joueurs invalide",
          invalidPlayersMessage:
            "Le maximum de joueurs doit être un nombre supérieur ou égal à 2.",
          roomCreatedTitle: "Salle créée",
          roomCreatedMessage: "Code d'invitation : {{code}}",
          invitePending: "en attente",
          createFailedTitle: "Échec de la création de la salle",
          createFailedMessage: "La création de la salle a échoué.",
        },
      },
      detail: {
        backToLobby: "Explorer les jeux",
        emptyTitle: "Jeu à venir",
        emptyDescription:
          "Nous n'avons pas trouvé ce titre. Parcourez le salon pour découvrir les prototypes actifs et les sorties à venir.",
        inviteButton: "Inviter des amis",
        openRoomsTitle: "Salles ouvertes",
        openRoomsCaption:
          "Rejoignez un lobby actif ou créez votre propre session si aucune n'est disponible.",
        highlightsTitle: "Points forts",
        howToPlayTitle: "Comment jouer",
        howToPlayCaption:
          "Trois repères rapides pour que les nouveaux joueurs se lancent sans livret de règles.",
        comingSoonTitle: "Et ensuite",
        comingSoonCaption:
          "Nous peaufinons ces systèmes avant la sortie de la bêta publique.",
        refresh: "Actualiser",
        loadingRooms: "Chargement des salles...",
        errorTitle: "Impossible de récupérer les salles",
        emptyRoomsTitle: "Aucune salle ouverte pour le moment",
        emptyRoomsCaption:
          "Revenez bientôt ou lancez vous-même le premier lobby.",
      },
      room: {
        defaultName: "Salle de jeu",
        meta: {
          host: "Hôte",
          players: "Joueurs",
          created: "Créée",
          access: "Accès",
          inviteCode: "Code d'invitation",
        },
        loading: "Synchronisation des détails de la salle...",
        preparationTitle: "Préparation de la table",
        preparationCopy:
          "Nous vous guiderons dans la mise en place, le déroulement des tours et le score dès que la table interactive sera prête. En attendant, coordonnez-vous dans le chat, relisez les règles et rassemblez votre équipe pendant que nous finalisons l'expérience en temps réel.",
        waitingTitle: "En attente de joueurs ?",
        waitingCopy:
          "Gardez cet écran ouvert : nous actualiserons le lobby automatiquement quand des coéquipiers rejoignent ou que l'hôte lance la partie.",
        errors: {
          signInRequired:
            "Connectez-vous pour charger les détails de la salle.",
          notFound:
            "Salle introuvable. Le lien d'invitation est peut-être incomplet.",
          inactive:
            "Cette salle n'est plus active ou vous avez quitté le lobby.",
        },
        buttons: {
          viewGame: "Voir le jeu",
          deleteRoom: "Supprimer la salle",
        },
      },
      table: {
        headerTitle: "Table Exploding Cats",
        sessionStatus: {
          active: "En cours",
          completed: "Terminée",
          pending: "En attente",
          unknown: "Statut inconnu",
        },
        messageCompleted:
          "Partie terminée. Lancez un nouveau match pour rejouer.",
        info: {
          inDeck: "dans la pioche",
          topDiscard: "dernière carte défaussée",
          empty: "Vide",
          none: "Aucun",
          pendingSingular: "pioche en attente",
          pendingPlural: "pioches en attente",
        },
        seats: {
          cardsSingular: "{{count}} carte",
          cardsPlural: "{{count}} cartes",
          status: {
            alive: "En jeu",
            out: "Éliminé",
          },
        },
        hand: {
          title: "Vos cartes",
          cardLabel: "Carte",
          empty: "Aucune carte en main",
          statusAlive: "En jeu",
          statusOut: "Éliminé",
          eliminatedNote:
            "Vous avez explosé cette manche. Patientez pour la prochaine partie.",
        },
        placeholder: {
          waiting:
            "En attente du lancement de la table interactive par l'hôte.",
          hostSuffix: "Lancez-la quand tout le monde est prêt.",
        },
        actions: {
          start: "Lancer la partie",
          draw: "Piocher une carte",
          playSkip: "Jouer Passer",
          playAttack: "Jouer Attaque",
          playCatCombo: "Jouer un combo de chats",
        },
        logs: {
          title: "Tours récents",
        },
        cards: {
          explodingCat: "Chat explosif",
          defuse: "Désamorçage",
          attack: "Attaque",
          skip: "Passer",
          tacocat: "Tacochat",
          hairyPotatoCat: "Chat patate velu",
          rainbowRalphingCat: "Chat arc-en-ciel vomitif",
          cattermelon: "Melonchat",
          beardedCat: "Chat barbu",
          generic: "Chat",
        },
        cardDescriptions: {
          explodingCat: "Piochez-la sans Defuse et boum : vous quittez la manche.",
          defuse: "Annule un Chat explosif et permet de le replacer dans la pioche.",
          attack: "Terminez votre tour et forcez le joueur suivant à piocher deux cartes.",
          skip: "Terminez immédiatement votre tour sans piocher.",
          tacocat: "Jouez-en deux ou trois pour voler une carte à un adversaire.",
          hairyPotatoCat: "En paire ou trio, vole une carte aléatoire ou nommée.",
          rainbowRalphingCat: "Combinez plusieurs copies pour subtiliser des cartes.",
          cattermelon: "Rassemblez des doublons pour voler des cartes et préparer vos combos.",
          beardedCat: "Vol garanti lorsqu'il est joué en paire ou en trio.",
          generic: "Les cartes chat s'activent en paire ou trio pour voler des cartes.",
        },
        catCombo: {
          title: "Jouer un combo avec {{card}}",
          description:
            "Choisis un type de combo, désigne une cible et confirme l'action.",
          modePair: "Paire (2 cartes)",
          modeTrio: "Trio (3 cartes)",
          targetLabel: "Choisir un joueur à cibler",
          noTargets: "Aucun joueur cible disponible.",
          desiredCardLabel: "Demander une carte précise",
          optionPair: "Paire disponible",
          optionTrio: "Trio disponible",
          optionPairOrTrio: "Paire ou trio disponibles",
          cancel: "Annuler",
          confirm: "Valider le combo",
        },
      },
    },
    home: {
      welcomeTitle: "Bienvenue !",
      step1Title: "Étape 1 : Essayez",
      step1Body:
        "Modifiez {{file}} pour voir les changements. Appuyez sur {{shortcut}} pour ouvrir les outils de développement.",
      step2Title: "Étape 2 : Personnalisez",
      step2Body:
        "Ouvrez les réglages pour gérer vos préférences et l’accès à votre compte.",
      step3Title: "Étape 3 : Repartez de zéro",
      step3Body:
        "Quand vous êtes prêt, exécutez {{command}} pour recréer le dossier {{appName}}. Le dossier {{appName}} actuel sera déplacé vers {{exampleName}}.",
    },
    welcome: {
      tagline:
        "Collaboration en temps réel intelligente, sécurisée et extensible.",
      description:
        "Découvrez l'authentification OAuth et locale par e-mail/mot de passe, l'accès JWT avec rotation de jetons à venir, et la messagerie en temps réel alimentée par WebSockets. Cette application de démonstration illustre des modèles sécurisés, une architecture modulaire et un thème pour mobile et web avec Expo.",
      runningOn: "Fonctionne sur {{platform}}",
    },
    settings: {
      appearanceTitle: "Apparence",
      appearanceDescription:
        "Ajustez l'apparence de l'interface indépendamment du thème de votre appareil.",
      themeOptions: {
        system: {
          label: "Réglage du système",
          description: "Suit les paramètres d'apparence de votre appareil.",
        },
        light: {
          label: "Clair",
          description: "Utilise toujours l'interface claire.",
        },
        dark: {
          label: "Sombre",
          description: "Utilise toujours l'interface sombre.",
        },
      },
      languageTitle: "Langue",
      languageDescription:
        "Choisissez la langue des textes de l'application. Davantage de traductions arrivent bientôt.",
      languageOptions: {
        en: "English",
        es: "Español",
        fr: "Français",
      },
      activeSelection: "Sélection active",
      tapToSwitch: "Touchez pour changer",
      accountTitle: "Compte",
      accountDescription:
        "Gérez votre état de connexion et les jetons enregistrés sur cet appareil.",
      accountSignedOut: "Vous naviguez sans être connecté.",
      signedInAs: "Connecté en tant que {{user}}",
    },
  },
} as const satisfies TranslationMap;

export type TranslationDictionary = typeof translations.en;

export type TranslationKey = TranslationLeafPaths<TranslationDictionary>;
