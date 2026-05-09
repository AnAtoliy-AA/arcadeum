export const es = {
  admin: {
    title: 'Administración',
    welcome: 'Bienvenido al panel de administración',
    welcomeBody:
      'Los paneles aparecerán aquí a medida que se publiquen. Usa la barra lateral para navegar.',
    signedInAs: 'Sesión iniciada como {username}',
    nav: {
      dashboard: 'Panel',
      users: 'Usuarios',
      payments: 'Pagos',
      announcements: 'Anuncios',
      tournaments: 'Torneos',
      comingSoon: 'Próximamente',
    },
    error: {
      title: 'Algo salió mal',
      body: 'Se produjo un error al cargar esta página.',
      retry: 'Reintentar',
    },
    users: {
      title: 'Usuarios',
      search: { placeholder: 'Buscar por usuario, email o nombre' },
      filter: {
        role: { all: 'Todos los roles', placeholder: 'Filtrar por rol' },
      },
      table: {
        username: 'Usuario',
        email: 'Email',
        role: 'Rol',
        createdAt: 'Creado',
        actions: 'Acciones',
      },
      empty: {
        noResults: 'No hay usuarios que coincidan con los filtros.',
        noUsers: 'Aún no hay usuarios.',
      },
      pagination: {
        prev: 'Anterior',
        next: 'Siguiente',
        of: 'Página {current} de {total}',
      },
      totalLabel: '{total} usuarios',
      selfTooltip: 'No puedes cambiar tu propio rol.',
      role: {
        free: 'Gratis',
        premium: 'Premium',
        vip: 'VIP',
        supporter: 'Patrocinador',
        moderator: 'Moderador',
        tester: 'Tester',
        developer: 'Desarrollador',
        admin: 'Admin',
      },
      errors: {
        SELF_ROLE_CHANGE_FORBIDDEN: 'No puedes cambiar tu propio rol.',
        LAST_ADMIN_PROTECTED: 'No se puede degradar al último administrador.',
        USER_NOT_FOUND: 'Usuario no encontrado.',
        INVALID_USER_ID: 'Identificador de usuario no válido.',
        generic: 'Algo salió mal. Inténtalo de nuevo.',
      },
    },
    payments: {
      title: 'Pagos',
      search: { placeholder: 'Buscar por nota, nombre o ID de transacción' },
      filter: {
        visibility: {
          label: 'Visibilidad',
          all: 'Todos',
          public: 'Solo públicos',
          private: 'Solo privados',
        },
      },
      table: {
        user: 'Usuario',
        amount: 'Monto',
        note: 'Nota',
        visibility: 'Visibilidad',
        createdAt: 'Creado',
        transactionId: 'Transacción',
      },
      chip: { public: 'Público', private: 'Privado', anonymous: 'Anónimo' },
      empty: {
        noResults: 'No hay pagos que coincidan con los filtros.',
        noNotes: 'Aún no hay pagos.',
      },
      pagination: {
        prev: 'Anterior',
        next: 'Siguiente',
        of: 'Página {current} de {total}',
      },
      totalLabel: '{total} notas',
    },
  },
  tournaments: {
    title: 'Torneos',
    subtitle: 'Compite contra los mejores jugadores del mundo',
    description:
      'Únete a emocionantes torneos, escala los brackets y compite por premios exclusivos. Se añaden nuevos torneos regularmente.',
    features: [
      {
        title: 'Brackets dinámicos',
        description:
          'Sigue tu progreso a través de brackets actualizados en tiempo real.',
      },
      {
        title: 'Recompensas exclusivas',
        description:
          'Gana cosméticos premium, potenciadores y recompensas estacionales.',
      },
      {
        title: 'Matchmaking por nivel',
        description:
          'Compite contra jugadores de nivel similar para una experiencia justa.',
      },
    ],
    comingSoon: 'El modo torneo llegará pronto. ¡Mantente atento!',
  },
  blog: {
    title: 'Blog de Juegos',
    subtitle: 'Noticias, consejos e historias de la comunidad',
    description:
      'Mantente al día con las últimas guías, anuncios, consejos de estrategia e historias de jugadores de todo el mundo.',
    features: [
      {
        title: 'Últimas noticias',
        description:
          'Infórmate antes que nadie sobre nuevos juegos, funciones y actualizaciones.',
      },
      {
        title: 'Consejos PRO',
        description:
          'Aprende estrategias avanzadas de los mejores jugadores de la comunidad.',
      },
      {
        title: 'Historias de la comunidad',
        description:
          'Lee sobre las experiencias y logros de nuestros jugadores más dedicados.',
      },
    ],
    comingSoon: '¡Los artículos llegarán pronto!',
  },
  community: {
    title: 'Únete a la Comunidad',
    subtitle: 'Conecta con jugadores de todo el mundo',
    description:
      'Comparte estrategias, participa en eventos comunitarios y haz amigos que amen los juegos de mesa tanto como tú.',
    sections: {
      discord: {
        title: 'Discord',
        description:
          'Únete a nuestra activa comunidad en Discord para discutir juegos, reportar errores y conocer a otros jugadores.',
      },
      twitter: {
        title: 'Twitter / X',
        description:
          'Síguenos para estar al tanto de las últimas noticias, actualizaciones y anuncios.',
      },
      github: {
        title: 'Github',
        description:
          'Arcadeum es de código abierto. Contribuye al proyecto en Github.',
      },
    },
    comingSoon: '¡La comunidad llegará pronto!',
  },
  cookies: {
    title: 'Política de Cookies',
    lastUpdated: 'Última actualización: 25 de marzo de 2026',
    sections: {
      whatAreCookies: {
        title: '¿Qué Son las Cookies?',
        content:
          'Las cookies son pequeños archivos de texto almacenados en tu dispositivo cuando visitas nuestra plataforma. Nos ayudan a recordar tus preferencias y mantenerte conectado.',
      },
      howWeUse: {
        title: 'Cómo Usamos las Cookies',
        intro: 'Utilizamos cookies para los siguientes fines:',
        items: [
          'Cookies esenciales — necesarias para el correcto funcionamiento de la plataforma.',
          'Cookies de preferencias — recuerdan tu idioma, tema y configuración.',
          'Cookies analíticas — nos ayudan a mejorar la plataforma.',
        ],
      },
      thirdParty: {
        title: 'Cookies de Terceros',
        content:
          'No utilizamos cookies para rastrear actividad en sitios de terceros.',
      },
      managing: {
        title: 'Gestión de Cookies',
        content:
          'Puedes deshabilitar o eliminar las cookies desde la configuración de tu navegador en cualquier momento.',
      },
      contact: {
        title: '¿Preguntas?',
        content:
          'Si tienes preguntas sobre el uso de cookies, contáctanos a través de nuestra página de soporte.',
      },
    },
  },
  developers: {
    title: 'Desarrolladores',
    subtitle: 'Construye sobre la plataforma Arcadeum',
    description:
      'Explora nuestras APIs y herramientas para desarrolladores. Documentación completa y acceso sandbox disponibles próximamente.',
    features: [
      {
        title: 'APIs RESTful',
        description:
          'Accede a datos de jugadores, historial de juegos y clasificaciones.',
      },
      {
        title: 'Eventos WebSocket',
        description:
          'Integra actualizaciones en tiempo real en tus propias aplicaciones.',
      },
      {
        title: 'Entorno Sandbox',
        description:
          'Prueba tus integraciones en un entorno seguro antes de salir a producción.',
      },
    ],
    comingSoon: '¡El portal para desarrolladores llegará pronto!',
  },
  help: {
    title: 'Centro de Ayuda',
    subtitle: 'Encuentra respuestas a preguntas frecuentes',
    description:
      'Consulta artículos sobre juego, gestión de cuentas, facturación y más. Si no encuentras lo que buscas, nuestro equipo de soporte está listo para ayudarte.',
    features: [
      {
        title: 'Preguntas frecuentes',
        description:
          'Encuentra respuestas rápidas en nuestra amplia base de conocimientos.',
      },
      {
        title: 'Soporte directo',
        description:
          'Abre un ticket de soporte y recibe ayuda personalizada de nuestro equipo.',
      },
      {
        title: 'Ayuda de la comunidad',
        description:
          'Conecta con otros jugadores para compartir consejos y trucos.',
      },
    ],
    comingSoon: 'El centro de ayuda llegará pronto.',
  },
  leaderboards: {
    title: 'Clasificaciones',
    subtitle: 'Descubre tu posición entre los mejores jugadores',
    description:
      'Sigue tu posición en todos los juegos, compara estadísticas con amigos y sigue a los mejores jugadores. Las clasificaciones se actualizan en tiempo real.',
    live: 'En vivo',
    capturedAt: 'Capturado {time}',
    hero: {
      eyebrow: 'En vivo · Temporada 4',
      title: 'Persigue la clasificación.',
      tagline:
        'Actualizado cada 30 segundos. Los 100 mejores se preparan para la Copa.',
    },
    ticker: { live: 'En vivo' },
    modes: {
      all: { name: 'Todos los juegos', subtitle: 'Tabla combinada', icon: '◎' },
      critical: {
        name: 'Critical',
        subtitle: 'Cartas de alto riesgo',
        icon: '♠',
      },
      sea_battle: {
        name: 'Batalla naval',
        subtitle: 'Estrategia naval',
        icon: '⚓',
      },
    },
    cup: {
      eyebrow: 'Torneo',
      title: 'Copa de Otoño',
      endsIn: 'Termina en',
      prizePool: 'Bote de premios',
      participants: 'Participantes',
      qualifiedLabel: 'Clasificados',
      comingSoon: 'Próximamente',
      comingSoonBody:
        'Los torneos en vivo y los premios estarán disponibles muy pronto.',
    },
    mythic: {
      label: 'Mítico',
      streak: 'Racha de {count} partidas',
      leadOver: '+{delta} sobre #2',
      recentLabel: 'Últimas 12 partidas',
      challenge: '⚔ Desafiar',
      watch: '▶ Ver repetición',
      follow: 'Seguir',
      runnerUp: 'Subcampeón',
      thirdPlace: 'Tercer puesto',
    },
    controls: {
      global: 'Global',
      perGame: 'Por juego',
      tournaments: 'Torneos',
      friends: 'Amigos',
      regional: 'Regional',
      searchPlaceholder: 'Buscar jugador…',
      jumpToMe: '↓ Ir a mí',
      ranges: {
        today: 'Hoy',
        week: 'Semana',
        month: 'Mes',
        season: 'Temporada',
      },
    },
    table: {
      rank: '#',
      player: 'Jugador',
      region: 'Región',
      rating: 'Puntuación',
      record: 'V–D–E',
      winrate: 'Ratio',
      form: 'Forma',
      trend: 'Tendencia',
    },
    trend: {
      up: 'Sube {n}',
      down: 'Baja {n}',
      same: 'Sin cambios',
    },
    climbers: { title: 'Mayores ascensos' },
    fallers: { title: 'Mayores caídas' },
    squads: { title: 'Mejores escuadras', members: '{count} miembros' },
    regions: {
      title: 'Por región',
      na: 'Norteamérica',
      eu: 'Europa',
      sa: 'Sudamérica',
      asia: 'Asia',
      oceania: 'Oceanía',
      africa: 'África',
      me: 'Oriente Medio',
    },
    rewards: {
      title: 'Escala de recompensas',
      mythic: 'Corona mítica + 12k oro',
      diamond: 'Fragmento diamante + 6k oro',
      platinum: 'Trofeo platino + 3k oro',
      gold: '1k oro + cosmético',
    },
    self: {
      pinned: 'Tu rango',
      unranked: 'Sin clasificar — juega 5 partidas clasificadas para aparecer',
      share: 'Compartir',
    },
    loadMore: 'Cargar más',
    freshness: {
      updatedAt: 'Actualizado {ago}',
      justNow: 'ahora mismo',
      secondsAgo: 'hace {n} s',
      minutesAgo: 'hace {n} min',
      hoursAgo: 'hace {n} h',
    },
    profile: {
      eyebrow: 'Jugador',
      placeholder:
        'El perfil completo con historial de puntuación, partidas recientes e info de escuadra llegará pronto.',
      back: 'Volver a la clasificación',
    },
    empty: {
      title: 'Aún no hay clasificaciones',
      body: 'Sé el primero en escalar la clasificación.',
    },
    errorState: {
      title: 'No se pudo cargar la clasificación',
      retry: 'Reintentar',
    },
    features: [
      {
        title: 'Clasificación de amigos',
        description:
          'Mira cómo te comparas con tus amigos y desafíalos por el primer puesto.',
      },
      {
        title: 'Clasificaciones globales',
        description:
          'Compite por el puesto #1 a nivel mundial en todos nuestros juegos.',
      },
      {
        title: 'Historial por temporadas',
        description: 'Revisa tu desempeño pasado y observa cómo has mejorado.',
      },
    ],
    comingSoon: '¡Las clasificaciones globales llegarán pronto!',
  },
  rewards: {
    title: 'Recompensas',
    subtitle: 'Gana bonos exclusivos mientras juegas',
    description:
      'Nuestro programa de recompensas está diseñado para agradecer a nuestros jugadores más activos. Gana puntos por cada partida y canjéalos por artículos premium.',
    features: [
      {
        title: 'Bonos diarios',
        description:
          'Inicia sesión cada día para reclamar tu recompensa diaria.',
      },
      {
        title: 'Pases de temporada',
        description:
          'Desbloquea una ruta de recompensas participando en eventos estacionales.',
      },
      {
        title: 'Programa de referidos',
        description:
          'Invita a tus amigos y gana bonos por cada nuevo jugador que se una.',
      },
    ],
    comingSoon: '¡La tienda de recompensas llegará pronto!',
  },
};
