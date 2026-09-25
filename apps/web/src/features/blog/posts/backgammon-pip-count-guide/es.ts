import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'backgammon-pip-count-guide',
  locale: 'es',
  title: 'Conteo de Fichas en Backgammon y Decisiones del Cubo — Guía Práctica',
  excerpt:
    'Domina el conteo de fichas para ganar más decisiones de carrera y doblar con confianza. Incluye métodos de conteo paso a paso, la regla del 25% de aceptación del cubo y el pensamiento de equidad de partida.',
  publishedAt: '2026-09-14',
  author: 'Equipo Arcadeum',
  tags: ['Backgammon', 'Estrategia', 'Cubo de Doblar', 'Avanzado', 'Dados'],
  readingTimeMinutes: 9,
  body: [
    {
      type: 'paragraph',
      text: 'La habilidad única que separa a los jugadores intermedios de backgammon de los avanzados no es la visión del tablero — es el conteo de fichas. Un conteo de fichas te dice exactamente cuántas fichas (pips de dados) cada jugador necesita para retirar todas sus piezas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cómo contar fichas — paso a paso',
      id: 'counting-method',
    },
    {
      type: 'paragraph',
      text: 'El método más simple: multiplica el número de piezas en cada punto por el número del punto, luego súmalos todos. Ejemplo: 3 piezas en el punto 6, 2 en el 5, 4 en el 4. Conteo: (3×6)+(2×5)+(4×4) = 18+10+16 = 44. Repite para todo el tablero. La suma es tu conteo de fichas. El jugador con el número menor va ganando la carrera.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Teoría del cubo — cuándo doblar y cuándo aceptar',
      id: 'cube-theory',
    },
    {
      type: 'list',
      items: [
        'Punto de oferta (doblar): aproximadamente cuando tu probabilidad de ganar supera el 70-75%. En carrera pura, si llevas ventaja del 8-10% o más en tu conteo — dobla.',
        'Punto de aceptación: aproximadamente con el 25% o más de probabilidades de ganar. La matemática: si rechazas, pierdes 1 punto. Si aceptas con 25%: esperanza = 0.25×2 = 0.5 vs. 1 punto perdido al rechazar.',
        'Regla del 8%: en posiciones de carrera pura, si tu conteo es mejor en un 8-10% — tienes una primera oferta válida.',
      ],
    },
    {
      type: 'cta',
      href: '/games/backgammon',
      text: 'Practica tus decisiones de cubo — juega Backgammon en Arcadeum',
      description: 'Backgammon con el cubo de doblar completo.',
    },
  ],
  faq: [
    {
      question:
        '¿Es realmente necesario el conteo de fichas para el juego casual?',
      answer:
        'A nivel casual, la intuición a menudo funciona. Pero en cuanto empiezas a jugar contra personas que cuentan, perderás sistemáticamente las decisiones del cubo de doblar.',
    },
    {
      question: '¿Cuál es la ventaja mínima de fichas para doblar?',
      answer:
        'En carrera pura, aproximadamente 8-10% de tu conteo. En posiciones con contacto, el conteo solo no es suficiente — también debes evaluar factores posicionales como anclas y primes.',
    },
  ],
};
