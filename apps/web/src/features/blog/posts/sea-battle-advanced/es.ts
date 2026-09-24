import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'sea-battle-advanced',
  locale: 'es',
  title:
    'Batalla Naval Avanzada — Psicología de Colocación, Caza por Probabilidad y Patrones de Final',
  excerpt:
    'Esquemas óptimos de colocación de flota, estrategias de caza basadas en probabilidad y conteo de barcos en el endgame que dan ventaja sistemática en Batalla Naval.',
  publishedAt: '2026-09-11',
  author: 'Equipo Arcadeum',
  tags: ['Batalla Naval', 'Estrategia', 'Avanzado', 'Probabilidad'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'La Batalla Naval no es pura suerte. Dos jugadores con las mismas condiciones de inicio pero estrategias diferentes tienen tasas de victoria radicalmente diferentes. El jugador que coloca los barcos de manera óptima y caza objetivos algorítmicamente ganará más partidas — incluso si hay un elemento de aleatoriedad en cada partida individual.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Colocación óptima de flota',
      id: 'placement',
    },
    {
      type: 'list',
      items: [
        'Evita el centro: la mayoría de la gente caza desde el centro primero. Coloca barcos grandes cerca de los bordes o esquinas.',
        'Usa los bordes estratégicamente: un barco en el borde solo puede ser atacado desde un lado, lo que ralentiza su detección.',
        'Dispersa la flota: los barcos juntos se encuentran juntos. Sepáralos al menos 2 casillas.',
        'Cambia la colocación en cada partida: si siempre colocas los barcos igual, un oponente experimentado lo usará contra ti.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Mapa de densidad de probabilidad — cómo cazan los jugadores inteligentes',
      id: 'probability-hunting',
    },
    {
      type: 'list',
      items: [
        'Patrón de ajedrez: la caza más eficiente sin información es disparar en patrón de tablero de ajedrez (una casilla de por medio). Por qué: el barco más pequeño tiene 2 casillas. Si disparas una de dos casillas, garantizas al menos un impacto en cada barco.',
        'Adapta el patrón a los barcos supervivientes: si solo sobrevive el portaaviones (5 casillas), basta con disparar cada 5 casillas en una fila.',
        'Tras un impacto: dispara inmediatamente a las casillas adyacentes (arriba, abajo, izquierda, derecha).',
        'Tras dos impactos consecutivos: sabes la orientación. Dispara a lo largo del eje.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Pon a prueba tus estrategias — juega Batalla Naval en Arcadeum',
      description: 'Batalla Naval en tiempo real contra amigos o IA.',
    },
  ],
  faq: [
    {
      question: '¿Por qué el patrón de ajedrez es el mejor para cazar?',
      answer:
        'Porque el barco más pequeño (2 casillas) necesariamente ocupará al menos una casilla del patrón de ajedrez. El patrón garantiza al menos un impacto en cada barco de 2+ casillas en aproximadamente 50 disparos.',
    },
    {
      question: '¿Hay que disparar siempre junto al impacto?',
      answer:
        'Sí, inmediatamente. Cambia al modo destrucción con cualquier impacto. La fase de destrucción es más eficiente — la probabilidad de una casilla adyacente es del 25-50%, frente al 10-20% en la caza aleatoria.',
    },
  ],
};
