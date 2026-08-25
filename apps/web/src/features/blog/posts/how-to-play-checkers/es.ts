import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-checkers',
  locale: 'es',
  title: 'Cómo jugar a las Damas online — reglas, damas, estrategia',
  excerpt:
    'Guía completa para principiantes: reglas oficiales, capturas forzadas, saltos múltiples, damas y los hábitos que separan a un jugador casual del que gana.',
  publishedAt: '2026-06-09',
  author: 'Equipo Arcadeum',
  tags: ['Damas', 'Draughts', 'Cómo jugar', 'Estrategia', 'Juego de mesa'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Las Damas — conocidas internacionalmente como Draughts — son uno de los juegos de mesa estratégicos más antiguos. Dos rivales colocan doce fichas cada uno en un tablero de 8×8 y se turnan moviendo en diagonal hacia adelante. Las capturas son forzadas, los saltos múltiples son obligatorios, y el primero en eliminar todas las piezas enemigas gana. Las reglas se explican en un minuto, pero la profundidad estratégica sorprende a los principiantes. Esta guía cubre las reglas oficiales, las damas y los hábitos que ganan partidas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'El tablero y la disposición inicial',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Las Damas se juegan en las casillas oscuras de un tablero de ajedrez estándar de 8×8. Cada jugador coloca doce fichas en las tres filas más cercanas a su lado, ocupando todas las casillas oscuras. Las casillas oscuras mueven primero. Las columnas se etiquetan a–h y las filas 1–8. Las fichas se mueven siempre en diagonal por casillas oscuras — las casillas claras no se usan.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Movimiento básico',
      id: 'movement',
    },
    {
      type: 'paragraph',
      text: 'Las piezas normales (fichas) se mueven en diagonal hacia adelante una casilla a una casilla adiacente vacía. Las fichas solo avanzan en dirección al rival — no hay movimientos laterales ni hacia atrás para las piezas normales. En cada turno, un jugador mueve exactamente una pieza. Si hay una captura disponible, debe tomarse — saltar una captura no está permitido en reglas estándar.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Capturas forzadas y saltos múltiples',
      id: 'captures',
    },
    {
      type: 'paragraph',
      text: 'Una captura ocurre cuando tu pieza está en diagonal adyacente a una pieza del rival y la casilla más allá (en la misma dirección) está vacía. Tu pieza salta sobre la pieza rival, eliminándola del tablero. Si después de aterrizar hay otra captura disponible, el salto debe continuar — esto es un salto múltiple. El turno solo termina cuando no hay más capturas disponibles.',
    },
    {
      type: 'paragraph',
      text: 'La regla de captura forzada es la fuente más común de errores de principiantes. Dejar una pieza donde puede ser saltada en múltiple entregue ventaja de material a tu rival. Siempre verifica si tu movimiento crea una posición donde el rival tiene un salto múltiple forzado.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Damas — promoción y poder',
      id: 'kings',
    },
    {
      type: 'paragraph',
      text: 'Cuando una pieza llega a la fila lejana (la fila trasera del rival), se corona dama. Una dama puede moverse y capturar tanto hacia adelante como hacia atrás en diagonal — una enorme ventaja. En reglas americanas estándar, una dama no puede saltar sobre otra dama (esto varía según el conjunto de reglas). Verifica qué reglas se aplican antes de jugar.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Ganar, perder y empates',
      id: 'winning',
    },
    {
      type: 'paragraph',
      text: 'Ganas capturando todas las piezas del rival o bloqueando todos sus movimientos legales. Si un jugador tiene piezas pero no movimientos legales, pierde. Si ninguna parte puede forzar victoria, el juego es empate. Las plataformas online generalmente aplican reglas de empate como límite de movimientos sin capturas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Estrategia central — cinco hábitos que ganan',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Controla el centro. Las piezas en casillas centrales tienen más movilidad y cubren más del tablero.',
        'Mantén la fila trasera. Tus piezas de la última fila son la única defensa contra las damas rivales.',
        'Intercambia cuando tengas ventaja. Si tienes más fichas, simplifica con intercambios. Si tienes menos, evita intercambios.',
        'Crea ataques dobles. Coloca una pieza donde el rival se vea obligado a capturarla en una posición donde puedas recapturar dos de sus piezas.',
        'Vigila los saltos múltiples forzados. Antes de cada movimiento, verifica si el rival tiene un salto múltiple disponible.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Principios de final',
      id: 'endgame',
    },
    {
      type: 'paragraph',
      text: 'El final en Damas se domina con la actividad de las damas. Las damas controlan más del tablero y pueden perseguir las piezas restantes. Cuando tienes ventaja en damas, úsala para restringir al rival a un borde o esquina. El concepto de oposición aparece en el final de Damas igual que en ajedrez. Las piezas de borde son más débiles porque tienen menos casillas de escape.',
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
        'Mover piezas de borde primero. Las piezas de borde tienen menos movilidad, son fáciles de atacar.',
        'Olvidar las capturas forzadas. Olvidar que una captura es obligatoria lleva a movimientos ilegales.',
        'Romper la fila trasera demasiado pronto. Abandonar el puente defensivo abre líneas para damas enemigas.',
        'Correr ciegamente hacia damas. La carrera solo es buena si calculas quién gana la posición resultante.',
      ],
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: 'Juega a las Damas online — gratis, en tu navegador',
      description:
        'Abre una sala de Damas, comparte el enlace con amigos o llena con bots IA. Disponibles múltiples conjuntos de reglas.',
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
        'Controla el centro del tablero al inicio.',
        'Mantén la fila trasera para bloquear las damas rivales.',
        'Intercambia con ventaja material; evita intercambios con desventaja.',
        'Siempre verifica los saltos múltiples forzados antes de cada movimiento.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Las Damas recompensan la paciencia, la conciencia posicional y la disciplina de evitar riesgos innecesarios. Las reglas son lo suficientemente antiguas como para que no haya estrategias ocultas — pero los hábitos anteriores son lo suficientemente robustos para que un jugador que los aplique todos supere consistentemente a uno que no aplique ninguno.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Controla el centro al inicio',
        text: 'Ocupa casillas oscuras centrales. Las piezas centrales tienen más movilidad y controlan más del tablero.',
        url: '#strategy',
      },
      {
        name: 'Mantén la fila trasera',
        text: 'Deja las piezas de la última fila en su lugar hasta que el rival tenga menos piezas. La última fila bloquea las damas enemigas.',
        url: '#strategy',
      },
      {
        name: 'Intercambia con ventaja',
        text: 'Si tienes más piezas, simplifica la posición con intercambios. Cada intercambio te acerca a un final ganador con dama.',
        url: '#strategy',
      },
      {
        name: 'Verifica saltos múltiples',
        text: 'Antes de cada movimiento, comprueba si el rival tiene una captura forzada. Dejar fichas en casillas de salto múltiple pierde material.',
        url: '#captures',
      },
    ],
  },
};
