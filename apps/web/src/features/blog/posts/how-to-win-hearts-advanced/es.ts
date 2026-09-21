import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-hearts-advanced',
  locale: 'es',
  title:
    'Estrategia Avanzada en Hearts — Leyendo Oponentes y Señales de Disparo a la Luna',
  excerpt:
    'Cómo leer los pases de cartas, reconocer disparos a la luna en el truco 3, planificar a través de varias manos y contar cartas en el endgame.',
  publishedAt: '2026-09-16',
  author: 'Equipo Arcadeum',
  tags: ['Hearts', 'Juego de Cartas', 'Estrategia', 'Avanzado', 'Levadas'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'La mayoría de los consejos de Hearts se detienen en "haz un void y evita cartas altas". Esa es la base correcta, pero los jugadores que ganan consistentemente hacen algo más: leen la mesa. Infieren manos ocultas de los patrones de pase y descarte, planifican a través de varias manos simultáneamente y reconocen las señales del disparo a la luna antes de que sea demasiado tarde.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Leyendo oponentes por sus pases',
      id: 'reading-passes',
    },
    {
      type: 'list',
      items: [
        'Te pasaron cartas altas — el que pasa es débil en ese palo. Si recibes la Reina de Picas en el pase, el que pasa o no tiene picas o está planeando un disparo a la luna.',
        'Te pasaron cartas bajas — el que pasa guardó sus cartas altas. Si recibes 2, 3, 4 de tréboles, probablemente guardó sus ases y reyes.',
        'Te pasaron cartas medias (7, 8, 9) — el que pasa intentó crear un void en algún palo.',
        'Te pasaron la Reina de Picas — muy inusual. Casi siempre significa que el que pasa no tiene otras picas.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Señales de disparo a la luna',
      id: 'moon-tells',
    },
    {
      type: 'list',
      items: [
        'Toman el primer corazón voluntariamente. Un jugador normal evita corazones. Un jugador que gana un corazón en el truco 2 o 3 sin señales de dolor está disparando.',
        'Lideran con carta alta en un palo no-picas. Liderar con As de Tréboles o As de Corazones significa que quieren controlar la secuencia de trucos.',
        'Tienen la Reina de Picas Y toman corazones. En un disparo lunar, la Reina es un activo, no una carga.',
        'Regla de bloqueo: gana UN corazón. No necesitas derrotar al tirador — solo necesitas un corazón para que los 26 puntos se queden con él.',
      ],
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Aplica estrategia avanzada en Hearts — juega en Arcadeum',
      description:
        'Hearts en tiempo real para cuatro jugadores con reglas completas incluyendo disparo a la luna.',
    },
  ],
  faq: [
    {
      question: '¿Cómo sé cuándo alguien está disparando a la luna?',
      answer:
        'Tres señales: toman corazones voluntariamente en los primeros 4 trucos, lideran con cartas altas en lugar de bajas, y tienen o dan la bienvenida a la Reina de Picas. Si ves dos de estos tres, asume que están disparando y gana un corazón inmediatamente.',
    },
    {
      question: '¿Vale la pena guardar la Reina de Picas como arma?',
      answer:
        'Sí, en dos situaciones: cuando un jugador está disparando a la luna y la Reina puede detenerlo, o cuando un jugador está cerca de 100 puntos y puedes terminar el juego forzando la Reina sobre él.',
    },
  ],
};
