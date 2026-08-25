import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-cascade',
  locale: 'es',
  title: 'Cómo jugar a Cascade online — reglas, cadenas de acción, estrategia',
  excerpt:
    'Guía completa: juego de cartas tipo UNO con cadenas de penalización y estrategia de combos.',
  publishedAt: '2026-08-11',
  author: 'Equipo Arcadeum',
  tags: ['Cascade', 'Juego de cartas', 'Cómo jugar', 'Estrategia'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Cascade es un juego rápido de deshacerse de cartas para varios jugadores. Piensa en UNO con profundidad estratégica: combina por color o número, juega acciones para penalizar y encadena contraataques.',
    },
    { type: 'heading', level: 2, text: 'Preparación', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Cada jugador recibe una mano (normalmente 7 cartas). Las restantes forman el mazo de robo. La carta superior se voltea para la pila de descartes.',
    },
    { type: 'heading', level: 2, text: 'Turnos', id: 'turns' },
    {
      type: 'paragraph',
      text: 'Juega una carta que coincida por color, número o símbolo. Si no puedes, roba una carta. Los comodines se juegan sobre cualquier carta.',
    },
    { type: 'heading', level: 2, text: 'Cartas de acción', id: 'actions' },
    {
      type: 'list',
      items: [
        '+2. El siguiente roba 2 y pierde turno. Se contrarresta con otra +2.',
        '+4 Comodín. Elige color, siguiente roba 4. Se contrarresta con otra +4.',
        'Saltar. El siguiente pierde turno.',
        'Reverso. Invierte dirección. En 2 jugadores = Saltar.',
        'Comodín. Cambia color.',
      ],
    },
    { type: 'heading', level: 2, text: 'Estrategia', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Diversifica colores en mano.',
        'Guarda comodines para emergencias.',
        'Cadena penalizaciones.',
        'Cuenta cartas de rivales y bloquea al líder.',
      ],
    },
    { type: 'heading', level: 2, text: 'Errores', id: 'mistakes' },
    {
      type: 'list',
      items: [
        ' gastar comodines temprano.',
        'Ignorar cartas de rivales.',
        'No cadena penalizaciones.',
      ],
    },
    {
      type: 'cta',
      href: '/games/cascade',
      text: 'Juega a Cascade online — gratis',
      description: 'Rápidas rondas, profundidad estratégica.',
    },
    { type: 'heading', level: 2, text: 'Resumen', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Diversifica colores.',
        'Guarda comodines.',
        'Cadena +2/+4.',
        'Bloquea al líder.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Combina',
        text: 'Juega carta que coincida. Si no, roba una.',
        url: '#turns',
      },
      {
        name: 'Cadena',
        text: 'Contrarresta +2 con +2, +4 con +4.',
        url: '#actions',
      },
      {
        name: 'Guarda comodines',
        text: 'Para emergencias, no conveniencia.',
        url: '#strategy',
      },
      {
        name: 'Bloquea',
        text: 'Cambia color cuando un rival está cerca de ganar.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: '¿Qué si no puedes jugar?',
      answer: 'Roba una carta. Si coincide, juega inmediatamente.',
    },
    {
      question: '¿Se pueden apilar +2?',
      answer: 'Sí. Contrarresta con otra +2. El siguiente toma 4.',
    },
  ],
};
