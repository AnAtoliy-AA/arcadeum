export const esMessages = {
  glimworm_v1: {
    name: 'Glimworm',
    description: 'Una batalla de gusanos brillantes para 2 a 10 jugadores.',
    tagline: 'Mantén pulsado, deslízate, sobrevive.',
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
    },
  },
};
