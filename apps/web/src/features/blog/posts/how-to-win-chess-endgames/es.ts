import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-chess-endgames',
  locale: 'es',
  title: 'Dominio del final de ajedrez — Rey-peón, torres y posición de Lucena',
  excerpt:
    'El final es donde se ganan o se empatan las partidas. Aprende la oposición del rey-peón, las posiciones de Philidor y Lucena, las reglas de actividad de la torre y la dama contra torre.',
  publishedAt: '2026-09-18',
  author: 'Equipo Arcadeum',
  tags: ['Ajedrez', 'Final', 'Estrategia', 'Táctica', 'Avanzado'],
  readingTimeMinutes: 12,
  body: [
    {
      type: 'paragraph',
      text: 'La mayoría de los jugadores de ajedrez pasan su tiempo de estudio en las aperturas. Los jugadores que mejoran más rápido lo pasan en los finales. El final es la fase donde el conocimiento preciso convierte una pequeña ventaja en victoria, y donde la imprecisión desperdicia lo ganado en el medio juego.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Finales de rey-peón — oposición y la casilla clave',
      id: 'king-pawn',
    },
    {
      type: 'paragraph',
      text: 'Rey y peón contra rey es el tipo de final más común. Si el bando más fuerte gana depende completamente de la actividad del rey y de si el peón puede alcanzar su "casilla clave". Las tres casillas directamente frente al peón son sus casillas clave. Si el rey más fuerte controla una casilla clave antes de que el rey más débil pueda detenerlo, el peón corona.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Oposición — el concepto decisivo',
      id: 'opposition',
    },
    {
      type: 'paragraph',
      text: 'Dos reyes están en oposición cuando se enfrentan con exactamente una casilla entre ellos. El jugador que NO tiene el turno tiene la oposición. Ejemplo: Rey blanco en e5, Rey negro en e7, Peón blanco en e4, Blancas mueven. Las blancas ganan con Rd6! tomando oposición en la columna d, forzando Rd8 o Rf8, luego Re6 con oposición tomada — el peón corona.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Posición de Philidor — la fortaleza de tablas',
      id: 'philidor',
    },
    {
      type: 'paragraph',
      text: 'La posición de Philidor es la técnica defensiva clave en T+P contra T. La torre defensiva ocupa la 6ª fila ("rango Philidor"), cortando al rey atacante. Cuando el peón avanza a la 6ª fila, la torre defensiva cae a la 1ª fila para dar jaques perpetuos desde atrás. Clave: torre comienza en e6, peón en e5. Cuando las blancas juegan e6, Torre va a e1 — los jaques desde atrás son imparables.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Posición de Lucena — técnica ganadora',
      id: 'lucena',
    },
    {
      type: 'paragraph',
      text: 'La posición de Lucena es la técnica ganadora para el bando más fuerte. El peón ha llegado a la 7ª fila, el rey atacante está frente al peón, y la torre defiende desde atrás. La técnica se llama "construir un puente": (1) La torre corta al rey defensor por fila. (2) El rey avanza. (3) La torre vuelve para proteger al rey de jaques. (4) El peón corona.',
    },
    {
      type: 'list',
      items: [
        'Activa tu rey inmediatamente cuando se simplifique la posición.',
        'Cuenta con exactitud las carreras de peones — un movimiento de diferencia cambia victoria en tablas.',
        'La torre activa gana a la torre pasiva. Una torre en un archivo abierto crea amenazas.',
        'Conoce Philidor (tablas) y Lucena (victoria). Si llegas a T+P contra T, identifica cuál posición se acerca más.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Practica finales en partidas reales — juega Ajedrez en Arcadeum',
      description:
        'Revisa la fase de final en tu análisis post-partida para ver exactamente dónde la posición se volvió ganada o tablas.',
    },
  ],
  faq: [
    {
      question: '¿Cuál es el final más importante para estudiar primero?',
      answer:
        'Rey y peón contra rey: es el más común y enseña los dos conceptos fundamentales (oposición, casillas clave) que aparecen en todo tipo de final.',
    },
    {
      question: '¿Qué es la posición de Philidor?',
      answer:
        'Una técnica defensiva en T+P contra T donde la torre defensora ocupa la 6ª fila cortando al rey atacante, luego cambia a jaques desde la 1ª fila cuando el peón avanza. El empate es teóricamente forzado con juego correcto.',
    },
  ],
};
