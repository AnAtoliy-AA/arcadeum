import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-spades',
  locale: 'es',
  title: 'Cómo ganar en Spades — Licitaciones, Niles, Bolsas y Juego en Equipo',
  excerpt:
    'Más allá de los fundamentos: cómo leer tu mano, licitar con precisión, ejecutar licitaciones nulas, evitar penalizaciones por bolsas y señalizar a tu pareja.',
  publishedAt: '2026-09-17',
  author: 'Equipo Arcadeum',
  tags: ['Spades', 'Juego de Cartas', 'Estrategia', 'Licitación', 'Avanzado'],
  readingTimeMinutes: 11,
  body: [
    {
      type: 'paragraph',
      text: 'En Spades, la habilidad real reside en la licitación — antes de que se juegue una carta. Un equipo que licita con precisión, evita la acumulación de bolsas y ejecuta niles de alto riesgo, vencerá a un equipo que juega bien las cartas pero licita descuidadamente, casi siempre.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cómo evaluar tu mano antes de licitar',
      id: 'hand-evaluation',
    },
    {
      type: 'paragraph',
      text: 'Cada licitación comienza con una evaluación honesta de tus 13 cartas. No cuentes victorias — cuenta bazas que esperas tomar. As de Espadas = 1 baza garantizada. Rey de Espadas = ~0.85 bazas. Void en un palo = +0.5 bazas extra. Singletones y dobles = potencial de ruff.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Bolsas — la muerte lenta en Spades',
      id: 'sandbagging',
    },
    {
      type: 'paragraph',
      text: 'Cada baza tomada sobre tu licitación es una bolsa. Diez bolsas cuestan 100 puntos. La técnica de "pato": cuando ya has cumplido tu contrato, deliberadamente pierde bazas que podrías ganar. La regla: licita con precisión, no de forma conservadora. La licitación baja sistemáticamente crea más bolsas que la licitación audaz.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Licitaciones nulas — el riesgo máximo, la recompensa máxima',
      id: 'nil-bids',
    },
    {
      type: 'paragraph',
      text: 'Una licitación nula significa que planeas ganar cero bazas. Éxito: +100 puntos; fallo: -100 puntos. Cuándo ir nulo: tu mano no tiene cartas altas en ningún palo, ningún as ni rey. Una mano con 2, 3, 4, 5 de tréboles y nada por encima de 6 en otros palos es una mano nula clásica.',
    },
    {
      type: 'list',
      items: [
        'Nunca vayas nulo con un as o rey en la mano: una carta alta arruina el nulo.',
        'Haz "pato" (pierde bazas deliberadamente) cuando ya cumpliste tu licitación.',
        'Vigila el conteo de bolsas constantemente — 7 bolsas ya es zona de peligro.',
        'Al final del juego: si los oponentes están cerca de 100, licita alto intentando hundir su contrato.',
      ],
    },
    {
      type: 'cta',
      href: '/games/spades',
      text: 'Aplica estas estrategias — juega Spades en Arcadeum',
      description:
        'Spades para cuatro jugadores con conteo de bolsas en vivo y resumen post-partida.',
    },
  ],
  faq: [
    {
      question: '¿Cuál es la licitación total ideal para una pareja?',
      answer:
        'La mayoría de los jugadores fuertes apuntan a una licitación combinada de 10-11 bazas por mano. 12+ crea riesgo de bolsas; 8 o menos es agresivo y puede llevar a sets.',
    },
    {
      question: '¿Cuándo intentar hundir a los oponentes?',
      answer:
        'Cuando tienen una licitación combinada de 9 o más y tienes cartas altas que pueden ganar sus bazas. Un "set" (oponentes fallando su contrato) te da aproximadamente 60-130 puntos.',
    },
  ],
};
