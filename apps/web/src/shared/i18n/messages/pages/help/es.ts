import { helpFaq } from '../help-faq/es';
import type { helpEn } from './en';

export const helpEs: typeof helpEn = {
  title: 'Centro de Ayuda de Arcadeum',
  subtitle: 'Guías, reglas de juego, gestión de cuenta y solución de problemas',
  description:
    'Explora nuestra base de conocimientos, busca preguntas frecuentes o contacta con nuestro equipo.',
  searchPlaceholder: 'Buscar en guías, temas y preguntas frecuentes…',
  noResults: 'No se encontraron artículos para "{query}"',
  allFaqs: 'Todas las Preguntas',
  status: {
    title: 'Estado de la Plataforma',
    operational: 'Todos los Sistemas Operativos',
    gateway: 'Gateway WebSocket: 100% Operativo',
    cloud: 'Servidores de Juego: Baja Latencia',
  },
  categories: [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Crea salas, invita amigos y juega sin registrarte.',
      icon: '🚀',
    },
    {
      id: 'games-rules',
      title: 'Juegos y Reglas',
      description:
        'Reglas oficiales, variantes, temporizadores y puntuaciones.',
      icon: '♟️',
    },
    {
      id: 'account-security',
      title: 'Cuenta y Seguridad',
      description:
        'Ajustes de perfil, recuperación de contraseña y privacidad.',
      icon: '🔒',
    },
    {
      id: 'rewards-economy',
      title: 'Monedas y Recompensas',
      description: 'Rachas diarias, misiones y desbloqueos en la tienda.',
      icon: '💎',
    },
    {
      id: 'tournaments-ranking',
      title: 'Torneos y Clasificaciones',
      description: 'Cuadros de torneos, cálculo de Elo y clasificaciones.',
      icon: '🏆',
    },
    {
      id: 'technical-support',
      title: 'Soporte Técnico',
      description:
        'Solución a desconexiones, reconexión y consejos de latencia.',
      icon: '🛠️',
    },
  ],
  contactChannels: {
    title: '¿Necesitas ayuda directa?',
    subtitle:
      'Nuestros moderadores y desarrolladores están listos para ayudarte.',
    discord: 'Unirse al Discord',
    tickets: 'Crear Ticket de Soporte',
    email: 'support@arcadeum.net',
  },
  faq: helpFaq,
  comingSoon: 'Próximamente más guías interactivas.',
};
