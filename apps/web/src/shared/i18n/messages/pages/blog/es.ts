import type { blogEn } from './en';

export const blogEs: typeof blogEn = {
  title: 'Blog de Juegos Arcadeum',
  subtitle:
    'Guías de juego, análisis estratégicos, notas de versión e historias de la comunidad',
  description:
    'Profundiza en las mecánicas de juegos de mesa, resúmenes de torneos, notas del parche y consejos profesionales.',
  searchPlaceholder: 'Buscar artículos y guías…',
  allCategories: 'Todos los temas',
  categories: {
    all: 'Todos',
    guides: 'Guías Estratégicas',
    updates: 'Actualizaciones',
    community: 'Comunidad',
    tournaments: 'Torneos',
  },
  featuredBadge: 'Artículo Destacado',
  minRead: '{min} min de lectura',
  newsletter: {
    title: 'Suscríbete a las Notas del Parche y Guías',
    subtitle:
      'Recibe avisos de nuevos juegos, torneos y actualizaciones de equilibrio.',
    placeholder: 'Introduce tu correo electrónico',
    button: 'Suscribirse',
    success: '¡Gracias por suscribirte!',
  },
  cta: {
    title: '¿Tienes una estrategia o historia que contar?',
    description:
      'Únete a la comunidad en Discord y envía tus propias guías para publicarlas en el blog.',
    button: 'Enviar Artículo',
  },
};
