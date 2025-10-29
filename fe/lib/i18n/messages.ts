import type { TranslationLeafPaths, TranslationMap } from "./types";

const SUPPORT_TEAM_NAMES = {
  en: {
    producer: "Anatoliy Aliaksandrau",
    designer: "Anatoliy Aliaksandrau",
    engineer: "Anatoliy Aliaksandrau",
  },
  es: {
    producer: "Anatoliy Aliaksandrau",
    designer: "Anatoliy Aliaksandrau",
    engineer: "Anatoliy Aliaksandrau",
  },
  fr: {
    producer: "Anatoliy Aliaksandrau",
    designer: "Anatoliy Aliaksandrau",
    engineer: "Anatoliy Aliaksandrau",
  },
} as const;

export const translations = {
  en: {
    navigation: {
      homeTab: "Home",
      gamesTab: "Games",
      chatsTab: "Chats",
      historyTab: "History",
    settingsTitle: "Settings",
    supportTitle: "Support the developers",
    paymentTitle: "Card payment",
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
          supportTitle: "Soutenir l'équipe",
      },
    },
    chatList: {
      search: {
        placeholder: "Search users by name or email",
        searching: "Searching...",
        signInRequired: "Sign in to start a chat.",
        noResults: "No users found.",
      },
      messages: {
        directChat: "Direct chat",
        noMessagesYet: "No messages yet",
      },
      empty: {
        unauthenticated: "Sign in to see your chats.",
        noChats: "No chats yet.",
      },
      errors: {
        authRequired: "You must be signed in to start a chat.",
      },
    },
    history: {
      unknownGame: "Unknown game",
      status: {
        lobby: "Lobby",
        inProgress: "In progress",
        completed: "Completed",
        waiting: "Waiting",
        active: "In progress",
      },
      list: {
        emptySignedOut: "Sign in to review your past games.",
        emptyNoEntries: "No completed games yet. Play a match to build your history.",
      },
      actions: {
        viewDetails: "View details",
        refresh: "Refresh history",
      },
      errors: {
        authRequired: "You need to be signed in to view history.",
        detailFailed: "Unable to load match details.",
        rematchMinimum: "Select at least one other participant to start a rematch.",
        removeFailed: "Unable to remove match from history.",
        detailRemoved:
          "This match is no longer available. Refresh your history to update the list.",
      },
      detail: {
        lastActivity: "Last activity {{timestamp}}",
        participantsTitle: "Participants",
        hostLabel: "Host",
        logsTitle: "Match log",
        noLogs: "No moves or messages recorded yet.",
        scopePlayers: "Visible to players",
        scopeAll: "Visible to everyone",
        sender: "From {{name}}",
        rematchTitle: "Rematch",
        rematchDescription: "Select who is ready for another round.",
        rematchAction: "Start rematch",
        backToList: "Back to history",
        removeTitle: "Remove match from history",
        removeDescription: "This hides the match for you and keeps it for other players.",
        removeAction: "Remove from history",
        removeConfirm: "Remove",
        removeCancel: "Keep",
      },
    },
    games: {
      common: {
        newRoom: "New room",
        createRoom: "Create room",
        joinRoom: "Join room",
        watchRoom: "Watch room",
        removeFailed: "No se pudo quitar la partida del historial.",
        viewRules: "View rules",
        invitePending: "pending",
      },
      lounge: {
        title: "Tabletop Lounge",
        subtitle:
          "Spin up real-time rooms, invite your friends, and let {{appName}} handle rules, scoring, and moderation.",
        featuredTitle: "Featured games",
        featuredCaption:
          "Early access titles we're polishing for launch. Tap to explore rules and reserve a playtest slot.",
        activeTitle: "Active rooms",
        activeCaption:
          "Jump into a lobby that's already spinning up or scope what's happening live.",
        haveInvite: "Have an invite code?",
        filters: {
          statusLabel: "Status",
          participationLabel: "Participation",
          status: {
            all: "All",
            lobby: "Lobby",
            inProgress: "In progress",
            completed: "Completed",
          },
          participation: {
            all: "Everyone",
            hosting: "Hosting",
            joined: "Joined",
            notJoined: "Open seats",
          },
          participationSignedOut: "Sign in to filter by participation.",
        },
        removeTitle: "¿Quitar partida del historial?",
        removeDescription: "Solo se ocultará para ti; los demás jugadores la seguirán viendo.",
        removeAction: "Quitar del historial",
        removeConfirm: "Quitar",
        removeCancel: "Mantener",
        loadingRooms: "Fetching rooms...",
        errorTitle: "Can't reach the lounge",
        emptyTitle: "No rooms yet",
        emptyDescription:
          "Be the trailblazer—kick off the first lobby or tap refresh to check again in a few.",
        filterEmptyTitle: "No rooms match your filters",
        filterEmptyDescription:
          "Try a different status or participation filter, or clear them to see everything.",
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
          "Jump into {{game}} on {{appName}}. I'll create a room as soon as the prototype opens!",
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
          refresh: "Actualizar historial",
          deleteRoom: "Delete room",
          enterFullscreen: "Full screen",
          exitFullscreen: "Exit full screen",
        },
      },
      table: {
        headerTitle: "Exploding Cats table",
          detailRemoved:
            "Esta partida ya no está disponible. Actualiza tu historial para ver la lista al día.",
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
          title: "History",
          empty: "No history yet.",
          composerPlaceholder: "Share a quick note with the table...",
          send: "Send",
          checkboxLabelPlayers: "Only players can see this",
          checkboxLabelAll: "Everyone can see this",
          checkboxHint: "Tap to change audience",
          playersOnlyTag: "Players",
          you: "You",
          unknownSender: "Unknown player",
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
      tagline: "{{appName}} is your remote-friendly arcade for fast tabletop playtests.",
      description:
        "Spin up real-time rooms, rally your playtest crew, and let {{appName}} automate rules, scoring, and moderation so you can focus on the fun.",
      runningOn: "Running on {{platform}}",
      supportCta: "Support the developers",
    },
    support: {
      title: "Support the developers",
      tagline: "Keep {{appName}} iterating quickly and accessible to the tabletop community.",
      description:
        "Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.",
      team: {
        title: "Meet the core team",
        members: {
          producer: {
            name: SUPPORT_TEAM_NAMES.en.producer,
            role: "Product & realtime systems",
            bio: "Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.",
          },
          designer: {
            name: SUPPORT_TEAM_NAMES.en.designer,
            role: "Game designer & UX",
            bio: "Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.",
          },
          engineer: {
            name: SUPPORT_TEAM_NAMES.en.engineer,
            role: "Full-stack engineer",
            bio: "Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.",
          },
        },
      },
      contribute: {
        title: "Ways to contribute",
        sponsorTitle: "Recurring sponsorship",
        sponsorDescription:
          "Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.",
        sponsorCta: "Sponsor development",
        coffeeTitle: "One-time boost",
        coffeeDescription:
          "Prefer a quick thank-you? Send the crew coffee and snacks so late-night playtests stay energized.",
        coffeeCta: "Buy the team a coffee",
        paymentTitle: "Card payment",
        paymentDescription:
          "Enter an amount and we'll open Payze's secure checkout in your browser.",
        paymentCta: "Enter amount",
        ibanTitle: "Bank transfer",
        ibanDescription:
          "Need to pay by card through your bank? Enter the IBAN {{iban}} to send funds directly to {{appName}}.",
        ibanCta: "Copy IBAN details",
        ibanCopied: "IBAN copied to clipboard: {{iban}}",
      },
      thanks: "Every contribution keeps {{appName}} evolving. Thank you for helping us build the future of remote tabletop play!",
      errors: {
        unableToOpen: "We couldn't open that link. Try again shortly.",
      },
    },
    payments: {
      title: "Secure card payment",
      intro:
        "Enter an amount and complete your contribution in Payze's secure checkout.",
      amountLabel: "Amount",
      amountPlaceholder: "e.g. 25",
      currencyLabel: "Currency",
      currencyPlaceholder: "e.g. GEL",
      noteLabel: "Optional note",
      notePlaceholder: "Add a note for the team",
      submit: "Continue to payment",
      status: {
        pending: "Opening Payze checkout...",
        success:
          "Payze checkout opened in your browser. Complete the payment there.",
        cancelled: "Checkout closed before starting. You can try again.",
      },
      errors: {
        amountRequired: "Enter a valid amount greater than zero.",
        sessionFailed:
          "We couldn't process the payment. Try again in a moment.",
      },
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
      historyTab: "Historial",
    settingsTitle: "Ajustes",
    supportTitle: "Apoyar al equipo",
    paymentTitle: "Pago con tarjeta",
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
        backToChats: "Volver a los chats",
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
    history: {
      unknownGame: "Juego desconocido",
      status: {
        lobby: "Sala",
        inProgress: "En progreso",
        completed: "Finalizada",
        waiting: "En espera",
        active: "En curso",
      },
      list: {
        emptySignedOut: "Inicia sesión para revisar tus partidas anteriores.",
        emptyNoEntries: "Aún no tienes partidas finalizadas. Juega para crear tu historial.",
      },
      actions: {
        viewDetails: "Ver detalles",
      },
      errors: {
        authRequired: "Debes iniciar sesión para ver el historial.",
        detailFailed: "No se pudieron cargar los detalles de la partida.",
        rematchMinimum: "Selecciona al menos a otro participante para iniciar una revancha.",
      },
      detail: {
        lastActivity: "Última actividad {{timestamp}}",
        participantsTitle: "Participantes",
        hostLabel: "Anfitrión",
        logsTitle: "Registro de la partida",
        noLogs: "No hay movimientos ni mensajes registrados.",
        scopePlayers: "Visible para los jugadores",
        scopeAll: "Visible para todos",
        sender: "De {{name}}",
        rematchTitle: "Revancha",
        rematchDescription: "Selecciona quién está listo para otra ronda.",
        rematchAction: "Crear revancha",
        backToList: "Volver al historial",
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
          "Crea salas en tiempo real, invita a tus amigos y deja que {{appName}} se encargue de las reglas, la puntuación y la moderación.",
        featuredTitle: "Juegos destacados",
        featuredCaption:
          "Títulos de acceso anticipado que seguimos puliendo. Toca para explorar las reglas y reservar un lugar de prueba.",
        activeTitle: "Salas activas",
        activeCaption:
          "Entra a un lobby que ya está arrancando o mira qué está pasando en vivo.",
        haveInvite: "¿Tienes un código de invitación?",
        filters: {
          statusLabel: "Estado",
          participationLabel: "Participación",
          status: {
            all: "Todos",
            lobby: "Lobby",
            inProgress: "En progreso",
            completed: "Finalizadas",
          },
          participation: {
            all: "Cualquiera",
            hosting: "Organizo",
            joined: "Unidas",
            notJoined: "Con plazas",
          },
          participationSignedOut:
            "Inicia sesión para filtrar por participación.",
        },
        loadingRooms: "Cargando salas...",
        errorTitle: "No podemos conectar con el salón",
        emptyTitle: "Sin salas por ahora",
        emptyDescription:
          "Sé el pionero: crea el primer lobby o toca refrescar para volver a mirar en unos minutos.",
        filterEmptyTitle: "Ninguna sala coincide con tus filtros",
        filterEmptyDescription:
          "Prueba con otro estado o filtro de participación, o bórralos para ver todas las salas.",
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
          "Entra a {{game}} en {{appName}}. Crearé una sala en cuanto abra el prototipo.",
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
          enterFullscreen: "Pantalla completa",
          exitFullscreen: "Salir de pantalla completa",
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
          title: "Historial",
          empty: "Sin historial todavía.",
          composerPlaceholder: "Comparte una nota rápida con la mesa...",
          send: "Enviar",
          checkboxLabelPlayers: "Solo los jugadores pueden verlo",
          checkboxLabelAll: "Todos pueden verlo",
          checkboxHint: "Toca para cambiar la audiencia",
          playersOnlyTag: "Jugadores",
          you: "Tú",
          unknownSender: "Jugador desconocido",
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
      tagline: "{{appName}} es tu arcade remoto para playtests de mesa rápidos.",
      description:
        "Lanza salas en tiempo real, reúne a tu equipo de pruebas y deja que {{appName}} automatice reglas, puntuaciones y moderación para que te concentres en la diversión.",
      runningOn: "Se ejecuta en {{platform}}",
      supportCta: "Apoyar al equipo",
    },
    support: {
      title: "Apoya al equipo de desarrollo",
      tagline: "Ayuda a que {{appName}} evolucione rápido y siga abierto para la comunidad de juegos de mesa.",
      description:
        "Hoy financiamos por nuestra cuenta los laboratorios de pruebas, la infraestructura y los eventos con la comunidad. Tu aporte mantiene los servidores en tiempo real, habilita más noches de playtest y nos permite lanzar la próxima oleada de prototipos.",
      team: {
        title: "Conoce al equipo central",
        members: {
          producer: {
            name: SUPPORT_TEAM_NAMES.es.producer,
            role: "Producto y sistemas en tiempo real",
            bio: "Organiza los prototipos, aterriza la hoja de ruta y mantiene el motor en tiempo real listo para cada sesión.",
          },
          designer: {
            name: SUPPORT_TEAM_NAMES.es.designer,
            role: "Diseño de juegos y UX",
            bio: "Convierte el feedback crudo de los playtests en mecánicas balanceadas, flujos pulidos y experiencias de bienvenida.",
          },
          engineer: {
            name: SUPPORT_TEAM_NAMES.es.engineer,
            role: "Ingeniería full-stack",
            bio: "Construye funciones multiplataforma, cuida la librería de componentes y mantiene el rendimiento fluido en todos los dispositivos.",
          },
        },
      },
      contribute: {
        title: "Formas de contribuir",
        sponsorTitle: "Patrocinio recurrente",
        sponsorDescription:
          "Configura un aporte mensual o anual que cubra hosting, sesiones de QA y nuevos prototipos de juegos.",
        sponsorCta: "Patrocinar desarrollo",
        coffeeTitle: "Impulso puntual",
        coffeeDescription:
          "¿Prefieres un agradecimiento rápido? Manda café y snacks al equipo para mantener la energía en los playtests nocturnos.",
        coffeeCta: "Invitar un café",
        paymentTitle: "Pago con tarjeta",
        paymentDescription:
          "Ingresa un monto y abriremos el checkout seguro de Payze en tu navegador.",
        paymentCta: "Ingresar monto",
        ibanTitle: "Transferencia bancaria",
        ibanDescription:
          "¿Necesitas pagar con tarjeta desde tu banco? Introduce el IBAN {{iban}} y envía fondos directo a {{appName}}.",
        ibanCta: "Copiar IBAN",
        ibanCopied: "IBAN copiado al portapapeles: {{iban}}",
      },
      thanks: "Cada contribución ayuda a que {{appName}} siga evolucionando. ¡Gracias por impulsar el futuro del juego de mesa remoto!",
      errors: {
        unableToOpen: "No pudimos abrir ese enlace. Intenta de nuevo en unos minutos.",
      },
    },
    payments: {
      title: "Pago seguro con tarjeta",
      intro:
        "Ingresa un monto y completa tu contribución en el checkout seguro de Payze.",
      amountLabel: "Importe",
      amountPlaceholder: "p. ej. 25",
      currencyLabel: "Moneda",
      currencyPlaceholder: "p. ej. GEL",
      noteLabel: "Nota opcional",
      notePlaceholder: "Deja un mensaje para el equipo",
      submit: "Continuar con el pago",
      status: {
        pending: "Abriendo el checkout de Payze...",
        success:
          "Checkout de Payze abierto en tu navegador. Completa el pago allí.",
        cancelled: "Checkout cerrado antes de iniciar. Puedes intentarlo de nuevo.",
      },
      errors: {
        amountRequired: "Introduce un importe válido mayor que cero.",
        sessionFailed:
          "No pudimos procesar el pago. Inténtalo otra vez en unos segundos.",
      },
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
      historyTab: "Historique",
      settingsTitle: "Paramètres",
  supportTitle: "Soutenir l'équipe",
  paymentTitle: "Paiement par carte",
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
          "Crée des salles en temps réel, invite tes amis et laisse {{appName}} gérer règles, score et modération.",
        featuredTitle: "Jeux à la une",
        featuredCaption:
          "Titres en accès anticipé que nous peaufinons encore. Touchez pour explorer les règles et réserver un créneau de test.",
        activeTitle: "Salles actives",
        activeCaption:
          "Rejoins un lobby déjà lancé ou regarde ce qui se passe en direct.",
        haveInvite: "Tu as un code d'invitation ?",
        filters: {
          statusLabel: "Statut",
          participationLabel: "Participation",
          status: {
            all: "Tous",
            lobby: "Lobby",
            inProgress: "En cours",
            completed: "Terminées",
          },
          participation: {
            all: "Tous",
            hosting: "J'héberge",
            joined: "Rejointes",
            notJoined: "Places libres",
          },
          participationSignedOut:
            "Connectez-vous pour filtrer par participation.",
        },
        loadingRooms: "Chargement des salles...",
        errorTitle: "Impossible d'atteindre le salon",
        emptyTitle: "Aucune salle pour le moment",
        emptyDescription:
          "Soyez le premier : lancez le premier lobby ou rafraîchissez dans quelques minutes.",
        filterEmptyTitle: "Aucune salle ne correspond à vos filtres",
        filterEmptyDescription:
          "Essayez un autre statut ou filtre de participation, ou réinitialisez-les pour tout voir.",
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
          "Rejoins {{game}} sur {{appName}}. Je créerai une salle dès que le prototype ouvrira !",
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
          enterFullscreen: "Plein écran",
          exitFullscreen: "Quitter le plein écran",
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
          title: "Historique",
          empty: "Aucun historique pour le moment.",
          composerPlaceholder: "Partagez une note rapide avec la table...",
          send: "Envoyer",
          checkboxLabelPlayers: "Seuls les joueurs peuvent voir ceci",
          checkboxLabelAll: "Tout le monde peut voir ceci",
          checkboxHint: "Touchez pour changer le public",
          playersOnlyTag: "Joueurs",
          you: "Vous",
          unknownSender: "Joueur inconnu",
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
        "{{appName}} est ton arcade connecté pour des playtests de plateau express.",
      description:
        "Crée des salles en temps réel, rassemble ton équipe de test et laisse {{appName}} automatiser règles, score et modération pour te concentrer sur le fun.",
      runningOn: "Fonctionne sur {{platform}}",
      supportCta: "Soutenir l'équipe",
    },
    support: {
      title: "Soutenir l'équipe de développement",
      tagline:
        "Aide {{appName}} à progresser rapidement tout en restant accessible à la communauté des jeux de société.",
      description:
        "Nos laboratoires de tests, l'infrastructure et les événements communautaires sont entièrement autofinancés. Ton soutien maintient les serveurs temps réel, finance de nouvelles soirées playtest et nous permet de livrer la prochaine vague de prototypes.",
      team: {
        title: "Rencontrez l'équipe cœur",
        members: {
          producer: {
            name: SUPPORT_TEAM_NAMES.fr.producer,
            role: "Produit & systèmes temps réel",
            bio: "Orchestre les prototypes, ajuste la feuille de route et veille au bon fonctionnement du moteur temps réel à chaque session.",
          },
          designer: {
            name: SUPPORT_TEAM_NAMES.fr.designer,
            role: "Game designer & UX",
            bio: "Transforme les retours de playtest en mécaniques équilibrées, parcours fluides et expériences accueillantes.",
          },
          engineer: {
            name: SUPPORT_TEAM_NAMES.fr.engineer,
            role: "Ingénieur full-stack",
            bio: "Déploie des fonctionnalités multiplateformes, maintient la bibliothèque de composants et garantit des performances constantes.",
          },
        },
      },
      contribute: {
        title: "Comment contribuer",
        sponsorTitle: "Parrainage récurrent",
        sponsorDescription:
          "Mets en place une contribution mensuelle ou annuelle pour financer l'hébergement, les sessions QA et de nouveaux prototypes.",
        sponsorCta: "Parrainer le développement",
        coffeeTitle: "Coup de pouce ponctuel",
        coffeeDescription:
          "Envie d'un merci rapide ? Offre café et encas pour garder l'équipe en forme pendant les playtests nocturnes.",
        coffeeCta: "Offrir un café",
        paymentTitle: "Paiement par carte",
        paymentDescription:
          "Indique un montant et nous ouvrons le checkout sécurisé de Payze dans ton navigateur.",
        paymentCta: "Saisir le montant",
        ibanTitle: "Virement bancaire",
        ibanDescription:
          "Besoin de payer par carte via ta banque ? Saisis l'IBAN {{iban}} pour envoyer des fonds directement à {{appName}}.",
        ibanCta: "Copier l'IBAN",
        ibanCopied: "IBAN copié dans le presse-papiers : {{iban}}",
      },
      thanks:
        "Chaque contribution fait évoluer {{appName}}. Merci de nous aider à imaginer l'avenir du jeu de plateau à distance !",
      errors: {
        unableToOpen: "Impossible d'ouvrir ce lien pour le moment. Réessaie bientôt.",
      },
    },
    payments: {
      title: "Paiement sécurisé par carte",
      intro:
        "Indique un montant et finalise ta contribution dans le checkout sécurisé de Payze.",
      amountLabel: "Montant",
      amountPlaceholder: "ex. 25",
      currencyLabel: "Devise",
      currencyPlaceholder: "ex. GEL",
      noteLabel: "Note optionnelle",
      notePlaceholder: "Ajoute un message pour l'équipe",
      submit: "Continuer vers le paiement",
      status: {
        pending: "Ouverture du checkout Payze...",
        success:
          "Checkout Payze ouvert dans ton navigateur. Termine le paiement là-bas.",
        cancelled: "Checkout fermé avant de démarrer. Tu peux réessayer.",
      },
      errors: {
        amountRequired: "Entre un montant valide supérieur à zéro.",
        sessionFailed:
          "Impossible de traiter le paiement. Réessaie dans un instant.",
      },
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
