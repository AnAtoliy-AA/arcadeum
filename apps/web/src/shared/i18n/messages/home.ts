import type { DeepPartial, Locale } from '../types';

const homeMessagesDefinition = {
  en: {
    kicker: 'The future of board games',
    tagline:
      '{{appName}} is your online platform to play board games with friends.',
    description:
      'Create real-time game rooms, invite your friends, and let {{appName}} handle rules, scoring, and turns so you can focus on the fun.',
    primaryCtaLabel: 'Get started',
    supportCtaLabel: 'Support the developers',
    downloadsTitle: 'Install the mobile builds',
    downloadsDescription:
      'Grab the latest Expo builds for iOS and Android directly from the web app.',
    downloadsIosLabel: 'Download for iOS',
    downloadsAndroidLabel: 'Download for Android',
    // Games section
    gamesTitle: 'Featured Games',
    gamesSubtitle: 'Explore our growing library of tabletop experiences',
    gamePlayButton: 'Play Now',
    gameComingSoon: 'Coming Soon',
    gameIncludesPacks: 'Includes 5 Card Packs:',
    gameThemedDecks: 'Themed Decks:',
    gameAvailableNow: 'Available Now',

    // Features section
    featuresTitle: 'Why {{appName}}?',
    featuresSubtitle:
      'Everything you need to play board games online with friends',
    featureRoomsTitle: 'Real-time Rooms',
    featureRoomsDescription:
      'Create game rooms instantly and start playing with friends in seconds. No downloads required.',
    featureRulesTitle: 'Automated Rules',
    featureRulesDescription:
      'Let the app handle rules, scoring, and turn management so you can focus on the fun.',
    featureCrossplatformTitle: 'Cross-platform',
    featureCrossplatformDescription:
      'Play instantly in your browser on desktop and mobile. Native apps for iOS and Android coming soon.',
    featureInviteTitle: 'Private Rooms & Chat',
    featureInviteDescription:
      'Create secured rooms for your group with integrated chat to banter while you play.',
    featureSpectatorTitle: 'Spectator Mode',
    featureSpectatorDescription:
      'Watch friends play live on web. TV support coming soon.',
    featureStatsTitle: 'Game Statistics',
    featureStatsDescription:
      'Track your win rates, history, and achievements across all games.',
    featureTournamentsTitle: 'Tournaments',
    featureTournamentsDescription:
      'Compete in ranked events and prove your skills against the best players.',
    // How it works section
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Get started in three simple steps',
    stepCreateTitle: 'Create or Join a Room',
    stepCreateDescription:
      'Start a new game room or enter an invite code to join an existing session.',
    stepInviteTitle: 'Invite Your Friends',
    stepInviteDescription:
      'Share the room link or code with friends. They can join from any device instantly.',
    stepPlayTitle: 'Play Together',
    stepPlayDescription:
      'Enjoy board games with {{appName}} handling rules, turns, and scoring automatically.',
    // Coming soon labels
    comingSoon: 'Coming Soon',
    // Footer
    footerFollowUs: 'Follow Us',
    footerCommunity: 'Join the community',
    footerRights: '© {{year}} {{appName}}. All rights reserved.',
  },
  es: {
    kicker: 'Plataforma para juegos de mesa online',
    tagline:
      '{{appName}} es tu plataforma para jugar juegos de mesa online con amigos.',
    description:
      'Crea salas en tiempo real, reúne a tus amigos y deja que {{appName}} automatice reglas, puntuaciones y turnos para que te concentres en la diversión.',
    primaryCtaLabel: 'Comenzar',
    supportCtaLabel: 'Apoyar a los desarrolladores',
    downloadsTitle: 'Instala las apps móviles',
    downloadsDescription:
      'Descarga las últimas compilaciones de Expo para iOS y Android directamente desde la web.',
    downloadsIosLabel: 'Descargar para iOS',
    downloadsAndroidLabel: 'Descargar para Android',
    // Features section
    featuresTitle: '¿Por qué {{appName}}?',
    featuresSubtitle:
      'Todo lo que necesitas para jugar juegos de mesa online con amigos',
    featureRoomsTitle: 'Salas en Tiempo Real',
    featureRoomsDescription:
      'Crea salas de juego al instante y empieza a jugar con amigos en segundos.',
    featureRulesTitle: 'Reglas Automatizadas',
    featureRulesDescription:
      'Deja que la app maneje las reglas, puntuación y turnos para que te concentres en la diversión.',
    featureCrossplatformTitle: 'Multiplataforma',
    featureCrossplatformDescription:
      'Juega en web o móvil. Tus salas se sincronizan perfectamente en todos tus dispositivos.',
    featureInviteTitle: 'Invita a Amigos',
    featureInviteDescription:
      'Comparte códigos de invitación o enlaces para reunir a tus amigos desde cualquier lugar.',
    featureSpectatorTitle: 'Modo Espectador',
    featureSpectatorDescription:
      'Mira a tus amigos jugar en vivo en la web. Soporte para TV próximamente.',
    featureStatsTitle: 'Estadísticas de Juego',
    featureStatsDescription:
      'Sigue tus tasas de victoria, historial y logros en todos los juegos.',
    featureTournamentsTitle: 'Torneos',
    featureTournamentsDescription:
      'Compite en eventos clasificados y demuestra tus habilidades contra los mejores.',
    // Games Section Extras
    gameIncludesPacks: 'Incluye 5 Paquetes de Cartas:',
    gameThemedDecks: 'Mazos Temáticos:',
    gameAvailableNow: 'Disponible Ahora',
    // ... how it works ...
    howItWorksTitle: 'Cómo Funciona',
    howItWorksSubtitle: 'Comienza en tres simples pasos',
    stepCreateTitle: 'Crea o Únete a una Sala',
    stepCreateDescription:
      'Inicia una nueva sala de juego o introduce un código de invitación para unirte a una sesión existente.',
    stepInviteTitle: 'Invita a tus Amigos',
    stepInviteDescription:
      'Comparte el enlace o código de la sala con amigos. Pueden unirse desde cualquier dispositivo al instante.',
    stepPlayTitle: 'Juega Juntos',
    stepPlayDescription:
      'Disfruta de juegos de mesa mientras {{appName}} maneja reglas, turnos y puntuación automáticamente.',
    // Coming soon labels
    comingSoon: 'Próximamente',
    mobileComingSoonDescription:
      'Las apps nativas de iOS y Android para {{appName}} están en desarrollo. ¡Mantente atento!',
  },
  fr: {
    kicker: 'Plateforme pour jeux de société en ligne',
    tagline:
      '{{appName}} est votre plateforme pour jouer aux jeux de société en ligne avec vos amis.',
    description:
      'Créez des salons en temps réel, rassemblez vos amis et laissez {{appName}} automatiser règles, scores et tours pour que vous puissiez vous concentrer sur le plaisir.',
    primaryCtaLabel: 'Commencer',
    supportCtaLabel: 'Soutenir les développeurs',
    downloadsTitle: 'Installer les applications mobiles',
    downloadsDescription:
      'Téléchargez les dernières versions Expo pour iOS et Android directement depuis le web.',
    downloadsIosLabel: 'Télécharger pour iOS',
    downloadsAndroidLabel: 'Télécharger pour Android',
    // Games section
    gamesTitle: 'Jeux en Vedette',
    gamesSubtitle:
      "Explorez notre bibliothèque croissante d'expériences de table",
    gamePlayButton: 'Jouer Maintenant',
    gameComingSoon: 'Bientôt Disponible',
    // Features section
    featuresTitle: 'Pourquoi {{appName}} ?',
    featuresSubtitle:
      'Tout ce dont vous avez besoin pour jouer aux jeux de société en ligne avec vos amis',
    featureRoomsTitle: 'Salons en Temps Réel',
    featureRoomsDescription:
      'Créez des salons de jeu instantanément et commencez à jouer avec vos amis en quelques secondes.',
    featureRulesTitle: 'Règles Automatisées',
    featureRulesDescription:
      "Laissez l'application gérer les règles, les scores et les tours pour vous concentrer sur le plaisir.",
    featureCrossplatformTitle: 'Multiplateforme',
    featureCrossplatformDescription:
      'Jouez instantanément dans votre navigateur sur bureau et mobile. Applications natives pour iOS et Android bientôt disponibles.',
    featureInviteTitle: 'Salons Privés et Chat',
    featureInviteDescription:
      'Créez des salons sécurisés pour votre groupe avec chat intégré pour discuter pendant que vous jouez.',
    featureSpectatorTitle: 'Mode Spectateur',
    featureSpectatorDescription:
      'Regardez vos amis jouer en direct sur le web. Support TV bientôt disponible.',
    featureStatsTitle: 'Statistiques de Jeu',
    featureStatsDescription:
      'Suivez vos taux de victoire, votre historique et vos réalisations dans tous les jeux.',
    featureTournamentsTitle: 'Tournois',
    featureTournamentsDescription:
      'Participez à des événements classés et prouvez vos compétences contre les meilleurs joueurs.',
    // Games Section Extras
    gameIncludesPacks: 'Inclus 5 Paquets de Cartes :',
    gameThemedDecks: 'Decks Thématiques :',
    gameAvailableNow: 'Disponible Maintenant',
    // How it works section
    howItWorksTitle: 'Comment Ça Marche',
    howItWorksSubtitle: 'Commencez en trois étapes simples',
    stepCreateTitle: 'Créez ou Rejoignez un Salon',
    stepCreateDescription:
      "Démarrez un nouveau salon de jeu ou entrez un code d'invitation pour rejoindre une session existante.",
    stepInviteTitle: 'Invitez Vos Amis',
    stepInviteDescription:
      "Partagez le lien ou le code du salon avec vos amis. Ils peuvent rejoindre depuis n'importe quel appareil instantanément.",
    stepPlayTitle: 'Jouez Ensemble',
    stepPlayDescription:
      'Profitez des jeux de société pendant que {{appName}} gère les règles, les tours et les scores automatiquement.',
    // Coming soon labels
    comingSoon: 'Bientôt disponible',
    mobileComingSoonDescription:
      "Les applications natives iOS et Android pour {{appName}} sont en développement. Restez à l'écoute !",
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const homeMessages = homeMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type HomeMessages = DeepPartial<(typeof homeMessagesDefinition)['en']>;
