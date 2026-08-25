import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-critical',
  locale: 'es',
  title: 'Cómo jugar a Critical online — reglas, desarmar bombas, estrategia',
  excerpt:
    'Guía completa: juego de cartas estilo Exploding Kittens donde cada robo puede ser el último. Aprende desarmar, cartas de acción y conteo de mazo.',
  publishedAt: '2026-08-04',
  author: 'Equipo Arcadeum',
  tags: ['Critical', 'Juego de cartas', 'Cómo jugar', 'Estrategia'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Critical es un juego de cartas rápido y de alto riesgo donde cada robo del mazo puede ser la bomba fatal que te elimina. Los jugadores roban cartas, juegan acciones y intentan sobrevivir más que todos. El último en pie gana.',
    },
    { type: 'heading', level: 2, text: 'Preparación', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Cada jugador recibe una mano inicial (normalmente 7 cartas). Las restantes forman el mazo. Algunas cartas son bombas Critical — al robarla, quedas eliminado a menos que juegues un Desarmar.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cómo funcionan los turnos',
      id: 'turns',
    },
    {
      type: 'paragraph',
      text: 'En tu turno, puedes jugar cero o más cartas de acción, luego DEBES robar una carta del mazo. Jugar cartas no termina tu turno — termina solo después de robar o jugar un Saltar.',
    },
    { type: 'heading', level: 2, text: 'Tipos de cartas', id: 'cards' },
    {
      type: 'list',
      items: [
        'Bomba Critical. Al robarla, quedas eliminado sin Desarmar.',
        'Desarmar. Te salva de una bomba. Reinsertas la bomba en el mazo.',
        'Ataque. El siguiente jugador toma dos turnos. Acumulable.',
        'Saltar. Termina tu turno sin robar.',
        'Mirar. Ve las 3 cartas superiores y reordena.',
        'Robar. Toma una carta aleatoria de un rival.',
      ],
    },
    { type: 'heading', level: 2, text: 'Conteo de mazo', id: 'counting' },
    {
      type: 'paragraph',
      text: 'La habilidad más poderosa es rastrear cuántas bombas y desarmar quedan. Si en 20 cartas hay 3 bombas y 2 desarmar, tu riesgo es 15%.',
    },
    { type: 'heading', level: 2, text: 'Estrategia', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Guarda tu Desarmar. No lo juegues proactivamente.',
        'Usa Ataques para presionar. Cuando el mazo es peligroso, obliga a otros a robar.',
        'Reinserta bombas estratégicamente. Colócalas cerca de la parte superior.',
        'Rastrea las cartas jugadas. Si alguien jugó Desarmar, hay menos seguridad.',
        'Juega Mirar antes de robar.',
      ],
    },
    { type: 'heading', level: 2, text: 'Errores comunes', id: 'mistakes' },
    {
      type: 'list',
      items: [
        'Desarmar demasiado pronto.',
        'Ignorar el conteo del mazo.',
        'Ataques imprudentes.',
        'Reinsertar bombas en posiciones obvias.',
      ],
    },
    {
      type: 'cta',
      href: '/games/critical',
      text: 'Juega a Critical online — gratis',
      description: 'Abre una sala, comparte el enlace o juega contra IA.',
    },
    { type: 'heading', level: 2, text: 'Resumen — cuatro hábitos', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Cuenta bombas y desarmar.',
        'Guarda tu Desarmar.',
        'Usa Ataques y Saltar para evitar robos peligrosos.',
        'Reinserta bombas cerca de la parte superior.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Cuenta bombas',
        text: 'Rastrea bombas y desarmar. Tu riesgo cambia cada turno.',
        url: '#counting',
      },
      {
        name: 'Guarda Desarmar',
        text: 'No lo juegues proactivamente.',
        url: '#strategy',
      },
      {
        name: 'Usa Ataques',
        text: 'Cuando el mazo es peligroso, obliga a otros a robar.',
        url: '#strategy',
      },
      {
        name: 'Reinserta bombas',
        text: 'Colócalas cerca de la parte superior.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: '¿Qué pasa al bomba?',
      answer: 'Quedas eliminado sin Desarmar.',
    },
    {
      question: '¿Se pueden jugar cartas en turnos ajenos?',
      answer: 'No. Solo en tu turno, antes de robar.',
    },
    {
      question: '¿Cómo funciona el conteo?',
      answer:
        'Rastrea bombas/desarmar restantes. Riesgo = bombas / cartas restantes.',
    },
  ],
};
