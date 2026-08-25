import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-minesweeper',
  locale: 'es',
  title:
    'Cómo jugar al Buscaminas online — reglas, lógica, estrategia de victoria',
  excerpt:
    'Guía completa al Buscaminas: reglas de la cuadrícula, marcado, patrones de números, probabilidad y los hábitos que ayudan a limpiar cada mina sin adivinar.',
  publishedAt: '2026-06-05',
  author: 'Equipo Arcadeum',
  tags: ['Buscaminas', 'Minesweeper', 'Puzzle', 'Lógica', 'Estrategia'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'El Buscaminas es el clásico rompecabezas lógico: una cuadrícula de casillas ocultas contiene minas colocadas al azar. Tu trabajo es marcar con banderas cada mina y revelar cada casilla segura usando deducción pura. Cada número revelado indica exactamente cuántas minas tocan esa casilla.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'La cuadrícula',
      id: 'grid',
    },
    {
      type: 'paragraph',
      text: 'Una cuadrícula estándar (Principiante 9x9 con 10 minas, Intermedio 16x16 con 40, Experto 30x16 con 99) comienza oculta. Hacer clic revela una casilla. Si es mina, pierdes. Si es segura, aparece un número.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Revelar vs. marcar',
      id: 'actions',
    },
    {
      type: 'paragraph',
      text: 'Clic izquierdo revela. Clic derecho (o pulsación larga) coloca una bandera. Algunas versiones permiten chord-click: ambos botones en un número con banderas correctas revela vecinas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cómo leer números',
      id: 'reading',
    },
    {
      type: 'paragraph',
      text: 'Un "1" significa exactamente una mina entre las ocho casillas adyacentes. Un "2" significa dos. La primera jugada suele ser segura.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Patrones lógicos',
      id: 'patterns',
    },
    {
      type: 'list',
      items: [
        'Patrón 1-2-1. Tres casillas seguidas 1-2-1. Las minas están en las exteriores — la central es segura.',
        '1-1 en pared. Dos unos compartiendo casillas en el borde. La casilla fuera del área compartida es segura.',
        'Resta. Si un "3" tiene tres banderas, todas las demás adyacentes son seguras.',
        'Referencia cruzada. Dos números adyacentes compartiendo casillas ocultas reducen ubicaciones de minas.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cuando la lógica no alcanza',
      id: 'probability',
    },
    {
      type: 'paragraph',
      text: 'Cuando no hay deducción lógica, elige la casilla con menor probabilidad de mina. Cuenta minas restantes y casillas ocultas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Hábitos tácticos',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Empieza por los bordes — menos minas en promedio.',
        'Solo marca cuando tengas certeza.',
        'Usa chord-click para acelerar.',
        'Trabaja varios clústeres simultáneamente.',
      ],
    },
    {
      type: 'cta',
      href: '/games/minesweeper',
      text: 'Juega al Buscaminas online — gratis, en tu navegador',
      description:
        'Buscaminas clásico con varios tamaños y niveles de dificultad.',
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
        'Usa patrones (1-2-1, resta) para deducir sin adivinar.',
        'Empieza por los bordes donde hay más información.',
        'Solo marca minas confirmadas.',
        'Al adivinar, elige la casilla con menor probabilidad.',
      ],
    },
    {
      type: 'paragraph',
      text: 'El Buscaminas recompensa la lógica pura y el reconocimiento de patrones.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Aprende patrones',
        text: 'Domina 1-2-1 y la resta — resuelven la mayoría de posiciones iniciales.',
        url: '#patterns',
      },
      {
        name: 'Empieza por bordes',
        text: 'Haz clic cerca de los bordes — más información por clic.',
        url: '#strategy',
      },
      {
        name: 'Solo marca con certeza',
        text: 'Marca solo cuando la deducción confirma una mina.',
        url: '#actions',
      },
      {
        name: 'Referencia cruzada',
        text: 'Compara números adyacentes para reducir ubicaciones de minas.',
        url: '#patterns',
      },
    ],
  },
};
