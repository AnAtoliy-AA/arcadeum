export const developersEn = {
  title: 'Arcadeum Developer Platform',
  subtitle:
    'Build custom bots, integrate tournaments, and stream live board game matches',
  description:
    'Our developer platform provides low-latency WebSocket protocols, REST APIs, and official open-source SDKs in TypeScript and Python to build games, AI agents, and tournament overlays.',
  stats: {
    latency: '< 50ms',
    latencyLabel: 'Global WebSocket Latency',
    rateLimit: '120 req/min',
    rateLimitLabel: 'Free Tier API Limits',
    uptime: '99.99%',
    uptimeLabel: 'Gateway Availability',
    sdk: 'v1.4',
    sdkLabel: 'TypeScript & Python SDKs',
  },
  sdkHero: {
    title: 'Code in Your Language of Choice',
    subtitle: 'Connect to live game rooms in less than 10 lines of code',
    tabs: {
      typescript: 'TypeScript',
      python: 'Python',
      curl: 'cURL / REST',
      websocket: 'WebSocket',
    },
    copyCode: 'Copy Snippet',
    copied: 'Copied to Clipboard!',
  },
  features: [
    {
      title: 'Realtime WebSocket Gateway',
      description:
        'Bi-directional Socket.IO protocol emitting authoritative state transitions, action confirmations, and timer heartbeats.',
      icon: '⚡',
    },
    {
      title: 'Autonomous AI Bot Framework',
      description:
        'Official Python & Node.js game bot engine with state parsers, minimax algorithms, and simulated human reaction delays.',
      icon: '🤖',
    },
    {
      title: 'Tournaments & Brackets API',
      description:
        'Programmatically spin up single-elimination or Swiss tournaments, register players, and listen for match outcome webhooks.',
      icon: '🏆',
    },
    {
      title: 'Matchmaking & Custom Rooms',
      description:
        'Create private rooms with custom rule variants, assign passwords, and invite players via instant deep links.',
      icon: '🎮',
    },
    {
      title: 'Webhooks & Event Stream',
      description:
        'Receive secure HMAC-signed HTTP POST callbacks for match start, game completion, rating updates, and tournament finishes.',
      icon: '🔔',
    },
    {
      title: 'Full Sandboxed Environment',
      description:
        'Test your integrations with mock players and test wallets on our dedicated sandbox gateway before releasing to production.',
      icon: '🛡️',
    },
  ],
  specs: {
    title: 'Platform Specs & Endpoints',
    subtitle: 'Standards-compliant REST and real-time socket architectures',
    authTitle: 'Authentication',
    authDesc:
      'Bearer JWT token passed in Authorization header or socket handshake auth.',
    restBase: 'https://api.arcadeum.net/v1',
    wsEndpoint: 'wss://socket.arcadeum.net',
    sandboxBase: 'https://sandbox.arcadeum.net/v1',
  },
  cta: {
    title: 'Start Building on Arcadeum',
    description:
      'Check out the official GitHub repositories, download the bot starter kit, or discuss with developers on Discord.',
    githubBtn: 'GitHub Repositories',
    discordBtn: 'Join Discord',
  },
};
