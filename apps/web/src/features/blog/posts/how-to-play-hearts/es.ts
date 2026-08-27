import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-hearts',
  locale: 'es',
  title:
    'Cómo jugar a Corazones online — reglas, Reina de Espadas, Disparo a la Luna',
  excerpt:
    'Guía completa para principiantes: reglas de evadir bazas, estrategia de paso, tácticas con la Reina de Espadas y cómo disparar a la Luna sin ser atrapado.',
  publishedAt: '2026-07-14',
  author: 'Equipo Arcadeum',
  tags: ['Hearts', 'Corazones', 'Cómo jugar', 'Estrategia', 'Juego de cartas'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Corazones es un juego clásico de evasión de bazas para cuatro jugadores. El objetivo es evitar ganar bazas que contengan corazones (1 punto cada uno) y la Reina de Espadas (13 puntos). El jugador con la puntuación más baja cuando alguien alcanza 100 gana. Pero bajo el objetivo simple hay un juego tenso de leer rivales, vaciar palos y decidir si disparar a la Luna.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Reparto y preparación',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Se reparten todas las 52 cartas, 13 a cada jugador. No hay palo dominante. El 2 de Trébol va al jugador que inicia la primera baza.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Paso de cartas',
      id: 'passing',
    },
    {
      type: 'paragraph',
      text: 'Antes de cada mano, cada jugador pasa tres cartas a otro. La dirección rota: izquierda, derecha, al frente, sin paso. Pasa tus cartas altas del palo que quieres vaciar, pero ten cuidado — la Reina de Espadas puede volver. Una táctica común es pasar cartas bajas de un palo donde tienes pocas cartas, creando un vacío para descartar corazones después.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cómo funcionan las bazas',
      id: 'tricks',
    },
    {
      type: 'paragraph',
      text: 'El jugador con el 2 de Trébol inicia. Se debe seguir el palo si es posible; si no, se juega cualquier carta. La carta más alta del palo led gana. Los corazones no se pueden liderar hasta que se hayan "roto" (jugado cuando un jugador no pudo seguir el palo).',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Puntuación',
      id: 'scoring',
    },
    {
      type: 'paragraph',
      text: 'Cada corazón ganado = 1 punto. La Reina de Espadas = 13 puntos. No se pueden ganar puntos en la primera baza. Cuando los corazones se rompen, el ganador de la baza recoge todos.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Disparar a la Luna',
      id: 'moon',
    },
    {
      type: 'paragraph',
      text: 'Si recopilas TODOS los 13 corazones Y la Reina de Espadas (26 puntos), disparas a la Luna — en lugar de ganar 26 puntos, cada rival recibe 26. Es alto riesgo. Si un solo corazón se escapa, recibes los 26. Requiere timing precio, palos vacíos fuertes y confianza.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Estrategia central',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Crear vacíos. Pasa cartas para vaciar un palo. Es la herramienta más poderosa.',
        'Cartas bajas. Guarda cartas bajas en cada palo. Cuando no puedas seguir, juega corazones bajos.',
        'Reina de Espadas. Rastrea siempre si ha salido. Si no, evita liderar espadas.',
        'Romper corazones temprano. Si tienes el As o Rey de corazones, juega pronto para romperlos.',
        'Leer rivales. Observa las cartas pasadas y los palos vacíos de los rivales.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Consejos tácticos',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Esquivar la primera baza. Si tienes el 2 de Trébol, lidera bajo — la primera baza no suma.',
        'Vigila a los disparadores. Si un jugador toma el As de Espadas y luego lidera altos, puede estar disparando.',
        'Matemáticas del final. Cuando queden pocas bazas, cuenta puntos.',
        'No retengas la Reina. Cuanto más la tengas, más probable es que alguien lidie espadas.',
      ],
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Juega a Corazones online — gratis, en tu navegador',
      description:
        'Abre una sala de Corazones, comparte el enlace con amigos o juega contra bots IA.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Resumen — cuatro hábitos que ganan',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Crea un vacío de palo temprano para descartar la Reina y corazones altos.',
        'Rastrea la Reina de Espadas y cada corazón jugado.',
        'Guarda cartas bajas y no lideres corazones hasta que estés listo para disparar.',
        'Bloquea a los disparadores ganando un solo corazón.',
      ],
    },
    {
      type: 'paragraph',
      text: 'En Corazones la información lo es todo. Cada carta jugada cuenta una historia, y el jugador que lee más historias gana más partidas.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Crea un vacío temprano',
        text: 'Pasa tres cartas de un palo que quieras eliminar. Un vacío te permite descartar corazones o la Reina.',
        url: '#passing',
      },
      {
        name: 'Rastrea la Reina de Espadas',
        text: 'Siempre nota si ha salido. Si no, evita liderar espadas.',
        url: '#scoring',
      },
      {
        name: 'Guarda cartas bajas',
        text: 'Ten cartas bajas en cada palo. Cuando no puedas seguir, juega bajos.',
        url: '#strategy',
      },
      {
        name: 'Bloquea disparadores',
        text: 'Si alguien recopila todo, gana un corazón para detenerlo.',
        url: '#moon',
      },
    ],
  },
};
