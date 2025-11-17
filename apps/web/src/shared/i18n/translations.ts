import { appConfig } from "../config/app-config";

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join("{appName}");
}

const enTranslations = {
  common: {
    languageNames: {
      en: "English",
      es: "Spanish",
      fr: "French",
    },
    labels: {
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      username: "Username",
    },
    actions: {
      login: "Sign in",
      register: "Create account",
      logout: "Sign out",
      openApp: "Open app",
    },
    prompts: {
      haveAccount: "Already have an account?",
      needAccount: "Need an account?",
    },
    statuses: {
      authenticated: "You are signed in.",
    },
  },
  home: {
    kicker: appConfig.kicker,
    tagline: withAppNamePlaceholder(appConfig.tagline),
    description: withAppNamePlaceholder(appConfig.description),
    primaryCtaLabel: appConfig.primaryCta.label,
    supportCtaLabel: appConfig.supportCta.label,
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
  },
  settings: {
    title: "Settings",
    description: "Manage your appearance, language, and download preferences for the {appName} web experience.",
    appearanceTitle: "Appearance",
    appearanceDescription: "Choose a theme to use across the {appName} web experience.",
    themeOptions: {
      system: {
        label: "Match system appearance",
        description: "Follow your operating system preference automatically.",
      },
      light: {
        label: "Light",
        description: "Bright neutrals with airy surfaces and subtle gradients.",
      },
      dark: {
        label: "Dark",
        description: "Contemporary midnight palette ideal for low-light play.",
      },
      neonLight: {
        label: "Neon Light",
        description: "Arcade-inspired glow with luminous panels and neon edges.",
      },
      neonDark: {
        label: "Neon Dark",
        description: "High-contrast vaporwave styling for dramatic game tables.",
      },
    },
    languageTitle: "Language",
    languageDescription: "Interface translations are a work in progress. Save your preference for upcoming updates.",
    languageOptionLabels: {
      en: "English",
      es: "Español",
      fr: "Français",
    },
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    accountTitle: "Account",
    accountDescription: "Web sign-in is rolling out soon. In the meantime, manage your subscriptions via the dashboard or continue in the mobile app.",
    accountGuestStatus: "You are browsing as a guest.",
    accountPrimaryCta: "Go to sign-in",
    accountSupportCtaLabel: appConfig.supportCta.label,
  },
  support: {
    title: "Support the developers",
    tagline: "Keep {appName} iterating quickly and accessible to the tabletop community.",
    description:
      "Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.",
    thanks:
      "Every contribution keeps {appName} evolving. Thank you for helping us build the future of remote tabletop play!",
    teamSectionTitle: "Meet the core team",
    actionsSectionTitle: "Ways to contribute",
    team: {
      producer: {
        role: "Product & realtime systems",
        bio: "Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.",
      },
      designer: {
        role: "Game designer & UX",
        bio: "Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.",
      },
      engineer: {
        role: "Full-stack engineer",
        bio: "Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.",
      },
    },
    actions: {
      payment: {
        title: "Card payment",
        description: "Enter an amount and we'll open UniPAY's secure checkout in your browser.",
        cta: "Enter amount",
      },
      sponsor: {
        title: "Recurring sponsorship",
        description: "Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.",
        cta: "Sponsor development",
      },
      coffee: {
        title: "One-time boost",
        description: "Prefer a quick thank-you? Send the crew coffee and snacks so late-night playtests stay energized.",
        cta: "Buy the team a coffee",
      },
      iban: {
        title: "Bank transfer",
        description: "Need to pay by card through your bank? Enter the IBAN {iban} to send funds directly to {appName}.",
        cta: "Copy IBAN details",
        successMessage: "IBAN copied to clipboard: {iban}",
      },
    },
  },
  auth: {
    badge: "Early access",
    title: "Sign in to {appName}",
    description: "We're inviting creators in waves while we finish rolling out secure sign-in for {appName}.",
    statusHeadline: "Web sign-in is rolling out soon.",
    statusDescription:
      "Request early access and we'll notify you when your account is ready, or continue on mobile today.",
    primaryCtaLabel: "Contact the team",
    secondaryCtaLabel: appConfig.primaryCta.label,
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    homeLinkLabel: "Back to home",
    shortcuts: {
      browseGames: "Browse games without signing in",
    },
    sections: {
      local: "Email sign-in",
      oauth: "Google sign-in",
      status: "Session status",
    },
    providers: {
      guest: "Guest",
      local: "Email",
      oauth: "Google",
    },
    statuses: {
      processing: "Processing...",
      redirecting: "Redirecting...",
      loadingSession: "Loading session...",
    },
    local: {
      loginTitle: "Sign in with email",
      registerTitle: "Create an email account",
      helper: {
        allowedCharacters:
          "Usernames can include letters, numbers, underscores, and hyphens.",
      },
      errors: {
        passwordMismatch: "Passwords do not match.",
        usernameTooShort: "Username must be at least 3 characters.",
      },
    },
    oauth: {
      title: "Continue with Google",
      loginButton: "Continue with Google",
      logoutButton: "Disconnect Google",
      accessTokenLabel: "Google access token",
      authorizationCodeLabel: "Authorization code",
    },
    statusCard: {
      heading: "Current session",
      description:
        "Manage your {appName} web session, review the linked identity, and disconnect when you're done.",
      sessionActive: "You are signed in on the web.",
      signOutLabel: "Sign out",
      guestDescription: "Your {appName} web session details will appear here once you sign in.",
      details: {
        provider: "Provider",
        displayName: "Display name",
        userId: "User ID",
        accessExpires: "Access expires",
        refreshExpires: "Refresh expires",
        updated: "Updated",
        sessionAccessToken: "Session access token",
        refreshToken: "Refresh token",
      },
    },
  },
  navigation: {
    chatsTab: "Chats",
    gamesTab: "Games",
    historyTab: "History",
    settingsTab: "Settings",
  },
  chat: {
    notFound: "Chat not found",
    status: {
      connected: "Connected",
      connecting: "Connecting...",
    },
    input: {
      placeholder: "Type a message...",
      ariaLabel: "Message input",
    },
    send: "Send",
  },
  chatList: {
    search: {
      placeholder: "Search users...",
      ariaLabel: "Search for users to chat with",
    },
    empty: {
      noChats: "No chats yet. Start a conversation!",
      unauthenticated: "Sign in to start chatting",
    },
    messages: {
      directChat: "Direct Chat",
    },
  },
  games: {
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
  },
  history: {
    unknownGame: "Unknown Game",
    loading: "Loading history...",
    list: {
      emptyNoEntries: "No game history yet",
      emptySignedOut: "Sign in to view your game history",
    },
    search: {
      label: "Search history",
      placeholder: "Search by room name or participant...",
      noResults: "No games match your search",
    },
    filter: {
      label: "Filter by status",
      all: "All Statuses",
      clear: "Clear Filters",
    },
    pagination: {
      showing: "Showing {count} of {total} games",
      loadMore: "Load More",
      loading: "Loading...",
    },
    status: {
      lobby: "Lobby",
      in_progress: "In Progress",
      inProgress: "In Progress",
      completed: "Completed",
      waiting: "Waiting",
      active: "Active",
    },
    actions: {
      viewDetails: "View Details",
      refresh: "Refresh",
      retry: "Retry",
    },
    detail: {
      backToList: "Back",
      loading: "Loading details...",
      lastActivity: "Last activity: {timestamp}",
      rematchTitle: "Start a Rematch",
      rematchDescription: "Select participants to invite to a new game.",
      rematchAction: "Start Rematch",
      rematchCreating: "Creating...",
      participantsTitle: "Participants",
      hostLabel: "Host",
      removeTitle: "Remove from History",
      removeDescription: "This will remove this entry from your history. This action cannot be undone.",
      removeAction: "Remove",
      removeConfirm: "Remove",
      removeRemoving: "Removing...",
      removeCancel: "Cancel",
      logsTitle: "Activity Log",
      noLogs: "No activity logged.",
      scopePlayers: "Players",
      scopeAll: "All",
      sender: "From {name}",
    },
    errors: {
      authRequired: "Authentication required",
      detailRemoved: "This game has been removed from history.",
      detailFailed: "Failed to load details",
      rematchMinimum: "Select at least one participant",
      removeFailed: "Failed to remove from history",
    },
  },
  payments: {
    title: "Payment",
    amountLabel: "Amount",
    amountPlaceholder: "0.00",
    amountAria: "Payment amount",
    currencyLabel: "Currency",
    currencyPlaceholder: "GEL",
    currencyAria: "Currency code",
    noteLabel: "Note (optional)",
    notePlaceholder: "Add a note...",
    noteAria: "Payment note or description",
    submit: "Create Payment",
    submitting: "Processing...",
    status: {
      success: "Payment session created successfully!",
    },
    errors: {
      invalidAmount: "Please enter a valid amount",
      amountTooLarge: "Amount is too large. Maximum is 1,000,000",
      invalidUrl: "Invalid payment URL received",
      noUrl: "No payment URL received",
      failed: "Payment failed",
    },
  },
};

export const translations = {
  en: enTranslations,
  es: {
    common: {
      languageNames: {
        en: "Inglés",
        es: "Español",
        fr: "Francés",
      },
      labels: {
        email: "Correo electrónico",
        password: "Contraseña",
        confirmPassword: "Confirmar contraseña",
        username: "Nombre de usuario",
      },
      actions: {
        login: "Iniciar sesión",
        register: "Crear cuenta",
        logout: "Cerrar sesión",
        openApp: "Abrir app",
      },
      prompts: {
        haveAccount: "¿Ya tienes una cuenta?",
        needAccount: "¿Necesitas una cuenta?",
      },
      statuses: {
        authenticated: "Has iniciado sesión.",
      },
    },
    home: {
      kicker: "Arcade remoto para juegos de mesa",
      tagline: "{appName} es tu arcade remoto para pruebas rápidas de juegos de mesa.",
      description:
        "Crea salas en tiempo real, reúne a tu equipo de pruebas y deja que {appName} automatice reglas, puntuaciones y moderación para que te concentres en la diversión.",
      primaryCtaLabel: "Comenzar",
      supportCtaLabel: "Apoyar a los desarrolladores",
      downloadsTitle: "Instala las apps móviles",
      downloadsDescription:
        "Descarga las últimas compilaciones de Expo para iOS y Android directamente desde la web.",
      downloadsIosLabel: "Descargar para iOS",
      downloadsAndroidLabel: "Descargar para Android",
    },
    settings: {
      title: "Configuración",
      description:
        "Administra la apariencia, el idioma y las descargas para la experiencia web de {appName}.",
      appearanceTitle: "Apariencia",
      appearanceDescription:
        "Elige un tema para usar en toda la experiencia web de {appName}.",
      themeOptions: {
        system: {
          label: "Coincidir con el sistema",
          description: "Sigue automáticamente la preferencia de tu sistema operativo.",
        },
        light: {
          label: "Claro",
          description:
            "Blancos nítidos con degradados sutiles y un cromado luminoso.",
        },
        dark: {
          label: "Oscuro",
          description:
            "Paleta nocturna perfecta para sesiones en ambientes con poca luz.",
        },
        neonLight: {
          label: "Neón claro",
          description:
            "Brillo inspirado en arcades con paneles luminosos y bordes neón.",
        },
        neonDark: {
          label: "Neón oscuro",
          description:
            "Estilo vaporwave de alto contraste para mesas dramáticas.",
        },
      },
      languageTitle: "Idioma",
      languageDescription:
        "Las traducciones de la interfaz siguen en desarrollo. Guarda tu preferencia para las próximas actualizaciones.",
      languageOptionLabels: {
        en: "Inglés",
        es: "Español",
        fr: "Francés",
      },
      downloadsTitle: "Compilaciones móviles",
      downloadsDescription:
        "Descarga las últimas compilaciones de Expo para mantener los clientes móviles sincronizados con la versión web.",
      downloadsIosLabel: "Descargar para iOS",
      downloadsAndroidLabel: "Descargar para Android",
      accountTitle: "Cuenta",
      accountDescription:
        "El inicio de sesión web llegará pronto. Mientras tanto, administra tus suscripciones en el panel o continúa en la app móvil.",
      accountGuestStatus: "Estás navegando como invitado.",
      accountPrimaryCta: "Ir a iniciar sesión",
      accountSupportCtaLabel: "Apoyar a los desarrolladores",
    },
    support: {
      title: "Apoya a los desarrolladores",
      tagline: "Mantén {appName} iterando rápidamente y accesible para la comunidad de juegos de mesa.",
      description:
        "Los laboratorios, la infraestructura y los eventos comunitarios de Arcade actualmente se financian a sí mismos. Tu aporte mantiene en línea los servidores en tiempo real, desbloquea más noches de pruebas y nos ayuda a lanzar la próxima ola de prototipos.",
      thanks:
        "Cada contribución mantiene a {appName} evolucionando. ¡Gracias por ayudarnos a construir el futuro de las pruebas de juegos de mesa a distancia!",
      teamSectionTitle: "Conoce al equipo",
      actionsSectionTitle: "Cómo contribuir",
      team: {
        producer: {
          role: "Producto y sistemas en tiempo real",
          bio: "Mantiene los prototipos organizados, las hojas de ruta realistas y el motor en tiempo real funcionando en cada sesión de pruebas.",
        },
        designer: {
          role: "Diseño de juegos y UX",
          bio: "Transforma comentarios en mecánicas equilibradas, flujos pulidos y experiencias de incorporación acogedoras.",
        },
        engineer: {
          role: "Ingeniería full-stack",
          bio: "Construye funciones multiplataforma, mantiene el kit de componentes y garantiza un rendimiento ágil en todos los dispositivos.",
        },
      },
      actions: {
        payment: {
          title: "Pago con tarjeta",
          description:
            "Ingresa un importe y abriremos en tu navegador el checkout seguro de UniPAY.",
          cta: "Ingresar importe",
        },
        sponsor: {
          title: "Patrocinio recurrente",
          description:
            "Configura una contribución mensual o anual para cubrir hosting, QA y nuevos prototipos de juegos.",
          cta: "Patrocinar desarrollo",
        },
        coffee: {
          title: "Impulso puntual",
          description:
            "¿Prefieres un agradecimiento rápido? Envía café y meriendas para que las sesiones nocturnas sigan con energía.",
          cta: "Invitar un café",
        },
        iban: {
          title: "Transferencia bancaria",
          description:
            "¿Necesitas pagar desde tu banco? Introduce el IBAN {iban} para enviar fondos directamente a {appName}.",
          cta: "Copiar datos de IBAN",
          successMessage: "IBAN copiado al portapapeles: {iban}",
        },
      },
    },
    auth: {
      badge: "Acceso anticipado",
      title: "Inicia sesión en {appName}",
      description:
        "Estamos invitando a creadores por etapas mientras finalizamos el lanzamiento del inicio de sesión seguro de {appName}.",
      statusHeadline: "El inicio de sesión web llegará pronto.",
      statusDescription:
        "Solicita acceso temprano y te avisaremos cuando tu cuenta esté lista, o continúa en móvil hoy mismo.",
      primaryCtaLabel: "Contactar al equipo",
      secondaryCtaLabel: appConfig.primaryCta.label,
      downloadsTitle: "Compilaciones móviles",
      downloadsDescription:
        "Descarga las últimas compilaciones de Expo para mantener los clientes móviles sincronizados con la versión web.",
      downloadsIosLabel: "Descargar para iOS",
      downloadsAndroidLabel: "Descargar para Android",
      homeLinkLabel: "Volver al inicio",
      shortcuts: {
        browseGames: "Explorar juegos sin iniciar sesión",
      },
      sections: {
        local: "Inicio de sesión con correo",
        oauth: "Google",
        status: "Estado de la sesión",
      },
      providers: {
        guest: "Invitado",
        local: "Correo electrónico",
        oauth: "Google",
      },
      statuses: {
        processing: "Procesando...",
        redirecting: "Redirigiendo...",
        loadingSession: "Cargando sesión...",
      },
      local: {
        loginTitle: "Inicia sesión con correo electrónico",
        registerTitle: "Crea una cuenta con correo",
        helper: {
          allowedCharacters:
            "Caracteres permitidos: letras, números, guiones bajos y guiones.",
        },
        errors: {
          passwordMismatch: "Las contraseñas no coinciden.",
          usernameTooShort: "El nombre de usuario debe tener al menos 3 caracteres.",
        },
      },
      oauth: {
        title: "Continuar con Google",
        loginButton: "Continuar con Google",
        logoutButton: "Desconectar Google",
        accessTokenLabel: "Token de acceso de Google",
        authorizationCodeLabel: "Código de autorización",
      },
      statusCard: {
        heading: "Sesión actual",
        description:
          "Administra tu sesión web de {appName}, revisa la identidad vinculada y desconéctate cuando termines.",
        sessionActive: "Has iniciado sesión en la web.",
        signOutLabel: "Cerrar sesión",
        guestDescription:
          "Los detalles de tu sesión web de {appName} aparecerán aquí cuando inicies sesión.",
        details: {
          provider: "Proveedor",
          displayName: "Nombre visible",
          userId: "ID de usuario",
          accessExpires: "Vencimiento del acceso",
          refreshExpires: "Vencimiento del token de actualización",
          updated: "Actualizado",
          sessionAccessToken: "Token de acceso de la sesión",
          refreshToken: "Token de actualización",
        },
      },
    },
    navigation: {
      chatsTab: "Chats",
      gamesTab: "Juegos",
      historyTab: "Historial",
      settingsTab: "Configuración",
    },
    chat: {
      notFound: "Chat no encontrado",
      status: {
        connected: "Conectado",
        connecting: "Conectando...",
      },
      input: {
        placeholder: "Escribe un mensaje...",
        ariaLabel: "Entrada de mensaje",
      },
      send: "Enviar",
    },
    chatList: {
      search: {
        placeholder: "Buscar usuarios...",
        ariaLabel: "Buscar usuarios para chatear",
      },
      empty: {
        noChats: "Aún no hay chats. ¡Inicia una conversación!",
        unauthenticated: "Inicia sesión para chatear",
      },
      messages: {
        directChat: "Chat Directo",
      },
    },
    games: {
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
    },
    history: {
      list: {
        emptyNoEntries: "Aún no hay historial de juegos",
        emptySignedOut: "Inicia sesión para ver tu historial de juegos",
      },
      status: {
        lobby: "Sala de espera",
        in_progress: "En progreso",
        completed: "Completado",
        waiting: "Esperando",
        active: "Activo",
      },
    },
    payments: {
      title: "Pago",
      amountLabel: "Cantidad",
      amountPlaceholder: "0.00",
      amountAria: "Monto del pago",
      currencyLabel: "Moneda",
      currencyPlaceholder: "GEL",
      currencyAria: "Código de moneda",
      noteLabel: "Nota (opcional)",
      notePlaceholder: "Agregar una nota...",
      noteAria: "Nota o descripción del pago",
      submit: "Crear Pago",
      submitting: "Procesando...",
      status: {
        success: "¡Sesión de pago creada exitosamente!",
      },
      errors: {
        invalidAmount: "Por favor ingresa una cantidad válida",
        amountTooLarge: "La cantidad es demasiado grande. El máximo es 1,000,000",
        invalidUrl: "URL de pago inválida recibida",
        noUrl: "No se recibió URL de pago",
        failed: "El pago falló",
      },
    },
  },
  fr: {
    common: {
      languageNames: {
        en: "Anglais",
        es: "Espagnol",
        fr: "Français",
      },
      labels: {
        email: "E-mail",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        username: "Nom d'utilisateur",
      },
      actions: {
        login: "Se connecter",
        register: "S'inscrire",
        logout: "Se déconnecter",
        openApp: "Ouvrir l'application",
      },
      prompts: {
        haveAccount: "Vous avez déjà un compte ?",
        needAccount: "Besoin d'un compte ?",
      },
      statuses: {
        authenticated: "Vous êtes connecté.",
      },
    },
    home: {
      kicker: "Arcade à distance pour les jeux de société",
      tagline: "{appName} est votre arcade à distance pour des playtests rapides de jeux de société.",
      description:
        "Créez des salons en temps réel, rassemblez votre équipe de test et laissez {appName} automatiser règles, scores et modération pour que vous puissiez vous concentrer sur le plaisir.",
      primaryCtaLabel: "Commencer",
      supportCtaLabel: "Soutenir les développeurs",
      downloadsTitle: "Installer les applications mobiles",
      downloadsDescription:
        "Téléchargez les dernières versions Expo pour iOS et Android directement depuis le web.",
      downloadsIosLabel: "Télécharger pour iOS",
      downloadsAndroidLabel: "Télécharger pour Android",
    },
    settings: {
      title: "Paramètres",
      description:
        "Gérez l'apparence, la langue et les téléchargements pour l'expérience web de {appName}.",
      appearanceTitle: "Apparence",
      appearanceDescription:
        "Choisissez un thème à utiliser sur l'ensemble de l'expérience web de {appName}.",
      themeOptions: {
        system: {
          label: "Suivre le système",
          description:
            "Suit automatiquement la préférence de votre système d'exploitation.",
        },
        light: {
          label: "Clair",
          description:
            "Blancs nets avec dégradés subtils et chrome lumineux.",
        },
        dark: {
          label: "Sombre",
          description:
            "Palette nocturne idéale pour les sessions dans un environnement peu éclairé.",
        },
        neonLight: {
          label: "Néon clair",
          description:
            "Éclat inspiré des arcades avec des panneaux lumineux et des bordures néon.",
        },
        neonDark: {
          label: "Néon sombre",
          description:
            "Style vaporwave à fort contraste pour des tables spectaculaires.",
        },
      },
      languageTitle: "Langue",
      languageDescription:
        "Les traductions de l'interface sont en cours. Enregistrez votre préférence pour les prochaines mises à jour.",
      languageOptionLabels: {
        en: "Anglais",
        es: "Espagnol",
        fr: "Français",
      },
      downloadsTitle: "Versions mobiles",
      downloadsDescription:
        "Récupérez les dernières versions Expo pour garder les applications mobiles synchronisées avec la version web.",
      downloadsIosLabel: "Télécharger pour iOS",
      downloadsAndroidLabel: "Télécharger pour Android",
      accountTitle: "Compte",
      accountDescription:
        "La connexion web arrive bientôt. En attendant, gérez vos abonnements via le tableau de bord ou continuez dans l'application mobile.",
      accountGuestStatus: "Vous naviguez en tant qu'invité.",
      accountPrimaryCta: "Aller à la connexion",
      accountSupportCtaLabel: "Soutenir les développeurs",
    },
    support: {
      title: "Soutenir les développeurs",
      tagline: "Aidez {appName} à itérer rapidement et à rester accessible à la communauté des jeux de société.",
      description:
        "Les laboratoires, l'infrastructure et les événements communautaires d'Arcade sont aujourd'hui autofinancés. Votre soutien maintient les serveurs temps réel en ligne, débloque davantage de soirées de playtest et nous aide à sortir la prochaine vague de prototypes.",
      thanks:
        "Chaque contribution permet à {appName} de progresser. Merci de nous aider à bâtir l'avenir du jeu de société à distance !",
      teamSectionTitle: "Rencontrez l'équipe",
      actionsSectionTitle: "Comment contribuer",
      team: {
        producer: {
          role: "Produit et systèmes temps réel",
          bio: "Garde les prototypes organisés, les feuilles de route réalistes et le moteur temps réel fluide pour chaque session de test.",
        },
        designer: {
          role: "Game design et UX",
          bio: "Transforme les retours en mécaniques équilibrées, parcours raffinés et expériences d'accueil chaleureuses.",
        },
        engineer: {
          role: "Ingénierie full-stack",
          bio: "Construit des fonctionnalités multiplateformes, entretient la boîte à outils de composants et garantit des performances réactives sur tous les appareils.",
        },
      },
      actions: {
        payment: {
          title: "Paiement par carte",
          description:
            "Saisissez un montant et nous ouvrirons le paiement sécurisé UniPAY dans votre navigateur.",
          cta: "Entrer un montant",
        },
        sponsor: {
          title: "Parrainage récurrent",
          description:
            "Configurez une contribution mensuelle ou annuelle pour financer l'hébergement, les sessions de QA et les nouveaux prototypes de jeux.",
          cta: "Soutenir le développement",
        },
        coffee: {
          title: "Coup de pouce ponctuel",
          description:
            "Envie d'un merci rapide ? Offrez un café et des collations pour dynamiser les playtests nocturnes.",
          cta: "Offrir un café",
        },
        iban: {
          title: "Virement bancaire",
          description:
            "Besoin de payer par carte via votre banque ? Saisissez l'IBAN {iban} pour envoyer des fonds directement à {appName}.",
          cta: "Copier l'IBAN",
          successMessage: "IBAN copié dans le presse-papiers : {iban}",
        },
      },
    },
    auth: {
      badge: "Accès anticipé",
      title: "Connectez-vous à {appName}",
      description:
        "Nous ouvrons progressivement l'accès aux créateurs pendant que nous finalisons le déploiement de la connexion sécurisée pour {appName}.",
      statusHeadline: "La connexion web arrive bientôt.",
      statusDescription:
        "Demandez un accès anticipé et nous vous préviendrons quand votre compte sera prêt, ou continuez sur mobile dès aujourd'hui.",
      primaryCtaLabel: "Contacter l'équipe",
      secondaryCtaLabel: appConfig.primaryCta.label,
      downloadsTitle: "Versions mobiles",
      downloadsDescription:
        "Récupérez les dernières versions Expo pour garder les applications mobiles synchronisées avec la version web.",
      downloadsIosLabel: "Télécharger pour iOS",
      downloadsAndroidLabel: "Télécharger pour Android",
      homeLinkLabel: "Retour à l'accueil",
      shortcuts: {
        browseGames: "Explorer les jeux sans se connecter",
      },
      sections: {
        local: "Connexion par e-mail",
        oauth: "Connexion Google",
        status: "Statut de session",
      },
      providers: {
        guest: "Invité",
        local: "E-mail",
        oauth: "Google",
      },
      statuses: {
        processing: "Traitement...",
        redirecting: "Redirection...",
        loadingSession: "Chargement de la session...",
      },
      local: {
        loginTitle: "Se connecter avec un e-mail",
        registerTitle: "Créer un compte par e-mail",
        helper: {
          allowedCharacters:
            "Caractères autorisés : lettres, chiffres, underscores et tirets.",
        },
        errors: {
          passwordMismatch: "Les mots de passe ne correspondent pas.",
          usernameTooShort:
            "Le nom d'utilisateur doit comporter au moins 3 caractères.",
        },
      },
      oauth: {
        title: "Continuer avec Google",
        loginButton: "Continuer avec Google",
        logoutButton: "Déconnecter Google",
        accessTokenLabel: "Jeton d'accès Google",
        authorizationCodeLabel: "Code d'autorisation",
      },
      statusCard: {
        heading: "Session actuelle",
        description:
          "Gérez votre session web {appName}, vérifiez l'identité associée et déconnectez-vous quand vous avez terminé.",
        sessionActive: "Vous êtes connecté sur le web.",
        signOutLabel: "Se déconnecter",
        guestDescription:
          "Les détails de votre session web {appName} apparaîtront ici une fois connecté.",
        details: {
          provider: "Fournisseur",
          displayName: "Nom affiché",
          userId: "ID utilisateur",
          accessExpires: "Expiration de l'accès",
          refreshExpires: "Expiration du jeton d'actualisation",
          updated: "Mis à jour",
          sessionAccessToken: "Jeton d'accès de session",
          refreshToken: "Jeton d'actualisation",
        },
      },
    },
    navigation: {
      chatsTab: "Discussions",
      gamesTab: "Jeux",
      historyTab: "Historique",
      settingsTab: "Paramètres",
    },
    chat: {
      notFound: "Discussion introuvable",
      status: {
        connected: "Connecté",
        connecting: "Connexion...",
      },
      input: {
        placeholder: "Écrire un message...",
        ariaLabel: "Saisie de message",
      },
      send: "Envoyer",
    },
    chatList: {
      search: {
        placeholder: "Rechercher des utilisateurs...",
        ariaLabel: "Rechercher des utilisateurs avec qui discuter",
      },
      empty: {
        noChats: "Aucune discussion pour le moment. Lancez une conversation !",
        unauthenticated: "Connectez-vous pour discuter",
      },
      messages: {
        directChat: "Discussion Directe",
      },
    },
    games: {
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
    },
    history: {
      list: {
        emptyNoEntries: "Aucun historique de jeu pour le moment",
        emptySignedOut: "Connectez-vous pour voir votre historique de jeu",
      },
      status: {
        lobby: "Salon d'attente",
        in_progress: "En cours",
        completed: "Terminé",
        waiting: "En attente",
        active: "Actif",
      },
    },
    payments: {
      title: "Paiement",
      amountLabel: "Montant",
      amountPlaceholder: "0.00",
      amountAria: "Montant du paiement",
      currencyLabel: "Devise",
      currencyPlaceholder: "GEL",
      currencyAria: "Code de devise",
      noteLabel: "Note (optionnel)",
      notePlaceholder: "Ajouter une note...",
      noteAria: "Note ou description du paiement",
      submit: "Créer un Paiement",
      submitting: "Traitement...",
      status: {
        success: "Session de paiement créée avec succès !",
      },
      errors: {
        invalidAmount: "Veuillez saisir un montant valide",
        amountTooLarge: "Le montant est trop élevé. Le maximum est de 1 000 000",
        invalidUrl: "URL de paiement invalide reçue",
        noUrl: "Aucune URL de paiement reçue",
        failed: "Le paiement a échoué",
      },
    },
  },
};
