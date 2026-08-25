import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-cat-dash',
  locale: 'es',
  title:
    'Cómo jugar a Cat Dash online — carreras de dados, habilidades de gatos',
  excerpt:
    'Guía completa: juego de carreras con gatos, dados, habilidades, obstáculos y boosts estratégicos.',
  publishedAt: '2026-08-25',
  author: 'Equipo Arcadeum',
  tags: ['Cat Dash', 'Juego de mesa', 'Carreras', 'Cómo jugar', 'Estrategia'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Cat Dash es un juego de carreras multijugador donde gatos adorables compiten en un tablero usando dados, habilidades únicas y boosts estratégicos. Esquiva obstáculos, recoge boosts de atún y usa la habilidad de tu gato para ganar.',
    },
    { type: 'heading', level: 2, text: 'Preparación', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Cada jugador elige un gato con habilidad única. Todos empiezan en la línea de salida. Lanza el dado para mover.',
    },
    { type: 'heading', level: 2, text: 'Casillas', id: 'spaces' },
    {
      type: 'list',
      items: [
        'Normal. Mueve el número del dado.',
        'Trampa de lana. Pierdes un turno.',
        'Derrame de leche. Retrocede 1-2.',
        'Boost de atún. Movimiento extra.',
        'Casilla de habilidad. Activa habilidad.',
      ],
    },
    { type: 'heading', level: 2, text: 'Habilidades', id: 'abilities' },
    {
      type: 'paragraph',
      text: 'Cada gato tiene habilidad única: Salto (adelante 3), Sueño (inmunidad), Curiosidad (mirar y repetir), Arañazo (retroceder rival).',
    },
    { type: 'heading', level: 2, text: 'Estrategia', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Guarda boosts para rectas.',
        'Guía rivales a obstáculos.',
        'Sprint final con todo.',
        'Rastrea posiciones de rivales.',
      ],
    },
    {
      type: 'cta',
      href: '/games/cat-dash',
      text: 'Juega a Cat Dash online — gratis',
      description: 'Carreras con amigos o IA.',
    },
    { type: 'heading', level: 2, text: 'Resumen', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Guarda boosts.',
        'Usa habilidades con timing.',
        'Bloquea carriles.',
        'Rastrea obstáculos.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Lanza dado',
        text: 'Muévete el número del dado.',
        url: '#setup',
      },
      {
        name: 'Observa casillas',
        text: 'Evita obstáculos, recoge boosts.',
        url: '#spaces',
      },
      {
        name: 'Usa habilidades',
        text: 'Timing importante.',
        url: '#abilities',
      },
      {
        name: 'Sprint final',
        text: 'Guarda boosts para el último tramo.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: '¿Cómo se mueve?',
      answer: 'Lanza el dado. Tu gato se mueve el número de casillas.',
    },
    {
      question: '¿Qué son los obstáculos?',
      answer: 'Trampa de lana = pierdes turno. Derrame = retrocedes.',
    },
  ],
};
