import type { rewardsEn } from './en';

export const rewardsEs: typeof rewardsEn = {
  title: 'Programa de Recompensas',
  subtitle:
    'Gana monedas, desbloquea niveles cosméticos y mantén tu racha diaria',
  description:
    'Juega partidas, completa misiones diarias y sube de nivel en las temporadas de recompensas para desbloquear títulos exclusivos, bordes y monedas.',
  dailyStreak: {
    title: 'Racha de Inicio Diario',
    subtitle: 'Entra cada día para reclamar monedas y cofres sorpresa',
    day: 'Día {day}',
    claimed: 'Reclamado',
    claim: 'Reclamar Recompensa',
    ready: 'Listo para Reclamar',
    streakBonus: 'Cofre Misterioso Día 7',
  },
  quests: {
    title: 'Misiones y Recompensas Activas',
    subtitle:
      'Supera desafíos en todos los modos de juego para ganar recompensas',
    dailyTab: 'Misiones Diarias',
    weeklyTab: 'Misiones Semanales',
    progress: '{current}/{total}',
    items: [
      {
        title: 'Primera Victoria',
        description: 'Gana 1 partida en cualquier modo multijugador',
        reward: '+100 Monedas',
        progress: '1/1',
        completed: true,
      },
      {
        title: 'Mente Táctica',
        description: 'Juega 3 partidas de Ajedrez o Damas',
        reward: '+250 Monedas',
        progress: '2/3',
        completed: false,
      },
      {
        title: 'Superviviente',
        description: 'Desactiva 2 bombas en Critical sin detonar',
        reward: '+300 Monedas + Emblema',
        progress: '1/2',
        completed: false,
      },
      {
        title: 'Campeón Social',
        description: 'Invita a un amigo a jugar en una sala privada',
        reward: '+500 Monedas',
        progress: '0/1',
        completed: false,
      },
    ],
  },
  tiers: {
    title: 'Niveles de Recompensa de Temporada',
    subtitle:
      'Sube el nivel de tu cuenta para activar multiplicadores y prestigio',
    levels: [
      {
        name: 'Bronce',
        badge: '🥉',
        requirement: '0 XP',
        perks: [
          'Emparejamiento estándar',
          'Ganancia base (1.0x)',
          'Etiqueta de chat estándar',
        ],
      },
      {
        name: 'Plata',
        badge: '🥈',
        requirement: '1.000 XP',
        perks: [
          '+5% Multiplicador de monedas',
          'Insignia de plata',
          '2 cambios diarios de misiones',
        ],
      },
      {
        name: 'Oro',
        badge: '🥇',
        requirement: '3.500 XP',
        perks: [
          '+15% Multiplicador de monedas',
          'Borde animado de oro',
          'Torneos exclusivos',
        ],
      },
      {
        name: 'Platino',
        badge: '💎',
        requirement: '7.500 XP',
        perks: [
          '+25% Multiplicador de monedas',
          'Brillo platino en avatar',
          'Cola de juego prioritaria',
        ],
      },
      {
        name: 'Mítico',
        badge: '👑',
        requirement: '15.000 XP',
        perks: [
          '+50% Multiplicador de monedas',
          'Aura mítica cosmética',
          'Temas de sala personalizados',
        ],
      },
    ],
  },
  referralHero: {
    title: 'Invita Amigos, Ganad Juntos',
    description:
      'Regala a tus amigos 200 monedas de bienvenida al registrarse con tu código y recibe 500 monedas + 10% de sus recompensas de misiones.',
    cta: 'Obtener Enlace',
  },
  faq: {
    title: 'Preguntas sobre Recompensas',
    items: [
      {
        question: '¿Cuándo se reinician las rachas diarias?',
        answer:
          'Las rachas se reinician a las 00:00 UTC. Tienes 24 horas cada día para reclamar tu recompensa.',
      },
      {
        question: '¿Cómo consigo XP para subir de nivel?',
        answer:
          'Ganas XP jugando partidas (100 XP por victoria, 40 XP por participación), completando misiones y ganando torneos.',
      },
      {
        question: '¿Caducan las ventajas de nivel?',
        answer:
          'Las insignias y multiplicadores permanecen activos durante toda la temporada de 3 meses.',
      },
    ],
  },
  cta: {
    title: '¿Listo para reclamar tus premios?',
    description:
      'Entra a una sala de juego ahora y empieza a acumular monedas y recompensas.',
    button: 'Jugar Gratis Ahora',
  },
  socialRewards: {
    title: 'Recompensas de redes sociales',
    subtitle:
      'Suscríbete y sigue nuestros canales oficiales para conseguir gemas gratis.',
    badge: 'RECOMPENSA EN GEMAS',
    claim: 'Reclamar +{n} 💎',
    claimed: 'Reclamado ✓',
    followAndClaim: 'Suscribirse y reclamar +{n} 💎',
    toastSuccess: '¡+{n} gema reclamada con éxito!',
    errorAlreadyClaimed: '¡Ya reclamado!',
    errorUnauthorized: 'Inicia sesión para reclamar recompensas.',
    errorGeneric: 'Error al reclamar la recompensa. Inténtalo de nuevo.',
  },
};
