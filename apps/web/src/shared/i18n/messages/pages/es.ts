import { helpEs } from './help/es';
import { adminAnnouncementsEs } from './admin-announcements/es';
import { adminTournamentsEs } from './admin-tournaments/es';
import { walletEs } from './wallet/es';
import { adminWalletEs } from './admin-wallet/es';
import { gemsEs } from './gems/es';
import { adminGemPackagesEs } from './admin-gem-packages/es';
import { adminEconomyEs } from './admin-economy/es';
import { adminStatisticsEs } from './admin-statistics/es';
import { dailyRewardsEs } from './daily-rewards/es';
import { dailyChallengesEs } from './daily-challenges/es';
import { achievementsEs } from './achievements/es';
import { shopEs } from './shop/es';
import { adminShopEs } from './admin-shop/es';
import { adminGamesEs } from './admin-games/es';
import { adminBlockedIpsEs } from './admin-blocked-ips/es';
import { adminUsersEs } from './admin-users/es';
import { adminBulkRewardsEs } from './admin-bulk-rewards/es';
import { friendsEs } from './friends/es';
import { clansEs } from './clans/es';
import { eventsEs } from './events/es';
import { seasonsEs } from './seasons/es';
import { communityEs } from './community/es';
import { rewardsEs } from './rewards/es';
import { developersEs } from './developers/es';
import { blogEs } from './blog/es';
import { changelogEs } from './changelog/es';
import { roadmapEs } from './roadmap/es';

export const es = {
  admin: {
    title: 'Administración',
    welcome: 'Bienvenido al panel de administración',
    welcomeBody:
      'Los paneles aparecerán aquí a medida que se publiquen. Usa la barra lateral para navegar.',
    signedInAs: 'Sesión iniciada como {username}',
    nav: {
      dashboard: 'Panel',
      statistics: 'Estadísticas',
      users: 'Usuarios',
      payments: 'Pagos',
      announcements: 'Anuncios',
      tournaments: 'Torneos',
      economy: 'Economía',
      shop: 'Tienda',
      gemPackages: 'Paquetes de Gemas',
      games: 'Juegos',
      gameRules: 'Reglas del Juego',
      bulkRewards: 'Recompensas Masivas',
      blockedIps: 'IPs Bloqueados',
      geoBlock: 'Bloqueo Geográfico',
      comingSoon: 'Próximamente',
    },
    statistics: adminStatisticsEs,
    dashboard: {
      title: 'Centro de Comando',
      subtitle:
        'Salud del sistema, métricas clave y resumen de módulos de administración',
      systemHealth: 'Salud del Sistema',
      statusOnline: 'Operativo',
      statusDegraded: 'Degradado',
      database: 'Base de datos',
      collections: 'Colecciones',
      totalDocuments: 'Total de documentos',
      dataSize: 'Tamaño de datos (MB)',
      storageSize: 'Tamaño de almacenamiento (MB)',
      indexSize: 'Tamaño de índices (MB)',
      activeModules: 'Módulos Activos',
      modulesTitle: 'Módulos de Administración',
      modulesSubtitle:
        'Acceso directo para administrar juegos, jugadores, transacciones y seguridad',
      modules: {
        statistics: {
          title: 'Analítica de Plataforma',
          description:
            'Inspecciona MAU, DAU, retención, tiempo de juego e ingresos',
        },
        users: {
          title: 'Gestión de Usuarios',
          description:
            'Administrar cuentas de jugadores, roles, estados y sanciones',
        },
        payments: {
          title: 'Pagos y Notas',
          description:
            'Auditar registros de pagos, transacciones y notas internas',
        },
        tournaments: {
          title: 'Torneos',
          description: 'Programar y gestionar torneos competitivos y premios',
        },
        gemPackages: {
          title: 'Paquetes de Gemas',
          description: 'Configurar niveles de gemas, precios y bonificaciones',
        },
        shop: {
          title: 'Tienda y Cosméticos',
          description:
            'Gestionar inventario, rarezas de cosméticos y otorgamiento',
        },
        economy: {
          title: 'Economía y Tesorería',
          description:
            'Monitorear circulación de tokens, faucet y quema de recompensas',
        },
        bulkRewards: {
          title: 'Recompensas Masivas',
          description: 'Distribuir recompensas masivas a cohortes de jugadores',
        },
        games: {
          title: 'Visibilidad de Juegos',
          description: 'Controlar disponibilidad y estado de modos de juego',
        },
        gameRules: {
          title: 'Reglas del Juego',
          description:
            'Configurar variantes de reglas, temporizadores y mecánicas',
        },
        announcements: {
          title: 'Anuncios',
          description:
            'Emitir avisos globales, actualizaciones y alertas de mantenimiento',
        },
        blockedIps: {
          title: 'IPs Bloqueados',
          description: 'Inspeccionar y bloquear direcciones IP maliciosas',
        },
        geoBlock: {
          title: 'Bloqueo Geográfico',
          description:
            'Configurar restricciones jurisdiccionales y territoriales',
        },
      },
      openPanel: 'Abrir Panel',
      collectionsOverview: 'Desglose de Colecciones de Base de Datos',
      collectionName: 'Colección',
      docsCount: 'Documentos',
      sizeMb: 'Tamaño (MB)',
      avgDocSize: 'Tamaño Medio',
      indexesCount: 'Índices',
      liveStatus: 'Estado Actual',
      environment: 'Entorno',
    },
    error: {
      title: 'Algo salió mal',
      body: 'Se produjo un error al cargar esta página.',
      retry: 'Reintentar',
    },
    users: adminUsersEs,
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
    announcements: adminAnnouncementsEs,
    tournaments: adminTournamentsEs,
    wallet: adminWalletEs,
    blockedIps: adminBlockedIpsEs,
    bulkRewards: adminBulkRewardsEs,
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
    list: {
      loading: 'Cargando torneos…',
      empty: 'Aún no hay torneos. ¡Vuelve pronto!',
      card: {
        registered: 'Inscritos {count} / {max}',
        prize: 'Premio',
        entryFee: 'Cuota de entrada',
        prizePool: 'Premio en juego',
        registerCta: 'Inscribirse',
        unregisterCta: 'Cancelar inscripción',
        signInToRegister: 'Inicia sesión para inscribirte',
        full: 'Lista de espera',
        registrationClosed: 'Inscripción cerrada',
        viewBracket: 'Ver cuadro',
        confirmRegister: {
          title: 'Confirmar entrada',
          body: 'Este torneo cuesta {fee} monedas. Tu saldo: {balance} monedas.',
          confirm: 'Pagar e inscribirse',
          cancel: 'Cancelar',
        },
        confirmUnregister: {
          refund: 'Se te devolverán {amount} monedas.',
          title: 'Cancelar inscripción',
          body: '¿Estás seguro?',
          confirm: 'Sí, cancelar',
          cancelButton: 'No, mantenerme',
        },
        errors: {
          insufficientFunds: 'No tienes suficientes monedas para participar.',
        },
        effectiveStatus: {
          scheduled: 'Programado',
          registration_open: 'Inscripción abierta',
          registration_closed: 'Inscripción cerrada',
          live: 'En curso',
          awaiting_results: 'Esperando resultados',
          completed: 'Finalizado',
          cancelled: 'Cancelado',
        },
        gameType: {
          critical_v1: 'Critical',
          sea_battle_v1: 'Batalla naval',
        },
      },
    },
    bracket: {
      title: 'Cuadro',
      loading: 'Cargando cuadro…',
      empty: 'El cuadro aún no se ha generado.',
      tbd: 'TBD',
      winner: 'Ganador',
      backToList: 'Volver a torneos',
      errors: {
        locked: 'El cuadro está bloqueado: ya hay resultados registrados.',
        notEnoughPlayers:
          'No hay suficientes jugadores para generar el cuadro.',
      },
    },
  },
  blog: blogEs,
  community: communityEs,
  cookies: {
    title: 'Política de Cookies',
    lastUpdated: 'Última actualización: 16 de agosto de 2026',
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
  developers: developersEs,
  help: helpEs,
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
      critical_v1: {
        name: 'Critical',
        subtitle: 'Cartas de alto riesgo',
        icon: '♠',
      },
      sea_battle_v1: {
        name: 'Batalla naval',
        subtitle: 'Estrategia naval',
        icon: '⚓',
      },
      texas_holdem_v1: {
        name: "Texas Hold'em Poker",
        subtitle: 'Mesas de póker',
        icon: '♣',
      },
      glimworm_v1: {
        name: 'Glimworm',
        subtitle: 'Arena serpiente',
        icon: '🐍',
      },
      tic_tac_toe_v1: {
        name: 'Tres en raya',
        subtitle: 'Tres en raya clásico',
        icon: '✕',
      },
      cascade_v1: {
        name: 'Cascade',
        subtitle: 'Cascada de cartas',
        icon: '▥',
      },
      chess_v1: { name: 'Ajedrez', subtitle: 'Estrategia clásica', icon: '♞' },
      checkers_v1: { name: 'Damas', subtitle: 'Clásico de tablero', icon: '●' },
      cat_dash_v1: {
        name: 'Cat Dash',
        subtitle: 'Carrera de gatos',
        icon: '🐱',
      },
      backgammon_v1: {
        name: 'Backgammon',
        subtitle: 'Estrategia de tablero',
        icon: '🎲',
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
    comingSoon:
      '¡Las tablas de clasificación globales estarán disponibles pronto!',
  },
  rewards: rewardsEs,
  wallet: walletEs,
  gems: gemsEs,
  adminGemPackages: adminGemPackagesEs,
  adminEconomy: adminEconomyEs,
  dailyRewards: dailyRewardsEs,
  dailyChallenges: dailyChallengesEs,
  achievements: achievementsEs,
  shop: shopEs,
  adminShop: adminShopEs,
  adminGames: adminGamesEs,
  friends: friendsEs,
  clans: clansEs,
  events: eventsEs,
  seasons: seasonsEs,
  changelog: changelogEs,
  roadmap: roadmapEs,
};
