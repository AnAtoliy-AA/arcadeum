import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-checkers',
  locale: 'es',
  title:
    'Cómo Ganar en Damas — Tácticas, Finales de Reinas y Patrones de Oposición',
  excerpt:
    'Las damas son más profundas de lo que parecen. Aprende las combinaciones de captura forzada, la oposición de reinas, los patrones de "disparo" y la técnica de final.',
  publishedAt: '2026-09-13',
  author: 'Equipo Arcadeum',
  tags: ['Damas', 'Estrategia', 'Táctica', 'Juego de Mesa'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: 'Las damas están resueltas a nivel superior — el juego perfecto de ambos lados siempre resulta en empate. Pero en el juego práctico entre humanos, el juego es extraordinariamente rico. Las reglas de captura forzada crean oportunidades combinatorias que no existen en el ajedrez.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tácticas de captura forzada — el "disparo"',
      id: 'shots',
    },
    {
      type: 'paragraph',
      text: 'La regla de captura obligatoria es la fuente de las tácticas más profundas en las damas. Un "disparo" es una secuencia de movimientos que obliga al oponente a capturar en una dirección que le cuesta más piezas de las que gana. El intercambio 2-por-1: sacrifica una pieza para capturar dos del oponente.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Finales de reinas — oposición y el triángulo',
      id: 'king-endgames',
    },
    {
      type: 'list',
      items: [
        'Tres reinas contra dos: la técnica ganadora es la triangulación — mueve tus reinas en un patrón triangular para evitar dar al oponente la oposición.',
        'Dos reinas contra una en el doble rincón: esto es un empate con el mejor juego del defensor. La reina solitaria en el doble rincón (a1, c1 o h8, f8) no puede ser expulsada.',
        'Dos reinas contra una en campo abierto: ganando con técnica. Las reinas acorralan a la solitaria hacia el borde, luego la fuerzan a exponerse.',
        'Nunca mantengas una reina en la esquina pasivamente. Una reina en el centro controla más diagonales.',
      ],
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: 'Practica tácticas de damas — juega en Arcadeum',
      description:
        'Damas estándar 8×8 con reglas completas de captura obligatoria.',
    },
  ],
  faq: [
    {
      question: '¿Las damas son un juego resuelto?',
      answer:
        'Sí — el juego perfecto de ambos lados siempre resulta en empate. Pero en la práctica, entre humanos, el juego está lleno de errores que crean oportunidades reales de ganar.',
    },
    {
      question: '¿Cuántas reinas se necesitan para ganar?',
      answer:
        'Tres reinas contra dos es una victoria forzada con técnica correcta. Dos contra una en posición abierta también es victoria. Dos contra una en el doble rincón es empate con la mejor defensa.',
    },
  ],
};
