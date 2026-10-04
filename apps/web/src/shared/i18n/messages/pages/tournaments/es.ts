import type { TournamentsI18n } from './en';

export const tournamentsEs: TournamentsI18n = {
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
      notEnoughPlayers: 'No hay suficientes jugadores para generar el cuadro.',
    },
  },
  blitzBanner: {
    ariaLabel: 'Copa Semanal Blitz de Batalla Naval',
    kicker: 'Campeonato Naval Semanal',
    statusLive: 'Copa en Vivo en Progreso',
    statusOpen: 'Inscripción Abierta',
    statusClosed: 'Inscripción Cerrada',
    statusUpcoming: 'Próxima Copa',
    statusRegistered: 'Inscrito',
    formatDetails: '{count} Capitanes • Eliminación Directa',
    captainsReady: 'Capitanes Listos',
    startsIn: 'Empieza En',
    battleStatus: 'Estado de Batalla',
    playingNow: 'JUGANDO AHORA',
    signInNotice: 'Inicia sesión para entrar en la Copa Blitz',
    leaveCup: 'Salir de la Copa Blitz',
    registerCup: 'Inscribirse en la Copa Blitz',
    tournamentFull: 'Torneo Completo',
    viewBracket: 'Ver Cuadro',
    allTournaments: 'Todos los Torneos',
    openModal: 'Inspeccionar Cuadro y Capitanes',
    modalTitle: 'Copa Blitz de Batalla Naval',
    tabBracket: 'Cuadro del Torneo',
    tabRoster: 'Lista de Capitanes',
    tabIntel: 'Reglas e Información',
    bracketPendingTitle: 'Sorteo del Cuadro Próximamente',
    bracketPendingDesc:
      'El cuadro del torneo se generará automáticamente en cuanto cierre la inscripción. El combate comenzará a la hora programada.',
    rosterTitle: 'Comandantes Registrados',
    rosterSubtitle: '{count} de {max} posiciones ocupadas',
    rosterWaitlist: 'Lista de espera',
    rosterYou: 'Tu Puesto de Mando',
    rosterEmpty:
      'Aún no hay capitanes inscritos. Sé el primero en desplegarte!',
    captainSeed: 'Puesto #{seed}',
    intelFormat: 'Formato del Torneo',
    intelFormatDesc:
      'Combate naval por eliminación directa. Vence a tu rival para avanzar hacia la gran final.',
    intelFleet: 'Despliegue de Flota',
    intelFleetDesc:
      'Tablero clásico de 10x10 con 5 barcos (Portaaviones, Acorazado, Crucero, Submarino, Destructor).',
    intelClock: 'Reloj de Turno',
    intelClockDesc:
      'Reloj rápido de 30 segundos por turno con disparo en ráfaga automático.',
    intelRewards: 'Recompensas del Campeonato',
    intelRewardsDesc:
      'El ganador del torneo recibe 500 monedas, el Trofeo de Almirante y un lugar destacado en la clasificación.',
    fullPageView: 'Abrir Página del Torneo',
    closeModal: 'Cerrar',
  },
};
