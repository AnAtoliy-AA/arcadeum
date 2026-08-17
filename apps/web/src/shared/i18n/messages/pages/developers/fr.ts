import type { developersEn } from './en';

export const developersFr: typeof developersEn = {
  title: 'Plateforme Développeurs Arcadeum',
  subtitle:
    'Créez des bots, intégrez des tournois et diffusez des parties de jeux de société en direct',
  description:
    'Notre plateforme propose des protocoles WebSocket à très faible latence, des API REST et des SDK officiels en TypeScript et Python.',
  stats: {
    latency: '< 50ms',
    latencyLabel: 'Latence WebSocket Globale',
    rateLimit: '120 req/min',
    rateLimitLabel: 'Limite API Gratuite',
    uptime: '99.99%',
    uptimeLabel: 'Disponibilité Gateway',
    sdk: 'v1.4',
    sdkLabel: 'SDK TypeScript & Python',
  },
  sdkHero: {
    title: 'Développez dans votre Langage Préféré',
    subtitle: 'Connectez-vous aux salons de jeu en moins de 10 lignes de code',
    tabs: {
      typescript: 'TypeScript',
      python: 'Python',
      curl: 'cURL / REST',
      websocket: 'WebSocket',
    },
    copyCode: 'Copier le Code',
    copied: 'Copié dans le Presse-papier !',
  },
  features: [
    {
      title: 'Passerelle WebSocket Temps Réel',
      description:
        'Protocole Socket.IO bidirectionnel avec transitions d’état autoritaires et confirmations d’actions.',
      icon: '⚡',
    },
    {
      title: 'Moteur de Bots IA',
      description:
        'Moteur officiel Python et Node.js avec algorithmes minimax et simulation de délais humains.',
      icon: '🤖',
    },
    {
      title: 'API Tournois et Arbres de Matchs',
      description:
        'Génération automatique de tournois à élimination directe ou système suisse et webhooks de résultats.',
      icon: '🏆',
    },
    {
      title: 'Matchmaking et Salons Privés',
      description:
        'Créez des salons avec règles personnalisées, mots de passe et invitations par liens directs.',
      icon: '🎮',
    },
    {
      title: 'Webhooks et Flux d’Événements',
      description:
        'Réception d’appels HTTP POST signés HMAC pour les débuts et fins de parties et classements.',
      icon: '🔔',
    },
    {
      title: 'Environnement Bac à Sable',
      description:
        'Testez vos intégrations avec des joueurs virtuels sur notre environnement sandbox dédié.',
      icon: '🛡️',
    },
  ],
  specs: {
    title: 'Spécifications et Points de Terminaison',
    subtitle: 'Architectures REST et WebSocket conformes aux standards',
    authTitle: 'Authentification',
    authDesc:
      'Jeton Bearer JWT dans l’en-tête Authorization ou lors du handshake WebSocket.',
    restBase: 'https://api.arcadeum.net/v1',
    wsEndpoint: 'wss://socket.arcadeum.net',
    sandboxBase: 'https://sandbox.arcadeum.net/v1',
  },
  cta: {
    title: 'Commencez à Créer sur Arcadeum',
    description:
      'Découvrez nos dépôts GitHub officiels, téléchargez le modèle de bot ou échangez sur notre Discord.',
    githubBtn: 'Dépôts GitHub',
    discordBtn: 'Rejoindre Discord',
  },
};
