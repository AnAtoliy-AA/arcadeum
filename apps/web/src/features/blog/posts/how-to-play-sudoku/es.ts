import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sudoku',
  locale: 'es',
  title:
    'Cómo jugar al Sudoku online — reglas, técnicas, estrategia de resolución',
  excerpt:
    'Guía completa para principiantes: reglas, escaneo, marcas de lápiz y los pasos lógicos que resuelven cualquier rompecabezas sin adivinar.',
  publishedAt: '2026-06-12',
  author: 'Equipo Arcadeum',
  tags: ['Sudoku', 'Puzzle', 'Cómo jugar', 'Lógica', 'Estrategia'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'El Sudoku es el rompecabezas numérico más popular del mundo. Una cuadrícula 9x9 se divide en nueve cajas 3x3, y algunas celdas están pre-rellenadas con dígitos del 1 al 9. Tu tarea: llenar cada celda vacía para que cada fila, columna y caja contenga todos los dígitos 1-9 exactamente una vez. Sin aritmética — puro reconocimiento de patrones.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Las reglas',
      id: 'rules',
    },
    {
      type: 'paragraph',
      text: 'Cada fila contiene 1-9 exactamente una vez. Cada columna contiene 1-9 exactamente una vez. Cada caja 3x3 contiene 1-9 exactamente una vez. Ninguna celda puede contener más de un dígito.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Escaneo — la base',
      id: 'scanning',
    },
    {
      type: 'paragraph',
      text: 'Cross-hatching es la técnica más básica. Para un dígito dado, mira qué filas, columnas y cajas ya lo contienen. La intersección de esas restricciones a menudo deja solo una celda posible en una caja.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Marcas de lápiz',
      id: 'pencil-marks',
    },
    {
      type: 'paragraph',
      text: 'Cuando el escaneo no funciona directamente, escribe candidatos pequeños en cada celda vacía. Una celda con un solo candidato debe contener ese dígito (solo desnudo). Un dígito que aparece en una sola celda de un grupo debe ir ahí (solo oculto).',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Técnicas intermedias',
      id: 'intermediate',
    },
    {
      type: 'list',
      items: [
        'Parejas desnudas. Dos celdas con los mismos dos candidatos — esos dígitos quedan bloqueados.',
        'Ternas desnudas. Tres celdas con los mismos tres candidatos.',
        'Parejas ocultas. Dos dígitos que solo aparecen en dos celdas de un grupo.',
        'Parejas señaladoras. Dos celdas en una caja con un candidato compartido en la misma fila o columna.',
      ],
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
        'Nunca adivines. El Sudoku es determinístico — cada puzzle tiene un camino lógico.',
        'Trabaja sistemáticamente. Escanea cada dígito 1-9 por cada caja.',
        'Actualiza marcas después de cada colocación.',
        'Busca celdas con menos candidatos — son las más fáciles.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Juega al Sudoku online — gratis, en tu navegador',
      description:
        'Múltiples niveles de dificultad. Rastrea tu tiempo de resolución.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Resumen — cuatro hábitos que resuelven',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Empieza con cross-hatching: coloca dígitos restringidos a una celda por caja.',
        'Usa marcas de lápiz y busca solos desnudos/ocultos.',
        'Nunca adivines — re-escanea o busca parejas.',
        'Trabaja dígito por dígito y actualiza marcas.',
      ],
    },
    {
      type: 'paragraph',
      text: 'El Sudoku recompensa la disciplina lógica. Todos los puzzles se resuelven sin adivinar.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Cross-hatching',
        text: 'Para cada dígito 1-9, verifica filas y columnas. La intersección deja una celda por caja.',
        url: '#scanning',
      },
      {
        name: 'Añade marcas',
        text: 'Escribe candidatos en cada celda vacía. De ellos surgen los solos.',
        url: '#pencil-marks',
      },
      {
        name: 'Busca solos',
        text: 'Una celda con un candidato es ella. Un dígito en una celda del grupo también.',
        url: '#pencil-marks',
      },
      {
        name: 'Nunca adivines',
        text: 'Cada Sudoku tiene un camino lógico. Si te atascas, re-escanea.',
        url: '#strategy',
      },
    ],
  },
};
