import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-pachisi',
  locale: 'es',
  title: 'Cómo jugar a Parchís (Ludo) online — reglas, capturas, estrategia',
  excerpt:
    'Guía completa: carrera de dados con capturas, casillas seguras y bloqueos tácticos.',
  publishedAt: '2026-07-07',
  author: 'Equipo Arcadeum',
  tags: ['Parchís', 'Ludo', 'Cómo jugar', 'Estrategia', 'Juego de mesa'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Parchís (Ludo) es un clásico juego de carrera para 2-4 jugadores. Cada uno corre cuatro fichas alrededor del tablero y las lleva a casa. Lanza dados, captura, bloquea y sé el primero en llevar las cuatro fichas a casa.',
    },
    { type: 'heading', level: 2, text: 'Preparación', id: 'setup' },
    {
      type: 'paragraph',
      text: 'Cada jugador empieza con 4 fichas en su base. Necesitas un número específico (normalmente 6) para sacar ficha.',
    },
    { type: 'heading', level: 2, text: 'Capturas', id: 'captures' },
    {
      type: 'paragraph',
      text: 'Si caes en una casilla rival, la capturas y vuelve a su base. Capturar da turno extra.',
    },
    { type: 'heading', level: 2, text: 'Casillas seguras', id: 'safe' },
    {
      type: 'paragraph',
      text: 'Las casillas marcadas protegen fichas de captura. La columna de casa solo acepta tus fichas. Necesitas número exacto para llegar.',
    },
    { type: 'heading', level: 2, text: 'Estrategia', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Reparte fichas.',
        'Usa casillas seguras.',
        'Captura para tempo.',
        'Prioriza llegar a casa.',
        'Bloquea con dos fichas.',
      ],
    },
    {
      type: 'cta',
      href: '/games/pachisi',
      text: 'Juega a Parchís online — gratis',
      description: 'Carreras con amigos o IA.',
    },
    { type: 'heading', level: 2, text: 'Resumen', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Reparte fichas.',
        'Casillas seguras.',
        'Captura para tempo.',
        'Lleva a casa.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      { name: 'Saca fichas', text: 'Necesitas 6 para entrar.', url: '#setup' },
      {
        name: 'Captura',
        text: 'Caer en rival = captura + turno extra.',
        url: '#captures',
      },
      { name: 'Casillas seguras', text: 'Protegen de captura.', url: '#safe' },
      {
        name: 'Lleva a casa',
        text: 'Columna de casa + número exacto.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    { question: '¿Cómo sacar ficha?', answer: 'Lanza 6 para sacar de base.' },
    {
      question: '¿Qué pasa al capturar?',
      answer: 'Ficha rival vuelve a base. Tú ganas turno extra.',
    },
  ],
};
