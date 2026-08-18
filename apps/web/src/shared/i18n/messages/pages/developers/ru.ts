import type { developersEn } from './en';

export const developersRu: typeof developersEn = {
  title: 'Платформа для разработчиков Arcadeum',
  subtitle:
    'Создавайте кастомных ботов, интегрируйте турниры и транслируйте матчи в реальном времени',
  description:
    'Наша платформа предоставляет WebSocket-протоколы с ультранизкой задержкой, REST API и официальные SDK на TypeScript и Python для создания ботов, игр и турнирных оверлеев.',
  stats: {
    latency: '< 50мс',
    latencyLabel: 'Задержка WebSocket',
    rateLimit: '100 зап/мин',
    rateLimitLabel: 'Лимит на IP',
    uptime: '99.99%',
    uptimeLabel: 'Аптайм платформы',
    sdk: 'REST & WS',
    sdkLabel: 'Шлюзы протоколов',
  },
  sdkHero: {
    title: 'Пишите на любимом языке',
    subtitle: 'Подключайтесь к игровым комнатам менее чем за 10 строк кода',
    tabs: {
      typescript: 'TypeScript',
      python: 'Python',
      curl: 'cURL / REST',
      websocket: 'WebSocket',
    },
    copyCode: 'Скопировать код',
    copied: 'Скопировано в буфер!',
  },
  features: [
    {
      title: 'WebSocket-шлюз реального времени',
      description:
        'Двунаправленный протокол Socket.IO с авторитетными переходами состояний, подтверждением ходов и таймерами.',
      icon: '⚡',
    },
    {
      title: 'Фреймворк AI-ботов',
      description:
        'Официальный движок ботов на Python и Node.js с парсерами состояний, минимакс-алгоритмами и симуляцией задержек человека.',
      icon: '🤖',
    },
    {
      title: 'API турниров и сеток',
      description:
        'Программное создание турниров на выбывание или по швейцарской системе, регистрация участников и вебхуки результатов.',
      icon: '🏆',
    },
    {
      title: 'Матчмейкинг и приватные комнаты',
      description:
        'Создание комнат с кастомными правилами, паролями и приглашением игроков по прямым ссылкам.',
      icon: '🎮',
    },
    {
      title: 'Вебхуки и поток событий',
      description:
        'Безопасные HTTP POST уведомления с HMAC-подписью о старте матчей, завершении игр и обновлении рейтинга.',
      icon: '🔔',
    },
    {
      title: 'Песочница для тестирования',
      description:
        'Тестируйте интеграции с виртуальными игроками и тестовыми кошельками на выделенном sandbox-шлюзе.',
      icon: '🛡️',
    },
  ],
  specs: {
    title: 'Спецификации и эндпоинты платформы',
    subtitle: 'Стандартизированные REST и WebSocket архитектуры',
    authTitle: 'Аутентификация',
    authDesc:
      'Bearer JWT токен в заголовке Authorization или параметрах хэндшейка сокета.',
    restBase: 'https://api.arcadeum.net/v1',
    wsEndpoint: 'wss://socket.arcadeum.net',
    sandboxBase: 'https://sandbox.arcadeum.net/v1',
  },
  cta: {
    title: 'Начните разработку на Arcadeum',
    description:
      'Изучите официальные репозитории на GitHub, скачайте шаблон бота или присоединяйтесь к чату разработчиков в Discord.',
    githubBtn: 'Репозитории GitHub',
    discordBtn: 'Discord сообщество',
  },
};
