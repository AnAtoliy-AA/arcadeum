import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-glimworm',
  locale: 'es',
  title:
    'Cómo jugar a Glimworm online — arena de neón, tácticas, supervivencia',
  excerpt:
    'Guía completa: multijugador serpientes donde comes luz, dejas rastros letales y superas rivales.',
  publishedAt: '2026-08-18',
  author: 'Equipo Arcadeum',
  tags: ['Glimworm', 'Serpientes', 'Arcade', 'Cómo jugar', 'Estrategia'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Glimworm es un arena multijugador de serpientes en tiempo real. Hasta 10 jugadores compiten en una arena neón, comiendo partículas de luz para crecer y dejando rastros letales. Choque frontal = eliminación. La última serpiente brillante gana.',
    },
    { type: 'heading', level: 2, text: 'La arena', id: 'arena' },
    {
      type: 'paragraph',
      text: 'Juego en arena limitada con partículas de luz. Tocar el borde = muerte.',
    },
    { type: 'heading', level: 2, text: 'Mecánicas', id: 'mechanics' },
    {
      type: 'list',
      items: [
        'Movimiento. La serpiente sigue tu cursor.',
        'Comer partículas. Alargan tu cuerpo.',
        'Rastros. Otros que tocan tu rastro mueren.',
        'Impulso. Sacrifica rastro para acelerar.',
        'Colisión. Cuerpo = muerte. Borde = muerte.',
      ],
    },
    { type: 'heading', level: 2, text: 'Tácticas', id: 'tactics' },
    {
      type: 'list',
      items: [
        'Trampa circular. Rodea oponentes pequeños.',
        'Intercepta con impulso.',
        'Granja en el perímetro.',
        'Cebo con rastro.',
        'Cose las partículas de eliminados.',
      ],
    },
    { type: 'heading', level: 2, text: 'Estrategia', id: 'strategy' },
    {
      type: 'list',
      items: [
        'Inicio: crece seguro en el perímetro.',
        'Medio: pelea con más pequeños.',
        'Final: juega agresivamente.',
        'Gestiona el impulso.',
      ],
    },
    {
      type: 'cta',
      href: '/games/glimworm',
      text: 'Juega a Glimworm online — gratis',
      description: 'Arena de neón, juego instantáneo.',
    },
    { type: 'heading', level: 2, text: 'Resumen', id: 'tldr' },
    {
      type: 'list',
      items: [
        'Crece en el perímetro.',
        'Usa trampas circulares.',
        'Ahorra impulso.',
        'Cose partículas de eliminados.',
      ],
    },
  ],
  howTo: {
    totalTime: 'PT10M',
    steps: [
      {
        name: 'Come partículas',
        text: 'Perímetro para crecer seguro.',
        url: '#strategy',
      },
      {
        name: 'Aprende a circular',
        text: 'Rodea oponentes pequeños.',
        url: '#tactics',
      },
      {
        name: 'Domina el impulso',
        text: 'Corta para acelerar.',
        url: '#mechanics',
      },
      {
        name: 'Evita frontales',
        text: 'Nunca choques con más grande.',
        url: '#tactics',
      },
    ],
  },
  faq: [
    {
      question: '¿Qué causa eliminación?',
      answer: 'Choque con cuerpo, borde, o choque frontal.',
    },
    {
      question: '¿Cómo funciona el impulso?',
      answer:
        'Sacrificas rastro para acelerar. Te haces más rápido pero más corto.',
    },
  ],
};
