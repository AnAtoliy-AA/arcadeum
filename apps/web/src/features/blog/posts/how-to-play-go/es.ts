import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-go',
  locale: 'es',
  title:
    'Cómo jugar a Go (Baduk, Weiqi) online — Reglas, vida y muerte, estrategia',
  excerpt:
    'Guía completa para principiantes sobre Go: tablero, libertades, capturas, regla de ko, territorio y conceptos estratégicos clave.',
  publishedAt: '2026-06-23',
  author: 'Equipo Arcadeum',
  tags: ['Go', 'Baduk', 'Weiqi', 'Cómo jugar', 'Estrategia', 'Juego de mesa'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: 'El Go (conocido como Baduk en Corea y Weiqi en China) es el juego de mesa más antiguo que todavía se practica en su forma original. Dos jugadores colocan piedras negras y blancas en una cuadrícula de 19x19 buscando controlar la mayor cantidad de territorio. Aunque las reglas se aprenden en pocos minutos, su profundidad estratégica es prácticamente infinita. Esta guía explica las reglas fundamentales, la vida y muerte de los grupos y los conceptos de apertura que definen cada partida.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'El tablero y conceptos iniciales',
      id: 'basics',
    },
    {
      type: 'paragraph',
      text: 'El Go se juega en una cuadrícula de 19x19 intersecciones (los principiantes suelen usar tableros de 9x9 o 13x13). Las negras mueven primero colocando una piedra en cualquier intersección libre. Una vez jugadas, las piedras no se desplazan: permanecen en el tablero hasta que son capturadas. La partida concluye cuando ambos jugadores pasan de forma consecutiva.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Libertades y capturas',
      id: 'liberties',
    },
    {
      type: 'paragraph',
      text: 'Las libertades de una piedra son las intersecciones vacías inmediatamente adyacentes (arriba, abajo, izquierda y derecha, nunca en diagonal). Las piedras conectadas comparten sus libertades como un solo grupo. Cuando un grupo se queda con cero libertades al ser rodeado por completo, es capturado y retirado del tablero.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Regla del Ko',
      id: 'ko',
    },
    {
      type: 'paragraph',
      text: 'La regla del ko evita repeticiones infinitas de jugadas: si una captura recrea la posición exacta del turno anterior, el oponente no puede recapturar de inmediato; debe jugar en otra parte del tablero primero. Esto mantiene la partida en constante avance.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Vida y muerte: los dos ojos',
      id: 'life-death',
    },
    {
      type: 'paragraph',
      text: 'Un grupo de piedras está vivo de forma incondicional si posee al menos dos ojos separados e independientes. Un ojo es una intersección vacía rodeada por tus propias piedras. Al tener dos ojos, el adversario tendría que ocupar ambos a la vez para capturarte, lo cual es imposible en un solo turno. Reconocer grupos vivos y muertos es la habilidad más determinante del Go.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Territorio y puntuación',
      id: 'territory',
    },
    {
      type: 'paragraph',
      text: 'El objetivo es cercar más territorio (intersecciones desocupadas) que el rival. Bajo el sistema japonés se suma el territorio cercado y se restan los prisioneros perdidos; bajo el sistema chino se contabilizan piedras vivas más territorio. Ambos sistemas otorgan el komi (habitualmente 6.5 o 7.5 puntos) a las blancas para compensar la salida de las negras.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Estrategia de apertura: esquinas, lados y centro',
      id: 'opening',
    },
    {
      type: 'paragraph',
      text: 'El proverbio clásico enseña: "Primero las esquinas, luego los laterales, el centro al final". Las esquinas requieren menos piedras para ser aseguradas, los lados son el siguiente paso natural y el centro es la zona más compleja para consolidar puntos. Juega en la tercera línea para ganar territorio y en la cuarta línea para proyectar influencia hacia el centro.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Conceptos tácticos esenciales',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Atari: Piedra o grupo al que solo le queda una libertad. Debe defenderse inmediatamente o será capturado.',
        'Escaleras (Shicho): Patrón de persecución diagonal donde el defensor es puesto en atari en cada paso sin posibilidad de escape.',
        'Redes (Geta): Maniobra de contención que atrapa piedras rivales sin necesidad de contactarlas directamente.',
        'Corte y conexión: Cortar divide las fuerzas enemigas en grupos débiles; conectar une tus propias piedras en estructuras sólidas.',
        'Sente y gote: Sente es una jugada con iniciativa que obliga al rival a responder; gote cede el turno y la iniciativa.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Errores comunes a evitar',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Invertir demasiadas piedras en el centro durante la fase de apertura.',
        'Descuidar la vida y muerte jugando en otra zona cuando un grupo propio está en peligro.',
        'Sobreconcentrar piedras en una sola área en lugar de dispersar influencia por el tablero.',
        'Ocupar accidentalmente los propios ojos reduciendo las libertades de supervivencia.',
      ],
    },
    {
      type: 'cta',
      href: '/games/go',
      text: 'Jugar a Go online — Gratis en navegador',
      description:
        'Juega contra amigos o IA en tableros de 9x9, 13x13 o 19x19 con opciones de handicap.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Resumen: cuatro claves para ganar',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Asegura primero las esquinas y luego extiende hacia los laterales.',
        'Verifica constantemente la estabilidad y libertades de tus grupos.',
        'Usa la tercera línea para territorio y la cuarta para influencia.',
        'Conserva la iniciativa (sente) obligando al rival a responder a tus amenazas.',
      ],
    },
    {
      type: 'paragraph',
      text: 'El Go premia la paciencia y las ventajas graduales a lo largo de cientos de turnos. Estudia la vida y muerte, respeta los proverbios clásicos y juega partidas continuas para desarrollar tu visión táctica.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Dominar esquinas y laterales',
        text: 'Asegura territorio en las esquinas tempranamente por su eficiencia defensiva.',
        url: '#opening',
      },
      {
        name: 'Monitorear libertades',
        text: 'Lleva el conteo de libertades de tus piedras para reaccionar antes del atari.',
        url: '#liberties',
      },
      {
        name: 'Construir dos ojos',
        text: 'Diseña formas con dos ojos separados para garantizar la supervivencia del grupo.',
        url: '#life-death',
      },
      {
        name: 'Mantener la iniciativa',
        text: 'Elige jugadas en sente para controlar el ritmo y obligar al rival a defenderse.',
        url: '#tactics',
      },
    ],
  },
};
