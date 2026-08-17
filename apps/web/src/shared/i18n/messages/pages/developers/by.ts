import type { developersEn } from './en';

export const developersBy: typeof developersEn = {
  title: 'Платформа для распрацоўшчыкаў Arcadeum',
  subtitle:
    'Стварайце кастамных ботаў, інтэгруйце турніры і трансліруйце матчы ў рэальным часе',
  description:
    'Наша платформа прапануе WebSocket-пратаколы з вельмі нізкай затрымкай, REST API і афіцыйныя SDK на TypeScript і Python.',
  stats: {
    latency: '< 50мс',
    latencyLabel: 'Затрымка WebSocket шлюза',
    rateLimit: '120 зап/хв',
    rateLimitLabel: 'Ліміт бясплатнага тарыфу API',
    uptime: '99.99%',
    uptimeLabel: 'Даступнасць шлюза',
    sdk: 'v1.4',
    sdkLabel: 'SDK для TypeScript і Python',
  },
  sdkHero: {
    title: 'Пішыце на любімай мове',
    subtitle: 'Падключайцеся да гульнявых пакояў менш чым за 10 радкоў коду',
    tabs: {
      typescript: 'TypeScript',
      python: 'Python',
      curl: 'cURL / REST',
      websocket: 'WebSocket',
    },
    copyCode: 'Скапіяваць код',
    copied: 'Скапіявана ў буфер!',
  },
  features: [
    {
      title: 'WebSocket-шлюз рэальнага часу',
      description:
        'Двухнакіраваны пратакол Socket.IO з аўтарытэтнымі пераходамі станаў і пацвярджэннем дзеянняў.',
      icon: '⚡',
    },
    {
      title: 'Фрэймворк AI-ботаў',
      description:
        'Афіцыйны рухавік ботаў на Python і Node.js з мінімакс-алгарытмамі і сімуляцыяй чалавечых паводзін.',
      icon: '🤖',
    },
    {
      title: 'API турніраў і сетак',
      description:
        'Праграмнае стварэнне турніраў на выбыванне або па швейцарскай сістэме і вэбхукі вынікаў.',
      icon: '🏆',
    },
    {
      title: 'Матчмэйкінг і прыватныя пакоі',
      description:
        'Стварэнне пакояў з кастамнымі правіламі, паролямі і запрашэннем гульцоў па прамых спасылках.',
      icon: '🎮',
    },
    {
      title: 'Вэбхукі і паток падзей',
      description:
        'Бяспечныя HTTP POST паведамленні з HMAC-подпісам аб старце матчаў і абнаўленні рэйтынгу.',
      icon: '🔔',
    },
    {
      title: 'Пясочніца для тэсціравання',
      description:
        'Тэсціруйце інтэграцыі з віртуальнымі гульцамі на выдзеленым sandbox-шлюзе.',
      icon: '🛡️',
    },
  ],
  specs: {
    title: 'Спецыфікацыі і эндпоінты платформы',
    subtitle: 'Стандартызаваныя REST і WebSocket архітэктуры',
    authTitle: 'Аўтэнтыфікацыя',
    authDesc:
      'Bearer JWT токен у загалоўку Authorization або параметрах сокета.',
    restBase: 'https://api.arcadeum.net/v1',
    wsEndpoint: 'wss://socket.arcadeum.net',
    sandboxBase: 'https://sandbox.arcadeum.net/v1',
  },
  cta: {
    title: 'Пачніце распрацоўку на Arcadeum',
    description:
      'Вывучыце афіцыйныя рэпазіторыі на GitHub, спампуйце шаблон бота або далучайцеся да Discord супольнасці.',
    githubBtn: 'Рэпазіторыі GitHub',
    discordBtn: 'Discord супольнасць',
  },
};
