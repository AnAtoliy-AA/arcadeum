export const ruMessages = {
  glimworm_v1: {
    name: 'Глимворм',
    description: 'Светящаяся битва червей для 2–10 игроков.',
    tagline: 'Зажми палец, скользи, выживи.',
    variant: {
      battleRoyale: {
        name: 'Королевская битва',
        description: 'Последний выживший червь побеждает. Арена сжимается.',
      },
      timeAttack: {
        name: 'На время',
        description:
          '90 секунд. Побеждает с наибольшим счётом. Никто не выбывает.',
      },
      livesHeats: {
        name: 'Жизни и заезды',
        description: 'Три жизни у каждого. Побеждает последний с жизнями.',
      },
    },
    powerup: {
      speed: { name: 'Ускорение', tip: '3 секунды спринта.' },
      shield: { name: 'Щит', tip: 'Поглощает один удар.' },
      shrink: { name: 'Сжатие', tip: 'Сбрось 30% длины, чтобы убежать.' },
      ghost: { name: 'Призрак', tip: '2 секунды сквозь хвосты.' },
    },
    lobby: {
      pickColor: 'Выберите цвет червя',
      fillWithBots: 'Заполнить ботами',
      waitingForPlayers: 'Ожидание минимум 2 червей…',
      variant: 'Режим',
      powerups: 'Усиления',
      powerupsOn: 'Вкл',
      powerupsOff: 'Выкл',
    },
    hud: {
      timer: 'Время',
      lives: 'Жизни',
      safeZone: 'Зона',
      score: 'Счёт',
    },
    death: { youDied: 'Вы погибли', spectating: 'Наблюдение' },
    result: {
      winner: 'Победил {{name}}!',
      tie: 'Ничья',
      rematch: 'Реванш',
    },
    status: {
      connecting: 'Подключение…',
      reconnecting: 'Переподключение…',
      slowConnection: 'Медленное соединение',
    },
  },
};
