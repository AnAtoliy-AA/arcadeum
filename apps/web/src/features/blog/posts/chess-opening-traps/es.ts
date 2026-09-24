import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'chess-opening-traps',
  locale: 'es',
  title: '10 trampas de apertura de ajedrez que todo jugador debe conocer',
  excerpt:
    'Pastor mate, trampa de Legal, Hígado Frito, Gambito Stafford — secuencias completas de movimientos con explicaciones sobre cómo tenderlas y cómo defenderse de cada una.',
  publishedAt: '2026-09-19',
  author: 'Equipo Arcadeum',
  tags: ['Ajedrez', 'Apertura', 'Táctica', 'Trampas', 'Principiante'],
  readingTimeMinutes: 11,
  body: [
    {
      type: 'paragraph',
      text: 'Las trampas de apertura son secuencias tácticas forzadas colocadas justo al comienzo de la partida. Funcionan no porque sean "buenos movimientos", sino porque el oponente no espera peligro tan pronto. Esta guía cubre 10 trampas: cómo tenderlas, cómo neutralizarlas y por qué siguen atrapando jugadores hasta hoy.',
    },
    {
      type: 'heading',
      level: 2,
      text: '1. Pastor Mate — el mate más rápido en ajedrez',
      id: 'scholars-mate',
    },
    {
      type: 'paragraph',
      text: 'El Pastor Mate se logra en el movimiento 4 atacando la casilla f7 — el punto más débil en la posición inicial de las negras, defendido solo por el rey. Secuencia: 1.e4 e5 2.Dh5 Cc6 3.Ac4 Cf6?? 4.D:f7#. Las blancas dan jaque mate en el movimiento 4. La defensa es simple: 2...Cc6 contraataca la amenaza de la dama; después de 3.Ac4 las negras deben jugar 3...g6!, atacando la dama. Nunca juegue 3...Cf6?? — este error ha costado la partida a millones de principiantes.',
    },
    {
      type: 'heading',
      level: 2,
      text: '2. Trampa de Legal — el sacrificio de dama falso',
      id: 'legal-trap',
    },
    {
      type: 'paragraph',
      text: 'Una de las trampas más antiguas del ajedrez, inventada hacia 1750. Posición: 1.e4 e5 2.Cf3 d6 3.Ac4 Ag4 4.Cc3 g6? 5.C:e5! — las blancas sacrifican la dama. Si las negras toman la dama: 5...A:d1? 6.A:f7+ Re7 7.Cd5#. ¡Jaque mate! La trampa funciona porque las negras ven una dama gratis y la toman sin verificar las consecuencias.',
    },
    {
      type: 'heading',
      level: 2,
      text: '3. Hígado Frito — ataque al rey',
      id: 'fried-liver',
    },
    {
      type: 'paragraph',
      text: 'Uno de los ataques más agresivos en ajedrez, variante de la Defensa de los Dos Caballos: 1.e4 e5 2.Cf3 Cc6 3.Ac4 Cf6 4.Cg5 d5 5.e:d5 C:d5? 6.C:f7! R:f7 7.Df3+ Re6 8.Cc3. Las blancas sacrifican un caballo para atacar al rey desnudo. Las negras deben sacrificar material para sobrevivir y quedan con una posición comprometida.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Principios de defensa contra trampas',
      id: 'defense',
    },
    {
      type: 'list',
      items: [
        'No tome material automáticamente. Antes de capturar, pregunte: "¿Por qué el oponente ofrece esto?"',
        'Verifique los jaques primero. La mayoría de las trampas incluyen un jaque forzado después de la captura.',
        'Desarrolle piezas antes de atacar. Las posiciones subdesarrolladas son la principal razón para caer en trampas.',
        'Conozca las trampas específicas de sus aperturas. Estudie defensas precisas contra las trampas que se presentan en sus aperturas favoritas.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Practique trampas en partidas reales — juegue Ajedrez en Arcadeum',
      description:
        'Ajedrez en línea con análisis de partidas después del juego.',
    },
  ],
  faq: [
    {
      question: '¿Cuál es la trampa más rápida en ajedrez?',
      answer:
        'El Pastor Mate — jaque mate en el movimiento 4 con blancas. Sin embargo, contra un oponente informado no funciona: el simple 2...Cc6 o 3...g6 neutraliza el ataque.',
    },
    {
      question: '¿Vale la pena jugar gambitos al principio?',
      answer:
        'A nivel amateur, sí — los gambitos dan iniciativa y juego activo. A alto nivel, el oponente debe aceptar el gambito correctamente y igualar. Estudie el refutación de sus gambitos para saber qué temer.',
    },
  ],
};
