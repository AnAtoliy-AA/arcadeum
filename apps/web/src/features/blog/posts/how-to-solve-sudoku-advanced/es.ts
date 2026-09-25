import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-solve-sudoku-advanced',
  locale: 'es',
  title:
    'Técnicas Avanzadas de Sudoku — X-Wings, Swordfish, XY-Wings y Cadenas Forzadas',
  excerpt:
    '¿Ya superaste los pares desnudos y los singles ocultos? Esta guía cubre las técnicas intermedias y avanzadas que resuelven los puzzles de Sudoku más difíciles.',
  publishedAt: '2026-09-12',
  author: 'Equipo Arcadeum',
  tags: ['Sudoku', 'Estrategia', 'Puzzles', 'Avanzado', 'Lógica'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'Si puedes resolver puzzles de Sudoku fáciles y medianos pero te atascas en los difíciles y expertos, probablemente ya dominaste singles desnudos, singles ocultos, pares desnudos y candidatos bloqueados. El siguiente nivel de técnicas elimina candidatos basándose en patrones geométricos a través de múltiples filas, columnas y cajas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'X-Wing — el primer patrón rectangular',
      id: 'x-wing',
    },
    {
      type: 'paragraph',
      text: 'Un X-Wing ocurre cuando un candidato aparece en exactamente dos celdas en cada una de dos filas diferentes, y esas celdas están en las mismas dos columnas. Como el candidato debe aparecer en una de las dos celdas en cada fila, debe ocupar dos de las cuatro esquinas de este rectángulo. Consecuencia: el candidato puede eliminarse de todas las demás celdas en esas dos columnas. Ejemplo: el dígito 7 aparece solo en las celdas (f2,c3) y (f2,c8) en la fila 2, y solo en (f7,c3) y (f7,c8) en la fila 7. Elimina todos los 7 de las columnas 3 y 8 que no estén en las filas 2 y 7.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Swordfish — el triple rectángulo',
      id: 'swordfish',
    },
    {
      type: 'paragraph',
      text: 'Swordfish extiende X-Wing a tres filas y tres columnas. Un candidato forma un Swordfish cuando aparece en exactamente 2 o 3 celdas en cada una de tres filas, y esas celdas abarcan colectivamente exactamente tres columnas. Elimina el candidato de todas las demás celdas de esas tres columnas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'XY-Wing — una cadena de tres celdas',
      id: 'xy-wing',
    },
    {
      type: 'paragraph',
      text: 'Un XY-Wing es una cadena de tres celdas, cada una con exactamente dos candidatos. La celda pivote tiene candidatos XY. Dos celdas "pinza" comparten un candidato con el pivote: una tiene XZ, la otra YZ. Como el pivote es X o Y, una de las pinzas debe ser Z — así que Z puede eliminarse de cualquier celda que vea ambas pinzas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Orden de prioridad de técnicas',
      id: 'priority',
    },
    {
      type: 'list',
      items: [
        '1. Singles Desnudos/Ocultos (siempre comprueba primero)',
        '2. Candidatos Bloqueados',
        '3. Pares, Triples y Cuartetos Desnudos/Ocultos',
        '4. X-Wing y Swordfish',
        '5. XY-Wing',
        '6. Rectángulo Único',
        '7. Cadenas forzadas',
      ],
    },
    {
      type: 'cta',
      href: '/games/sudoku',
      text: 'Aplica estas técnicas — juega Sudoku en Arcadeum',
      description: 'Múltiples niveles de dificultad desde fácil hasta experto.',
    },
  ],
  faq: [
    {
      question: '¿Se necesitan cadenas forzadas para resolver Sudoku difícil?',
      answer:
        'Generalmente no. La mayoría de los puzzles difíciles publicados pueden resolverse con X-Wing, Swordfish, XY-Wing y Rectángulo Único. Las cadenas forzadas se vuelven necesarias solo para los puzzles extremos.',
    },
    {
      question: '¿Es necesario adivinar alguna vez?',
      answer:
        'Un puzzle de Sudoku bien construido con solución única siempre puede resolverse solo con lógica. Si te sientes atascado, generalmente significa que hay un patrón que no has encontrado todavía.',
    },
  ],
};
