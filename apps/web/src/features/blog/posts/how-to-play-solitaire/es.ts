import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-solitaire',
  locale: 'es',
  title:
    'Cómo jugar al Solitario (Klondike) online — reglas, estrategia, consejos',
  excerpt:
    'Guía completa al Solitario Klondike: distribución, movimientos permitidos, estrategia de fundaciones y los hábitos que aumentan tu tasa de victoria.',
  publishedAt: '2026-07-28',
  author: 'Equipo Arcadeum',
  tags: ['Solitario', 'Klondike', 'Juego de cartas', 'Cómo jugar', 'Puzzle'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'El Solitario Klondike es el juego de paciencia más jugado del mundo: un desafío de cartas para un jugador donde ordenas 52 cartas en cuatro pilas de fundación por palo, ascendente del As al Rey. Las reglas son fáciles, pero la estrategia separa al casual del que gana consistentemente.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Distribución',
      id: 'layout',
    },
    {
      type: 'paragraph',
      text: 'El juego comienza con 28 cartas repartidas en siete columnas: columna 1 recibe 1 carta, columna 2 recibe 2, hasta la columna 7 con 7 cartas. Solo la carta superior de cada columna está boca arriba. Las 24 cartas restantes forman el mazo. Cuatro pilas vacías de fundación van arriba.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Movimientos permitidos',
      id: 'moves',
    },
    {
      type: 'paragraph',
      text: 'Tableau: puedes mover una carta boca arriba (o secuencia) a otra carta boca arriba un rango mayor y color opuesto. Solo un Rey puede ocupar una columna vacía.',
    },
    {
      type: 'paragraph',
      text: 'Fundación: una carta se mueve si es la siguiente por palo y rango (As primero, luego 2, 3... hasta Rey).',
    },
    {
      type: 'paragraph',
      text: 'Mazo: cuando no hay movimientos, gira cartas del mazo. En draw-1 (más fácil) una carta a la vez; en draw-3 (más difícil) tres cartas, solo la superior jugable.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Verdad sobre victorias',
      id: 'winning',
    },
    {
      type: 'paragraph',
      text: 'Un porcentaje significativo de repartos son irresolubles — entre 20% y 40% son ganadores según el modo. El juego hábil aumenta tu tasa, pero reconocer repartos muertos rápidamente también es parte del juego eficiente.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Estrategia — hábitos que ganan',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Prefiere siempre el movimiento que revela una carta boca abajo.',
        'Trabaja la columna más profunda primero.',
        'No apresures cartas a fundaciones. Guarda cartas medias como buffer.',
        'Elige el Rey correcto según el color que mejor equilibre tus cartas ocultas.',
        'En draw-3 recuerda el ciclo del mazo.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Errores comunes',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Hacer todos los movimientos disponibles reflexivamente.',
        'Enterrar rangos necesarios bajo Reyes.',
        'Ignorar cartas boca abajo.',
        'Rendirse demasiado pronto.',
      ],
    },
    {
      type: 'cta',
      href: '/games/solitaire',
      text: 'Juega al Solitario online — gratis, en tu navegador',
      description:
        'Klondike clásico con modos draw-1 y draw-3. Rastrea tu tasa de victoria.',
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
        'Prefiere siempre el movimiento que revela una carta boca abajo.',
        'Trabaja la columna más profunda primero.',
        'No envíes cartas medias a fundaciones — guárdalas como buffer.',
        'Elige el Rey que equilibre tus cartas ocultas.',
      ],
    },
    {
      type: 'paragraph',
      text: 'El Solitario recompensa la paciencia y la disciplina. Los mejores jugadores saben cuándo actuar y cuándo esperar.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Revelar cartas boca abajo',
        text: 'Cada movimiento debe priorizar revelar una carta oculta.',
        url: '#strategy',
      },
      {
        name: 'Trabajar la columna más profunda',
        text: 'Identifica la columna con más cartas ocultas y enfócate en ella.',
        url: '#strategy',
      },
      {
        name: 'Guarda cartas medias',
        text: 'No envíes 5s, 6s o 7s a fundaciones — pueden servir para secuencias.',
        url: '#strategy',
      },
      {
        name: 'Elige el Rey correcto',
        text: 'Selecciona el Rey cuyo color mejor equilibre las cartas ocultas.',
        url: '#strategy',
      },
    ],
  },
};
