import type { DeepPartial } from '../../base-types';
import type { en } from './en';

export const es: DeepPartial<typeof en> = {
  bell: {
    aria: 'Notificaciones',
    empty: 'Aún no hay notificaciones',
    title: 'Notificaciones',
    markAllRead: 'Marcar todo como leído',
  },
  settings: {
    title: 'Notificaciones',
    description:
      'Elige qué notificaciones quieres. Todo está desactivado por defecto - activa solo lo que te interese.',
    permission: {
      granted: 'Las notificaciones están activadas en tu navegador.',
      denied:
        'Tu navegador ha bloqueado las notificaciones. Actívalas en la configuración del sitio.',
      enable: 'Activar notificaciones del navegador',
    },
    iosInstallHint:
      'En iOS añade Arcadeum a la pantalla de inicio antes de recibir notificaciones. Toca Compartir y luego «Añadir a inicio».',
  },
  categories: {
    daily_reward_ready: {
      label: 'Recompensa diaria lista',
      description: 'Te avisa cuando se abre la ventana de tu racha.',
    },
    tournament_starting_soon: {
      label: 'Torneo a punto de empezar',
      description:
        'Te avisa unos 10 minutos antes de un torneo en el que estás registrado.',
    },
    tournament_registration_opened: {
      label: 'Nuevo torneo publicado',
      description:
        'Te avisa cuando se abren las inscripciones a un evento nuevo.',
    },
    announcement_new: {
      label: 'Nuevo anuncio',
      description: 'Notas de parche, lanzamientos y otros anuncios generales.',
    },
    friend_request: {
      label: 'Solicitudes de amistad',
      description: 'Te avisa cuando alguien envía una solicitud de amistad.',
    },
    friend_accepted: {
      label: 'Solicitud de amistad aceptada',
      description: 'Te avisa cuando alguien acepta tu solicitud de amistad.',
    },
    game_invitation: {
      label: 'Invitaciones a jugar',
      description: 'Te avisa cuando alguien te invita a una sala de juego.',
    },
    gift_received: {
      label: 'Regalos',
      description: 'Te avisa cuando alguien te envía un regalo.',
    },
  },
  daily_reward_ready: {
    title: 'Recompensa diaria lista',
    body: 'Tu racha te espera - recógela ahora.',
  },
  tournament_starting_soon: {
    title: '{{name}} comienza en {{minutes}} min',
    body: 'Entra antes de que se cierre el cuadro.',
  },
  tournament_registration_opened: {
    title: 'Nuevo torneo: {{name}}',
    body: 'La inscripción está abierta. Toca para ver.',
  },
  announcement_new: {
    title: '{{title}}',
    body: '{{excerpt}}',
  },
  friend_request: {
    title: 'Nueva solicitud de amistad',
    body: '{{username}} quiere ser tu amigo.',
  },
  friend_accepted: {
    title: 'Solicitud de amistad aceptada',
    body: '{{username}} aceptó tu solicitud de amistad.',
  },
  game_invitation: {
    title: 'Invitación a jugar',
    body: '{{hostName}} te invitó a jugar {{gameId}}.',
  },
  rematch_accepted: {
    title: 'Revancha aceptada',
    body: '{{opponentName}} aceptó tu revancha. ¡Únete a la partida!',
  },
  rematch_declined: {
    title: 'Revancha rechazada',
    body: '{{opponentName}} rechazó la revancha.',
  },
  gift_received: {
    title: 'Regalo de {{senderName}}',
    body: '{{itemName}}: {{message}}',
  },
};
