import { landing } from './landing-es';

export const esMessages = {
  glimworm_v1: {
    name: 'Glimworm',
    description: 'Una batalla de gusanos brillantes para 2 a 10 jugadores.',
    tagline: 'Mantén pulsado, deslízate, sobrevive.',
    landing,
    variant: {
      battleRoyale: {
        name: 'Battle Royale',
        description: 'Gana el último gusano vivo. La arena se reduce.',
      },
      timeAttack: {
        name: 'Contrarreloj',
        description:
          '90 segundos. Gana la mayor puntuación. Nadie queda fuera.',
      },
      livesHeats: {
        name: 'Vidas + Mangas',
        description: 'Tres vidas cada uno. Gana el último con vidas.',
      },
    },
    powerup: {
      speed: { name: 'Ráfaga de velocidad', tip: 'Sprint de 3 segundos.' },
      shield: { name: 'Escudo', tip: 'Absorbe un golpe.' },
      shrink: {
        name: 'Encoger',
        tip: 'Suelta el 30% de tu longitud para escapar.',
      },
      ghost: { name: 'Fantasma', tip: '2 s atravesando estelas.' },
    },
    lobby: {
      pickColor: 'Elige el color de tu gusano',
      fillWithBots: 'Rellenar con bots',
      waitingForPlayers: 'Esperando al menos 2 gusanos…',
      variant: 'Modo',
      powerups: 'Mejoras',
      powerupsOn: 'Activadas',
      powerupsOff: 'Desactivadas',
    },
    hud: {
      timer: 'Tiempo',
      lives: 'Vidas',
      safeZone: 'Zona',
      score: 'Puntos',
    },
    death: { youDied: 'Has muerto', spectating: 'Espectando' },
    result: {
      winner: '¡{{name}} gana!',
      tie: 'Empate',
      rematch: 'Revancha',
    },
    status: {
      connecting: 'Conectando…',
      reconnecting: 'Reconectando…',
      slowConnection: 'Conexión lenta',
      getReady: 'Prepárate',
      inPlay: 'En juego',
      roundOver: 'Ronda terminada',
    },
    rules: {
      objective:
        'Sobrevive más que el resto de gusanos. Come la comida brillante para crecer y sumar puntos.',
      gameplay:
        'Tu gusano sigue al cursor: mantén pulsado y dirige. La arena es amplia; el peligro son las estelas de los demás. Chocar con un muro o cualquier cuerpo te mata.',
      survive:
        'Corta a los rivales para que choquen contra tu estela y recoge la comida que sueltan. Mantente al borde del grupo, nunca atrapado en una esquina.',
      powerups:
        'Bonificaciones opcionales: ráfaga de 3 s, escudo de un golpe, encogimiento del 30% o 2 s atravesando estelas.',
    },
  },
};
