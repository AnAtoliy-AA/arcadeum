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
  ru: {
    kicker: 'Будущее настольных игр',
    tagline:
      '{{appName}} — ваша онлайн-платформа для игры в настолки с друзьями.',
    description:
      'Создавайте игровые комнаты в реальном времени, приглашайте друзей, а {{appName}} возьмет на себя правила, подсчет очков и очередность ходов, чтобы вы могли сосредоточиться на веселье.',
    primaryCtaLabel: 'Начать',
    supportCtaLabel: 'Поддержать разработчиков',
    downloadsTitle: 'Установите мобильные сборки',
    downloadsDescription:
      'Загрузите последние сборки Expo для iOS и Android прямо из веб-приложения.',
    downloadsIosLabel: 'Скачать для iOS',
    downloadsAndroidLabel: 'Скачать для Android',
    // Games section
    gamesTitle: 'Популярные игры',
    gamesSubtitle: 'Исследуйте нашу растущую библиотеку настольных развлечений',
    gamePlayButton: 'Играть сейчас',
    gameComingSoon: 'Скоро',
    gameIncludesPacks: 'Включает 5 наборов карт:',
    gameThemedDecks: 'Тематические колоды:',
    gameAvailableNow: 'Доступно сейчас',

    // Features section
    featuresTitle: 'Почему {{appName}}?',
    featuresSubtitle: 'Все, что нужно для игры в настолки онлайн с друзьями',
    featureRoomsTitle: 'Комнаты в реальном времени',
    featureRoomsDescription:
      'Создавайте игровые комнаты мгновенно и начинайте играть с друзьями за секунды. Загрузка не требуется.',
    featureRulesTitle: 'Автоматизированные правила',
    featureRulesDescription:
      'Пусть приложение берет на себя правила, очки и управление ходами, пока вы наслаждаетесь игрой.',
    featureCrossplatformTitle: 'Кроссплатформенность',
    featureCrossplatformDescription:
      'Играйте мгновенно в браузере на ПК и мобильных устройствах. Нативные приложения для iOS и Android скоро появятся.',
    featureInviteTitle: 'Приватные комнаты и чат',
    featureInviteDescription:
      'Создавайте защищенные комнаты для своей группы со встроенным чатом для общения во время игры.',
    featureSpectatorTitle: 'Режим зрителя',
    featureSpectatorDescription:
      'Смотрите, как друзья играют в прямом эфире на вебе. Поддержка ТВ скоро появится.',
    featureStatsTitle: 'Статистика игры',
    featureStatsDescription:
      'Отслеживайте процент побед, историю и достижения во всех играх.',
    featureTournamentsTitle: 'Турниры',
    featureTournamentsDescription:
      'Участвуйте в рейтинговых событиях и докажите свое мастерство против лучших игроков.',
    // How it works section
    howItWorksTitle: 'Как это работает',
    howItWorksSubtitle: 'Начните за три простых шага',
    stepCreateTitle: 'Создайте или войдите в комнату',
    stepCreateDescription:
      'Начните новую игровую комнату или введите код приглашения, чтобы присоединиться к существующей сессии.',
    stepInviteTitle: 'Пригласите друзей',
    stepInviteDescription:
      'Поделитесь ссылкой на комнату или кодом с друзьями. Они могут присоединиться с любого устройства мгновенно.',
    stepPlayTitle: 'Играйте вместе',
    stepPlayDescription:
      'Наслаждайтесь настольными играми, пока {{appName}} автоматически управляет правилами, ходами и очками.',
    // Coming soon labels
    comingSoon: 'Скоро',
    // Footer
    footerFollowUs: 'Подпишитесь на нас',
    footerCommunity: 'Присоединяйтесь к сообществу',
    footerRights: '© {{year}} {{appName}}. Все права защищены.',
  },
  be: {
    kicker: 'Будучыня настольных гульняў',
    tagline:
      '{{appName}} — ваша онлайн-платформа для гульні ў настолкі з сябрамі.',
    description:
      'Стварайце гульнявыя пакоі ў рэальным часе, запрашайце сяброў, а {{appName}} возьме на сябе правілы, падлік ачкоў і чарговасць хадоў, каб вы маглі засяродзіцца на весялосці.',
    primaryCtaLabel: 'Пачаць',
    supportCtaLabel: 'Падрымаць распрацоўшчыкаў',
    downloadsTitle: 'Усталюйце мабільныя зборкі',
    downloadsDescription:
      'Загрузіце апошнія зборкі Expo для iOS і Android прама з вэб-прыкладання.',
    downloadsIosLabel: 'Спампаваць для iOS',
    downloadsAndroidLabel: 'Спампаваць для Android',
    // Games section
    gamesTitle: 'Папулярныя гульні',
    gamesSubtitle: 'Даследуйце нашу бібліятэку настольных забаў, якая расце',
    gamePlayButton: 'Гуляць зараз',
    gameComingSoon: 'Хутка',
    gameIncludesPacks: 'Уключае 5 набораў карт:',
    gameThemedDecks: 'Тэматычныя калоды:',
    gameAvailableNow: 'Даступна зараз',

    // Features section
    featuresTitle: 'Чаму {{appName}}?',
    featuresSubtitle: 'Усё, што трэба для гульні ў настолкі онлайн з сябрамі',
    featureRoomsTitle: 'Пакоі ў рэальным часе',
    featureRoomsDescription:
      'Стварайце гульнявыя пакоі імгненна і пачынайце гуляць з сябрамі за секунды. Загрузка не патрабуецца.',
    featureRulesTitle: 'Аўтаматызаваныя правілы',
    featureRulesDescription:
      'Няхай прыкладанне бярэ на сябе правілы, ачкі і кіраванне хадамі, пакуль вы атрымліваеце асалоду ад гульні.',
    featureCrossplatformTitle: 'Кроссплатформавасць',
    featureCrossplatformDescription:
      'Гуляйце імгненна ў браўзеры на ПК і мабільных прыладах. Натыўныя прыкладанні для iOS і Android хутка з’явяцца.',
    featureInviteTitle: 'Прыватныя пакоі і чат',
    featureInviteDescription:
      'Стварайце абароненыя пакоі для сваёй групы з убудаваным чатам для камунікацыі падчас гульні.',
    featureSpectatorTitle: 'Рэжым гледача',
    featureSpectatorDescription:
      'Глядзіце, як сябры гуляюць у прамым эфіры на вэбе. Падтрымка ТБ хутка з’явіцца.',
    featureStatsTitle: 'Статыстыка гульні',
    featureStatsDescription:
      'Сачыце за працэнтам перамог, гісторыяй і дасягненнямі ва ўсіх гульнях.',
    featureTournamentsTitle: 'Турніры',
    featureTournamentsDescription:
      'Удзельнічайце ў рэйтынгавых падзеях і дакажыце сваё майстэрства супраць лепшых гульцоў.',
    // How it works section
    howItWorksTitle: 'Як гэта працуе',
    howItWorksSubtitle: 'Пачніце за тры простыя крокі',
    stepCreateTitle: 'Стварыце або ўвайдзіце ў пакой',
    stepCreateDescription:
      'Пачніце новы гульнявы пакой або ўвядзіце код запрашэння, каб далучыцца да існуючай сесіі.',
    stepInviteTitle: 'Запрасіце сяброў',
    stepInviteDescription:
      'Падзяліцеся спасылкай на пакой або кодам з сябрамі. Яны могуць далучыцца з любой прылады імгненна.',
    stepPlayTitle: 'Гуляйце разам',
    stepPlayDescription:
      'Атрымлівайце асалоду ад настольных гульняў, пакуль {{appName}} аўтаматычна кіруе правіламі, хадамі і ачкамі.',
    // Coming soon labels
    comingSoon: 'Хутка',
    // Footer
    footerFollowUs: 'Падпішыцеся на нас',
    footerCommunity: 'Далучайцеся да супольнасці',
    footerRights: '© {{year}} {{appName}}. Усе правы абаронены.',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const homeMessages = homeMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type HomeMessages = DeepPartial<(typeof homeMessagesDefinition)['en']>;
