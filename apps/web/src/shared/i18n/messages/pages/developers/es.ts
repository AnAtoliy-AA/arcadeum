import type { developersEn } from './en';

export const developersEs: typeof developersEn = {
  title: 'Plataforma para Desarrolladores de Arcadeum',
  subtitle:
    'Crea bots personalizados, integra torneos y transmite partidas en tiempo real',
  description:
    'Nuestra plataforma ofrece protocolos WebSocket de baja latencia, APIs REST y SDKs oficiales en TypeScript y Python para crear bots, juegos y superposiciones de torneos.',
  stats: {
    latency: '< 50ms',
    latencyLabel: 'Latencia WebSocket',
    rateLimit: '100 pet/min',
    rateLimitLabel: 'Límite por IP',
    uptime: '99.99%',
    uptimeLabel: 'Disponibilidad',
    sdk: 'REST & WS',
    sdkLabel: 'Pasarelas de protocolos',
  },
  sdkHero: {
    title: 'Programa en tu Lenguaje Favorito',
    subtitle: 'Conéctate a salas de juego en menos de 10 líneas de código',
    tabs: {
      typescript: 'TypeScript',
      python: 'Python',
      curl: 'cURL / REST',
      websocket: 'WebSocket',
    },
    copyCode: 'Copiar Código',
    copied: '¡Copiado al Portapapeles!',
  },
  features: [
    {
      title: 'Gateway WebSocket en Tiempo Real',
      description:
        'Protocolo Socket.IO bidireccional con transiciones autorizadas de estado y confirmaciones de acciones.',
      icon: '⚡',
    },
    {
      title: 'Framework de Bots con IA',
      description:
        'Motor oficial en Python y Node.js con algoritmos minimax y retrasos de reacción humana simulados.',
      icon: '🤖',
    },
    {
      title: 'API de Torneos y Cuadros',
      description:
        'Crea torneos de eliminación directa o suizos, registra jugadores y recibe webhooks de resultados.',
      icon: '🏆',
    },
    {
      title: 'Emparejamiento y Salas Privadas',
      description:
        'Crea salas con reglas personalizadas, contraseñas e invitaciones mediante enlaces directos.',
      icon: '🎮',
    },
    {
      title: 'Webhooks y Flujo de Eventos',
      description:
        'Recibe llamadas HTTP POST firmadas con HMAC para inicio de partida, resultados y puntuaciones.',
      icon: '🔔',
    },
    {
      title: 'Entorno Sandbox Completo',
      description:
        'Prueba tus integraciones con jugadores de prueba en nuestra pasarela sandbox antes de pasar a producción.',
      icon: '🛡️',
    },
  ],
  specs: {
    title: 'Especificaciones y Endpoints de la Plataforma',
    subtitle: 'Arquitecturas REST y WebSocket compatibles con estándares',
    authTitle: 'Autenticación',
    authDesc:
      'Token Bearer JWT en la cabecera Authorization o en el handshake del socket.',
    restBase: 'https://api.arcadeum.net/v1',
    wsEndpoint: 'wss://socket.arcadeum.net',
    sandboxBase: 'https://sandbox.arcadeum.net/v1',
  },
  cta: {
    title: 'Empieza a Construir en Arcadeum',
    description:
      'Revisa los repositorios oficiales de GitHub, descarga la plantilla para bots o únete al Discord de desarrolladores.',
    githubBtn: 'Repositorios GitHub',
    discordBtn: 'Unirse a Discord',
  },
};
