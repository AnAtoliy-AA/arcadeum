import { appConfig } from '../../config/app-config';
import type { DeepPartial, Locale } from '../types';

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join('{{appName}}');
}

const settingsMessagesDefinition = {
  en: {
    title: 'Settings',
    description:
      'Manage your appearance, language, and download preferences for the {{appName}} web experience.',
    gameplayTitle: 'Gameplay',
    gameplayDescription: 'Customize your in-game experience.',
    hapticsLabel: 'Haptic Feedback',
    hapticsDescription:
      "Vibrate when it's your turn to play (mobile devices only).",
    appearanceTitle: 'Appearance',
    appearanceDescription:
      'Choose a theme to use across the {{appName}} web experience.',
    themeOptions: {
      system: {
        label: 'Match system appearance',
        description: 'Follow your operating system preference automatically.',
      },
      light: {
        label: 'Light',
        description: 'Bright neutrals with airy surfaces and subtle gradients.',
      },
      dark: {
        label: 'Dark',
        description: 'Contemporary midnight palette ideal for low-light play.',
      },
      neonLight: {
        label: 'Neon Light',
        description:
          'Arcade-inspired glow with luminous panels and neon edges.',
      },
      neonDark: {
        label: 'Neon Dark',
        description:
          'High-contrast vaporwave styling for dramatic game tables.',
      },
    },
    languageTitle: 'Language',
    languageDescription:
      'Interface translations are a work in progress. Save your preference for upcoming updates.',
    languageOptionLabels: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      ru: 'Русский',
      be: 'Беларуская',
    },
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(
      appConfig.downloads.description,
    ),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    accountTitle: 'Account',
    accountDescription:
      'Web sign-in is rolling out soon. In the meantime, manage your subscriptions via the dashboard or continue in the mobile app.',
    accountGuestStatus: 'You are browsing as a guest.',
    accountPrimaryCta: 'Go to sign-in',
    accountSupportCtaLabel: appConfig.supportCta.label,
    blockedUsersTitle: 'Blocked Users',
    blockedUsersDescription:
      'Users you have blocked will not be able to send you game invitations.',
    blockedUsersLoading: 'Loading...',
    blockedUsersEmpty: 'No blocked users',
    blockedUsersUnblock: 'Unblock',
  },
  es: {
    title: 'Configuración',
    description:
      'Administra la apariencia, el idioma y las descargas para la experiencia web de {{appName}}.',
    gameplayTitle: 'Juego',
    gameplayDescription: 'Personaliza tu experiencia de juego.',
    hapticsLabel: 'Respuesta háptica',
    hapticsDescription:
      'Vibrar cuando sea tu turno de jugar (solo dispositivos móviles).',
    appearanceTitle: 'Apariencia',
    appearanceDescription:
      'Elige un tema para usar en toda la experiencia web de {{appName}}.',
    themeOptions: {
      system: {
        label: 'Coincidir con el sistema',
        description:
          'Sigue automáticamente la preferencia de tu sistema operativo.',
      },
      light: {
        label: 'Claro',
        description:
          'Blancos nítidos con degradados sutiles y un cromado luminoso.',
      },
      dark: {
        label: 'Oscuro',
        description:
          'Paleta nocturna perfecta para sesiones en ambientes con poca luz.',
      },
      neonLight: {
        label: 'Neón claro',
        description:
          'Brillo inspirado en arcades con paneles luminosos y bordes neón.',
      },
      neonDark: {
        label: 'Neón oscuro',
        description:
          'Estilo vaporwave de alto contraste para mesas dramáticas.',
      },
    },
    languageTitle: 'Idioma',
    languageDescription:
      'Las traducciones de la interfaz siguen en desarrollo. Guarda tu preferencia para las próximas actualizaciones.',
    languageOptionLabels: {
      en: 'Inglés',
      es: 'Español',
      fr: 'Francés',
      ru: 'Русский',
      be: 'Беларуская',
    },
    downloadsTitle: 'Compilaciones móviles',
    downloadsDescription:
      'Descarga las últimas compilaciones de Expo para mantener los clientes móviles sincronizados con la versión web.',
    downloadsIosLabel: 'Descargar para iOS',
    downloadsAndroidLabel: 'Descargar para Android',
    accountTitle: 'Cuenta',
    accountDescription:
      'El inicio de sesión web llegará pronto. Mientras tanto, administra tus suscripciones en el panel o continúa en la app móvil.',
    accountGuestStatus: 'Estás navegando como invitado.',
    accountPrimaryCta: 'Ir a iniciar sesión',
    accountSupportCtaLabel: 'Apoyar a los desarrolladores',
    blockedUsersTitle: 'Usuarios bloqueados',
    blockedUsersDescription:
      'Los usuarios que hayas bloqueado no podrán enviarte invitaciones de juego.',
    blockedUsersLoading: 'Cargando...',
    blockedUsersEmpty: 'No hay usuarios bloqueados',
    blockedUsersUnblock: 'Desbloquear',
  },
  fr: {
    title: 'Paramètres',
    description:
      "Gérez l'apparence, la langue et les téléchargements pour l'expérience web de {{appName}}.",
    gameplayTitle: 'Jeu',
    gameplayDescription: 'Personnalisez votre expérience de jeu.',
    hapticsLabel: 'Retour haptique',
    hapticsDescription:
      "Vibrer quand c'est à votre tour de jouer (appareils mobiles uniquement).",
    appearanceTitle: 'Apparence',
    appearanceDescription:
      "Choisissez un thème à utiliser sur l'ensemble de l'expérience web de {{appName}}.",
    themeOptions: {
      system: {
        label: 'Suivre le système',
        description:
          "Suit automatiquement la préférence de votre système d'exploitation.",
      },
      light: {
        label: 'Clair',
        description: 'Blancs nets avec dégradés subtils et chrome lumineux.',
      },
      dark: {
        label: 'Sombre',
        description:
          'Palette nocturne idéale pour les sessions dans un environnement peu éclairé.',
      },
      neonLight: {
        label: 'Néon clair',
        description:
          'Éclat inspiré des arcades avec des panneaux lumineux et des bordures néon.',
      },
      neonDark: {
        label: 'Néon sombre',
        description:
          'Style vaporwave à fort contraste pour des tables spectaculaires.',
      },
    },
    languageTitle: 'Langue',
    languageDescription:
      "Les traductions de l'interface sont en cours. Enregistrez votre préférence pour les prochaines mises à jour.",
    languageOptionLabels: {
      en: 'Anglais',
      es: 'Espagnol',
      fr: 'Français',
      ru: 'Русский',
      be: 'Беларуская',
    },
    downloadsTitle: 'Versions mobiles',
    downloadsDescription:
      'Récupérez les dernières versions Expo pour garder les applications mobiles synchronisées avec la version web.',
    downloadsIosLabel: 'Télécharger pour iOS',
    downloadsAndroidLabel: 'Télécharger pour Android',
    accountTitle: 'Compte',
    accountDescription:
      "La connexion web arrive bientôt. En attendant, gérez vos abonnements via le tableau de bord ou continuez dans l'application mobile.",
    accountGuestStatus: "Vous naviguez en tant qu'invité.",
    accountPrimaryCta: 'Aller à la connexion',
    accountSupportCtaLabel: 'Soutenir les développeurs',
    blockedUsersTitle: 'Utilisateurs bloqués',
    blockedUsersDescription:
      "Les utilisateurs que vous avez bloqués ne pourront pas vous envoyer d'invitations à jouer.",
    blockedUsersLoading: 'Chargement...',
    blockedUsersEmpty: 'Aucun utilisateur bloqué',
    blockedUsersUnblock: 'Débloquer',
  },
  ru: {
    title: 'Настройки',
    description:
      'Управляйте внешним видом, языком и загрузками для веб-версии {{appName}}.',
    gameplayTitle: 'Геймплей',
    gameplayDescription: 'Настройте ваш игровой опыт.',
    hapticsLabel: 'Тактильная отдача',
    hapticsDescription:
      'Вибрировать, когда наступает ваш ход (только для мобильных устройств).',
    appearanceTitle: 'Внешний вид',
    appearanceDescription:
      'Выберите тему оформления для веб-версии {{appName}}.',
    themeOptions: {
      system: {
        label: 'Как в системе',
        description:
          'Автоматически следовать настройкам вашей операционной системы.',
      },
      light: {
        label: 'Светлая',
        description: 'Яркие нейтральные тона с легкими градиентами.',
      },
      dark: {
        label: 'Темная',
        description:
          'Современная ночная палитра, идеальная для игры при слабом освещении.',
      },
      neonLight: {
        label: 'Неоновая светлая',
        description: 'Свечение в стиле аркад с люминесцентными панелями.',
      },
      neonDark: {
        label: 'Неоновая темная',
        description:
          'Высококонтрастный стиль vaporwave для эффектных игровых столов.',
      },
    },
    languageTitle: 'Язык',
    languageDescription:
      'Переводы интерфейса находятся в процессе разработки. Сохраните ваш выбор для будущих обновлений.',
    languageOptionLabels: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      ru: 'Русский',
      be: 'Беларуская',
    },
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(
      appConfig.downloads.description,
    ),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    accountTitle: 'Аккаунт',
    accountDescription:
      'Веб-вход скоро появится. Пока что вы можете управлять подписками через панель управления или в мобильном приложении.',
    accountGuestStatus: 'Вы просматриваете как гость.',
    accountPrimaryCta: 'Перейти ко входу',
    accountSupportCtaLabel: appConfig.supportCta.label,
    blockedUsersTitle: 'Заблокированные пользователи',
    blockedUsersDescription:
      'Заблокированные пользователи не смогут присылать вам приглашения в игру.',
    blockedUsersLoading: 'Загрузка...',
    blockedUsersEmpty: 'Нет заблокированных пользователей',
    blockedUsersUnblock: 'Разблокировать',
  },
  be: {
    title: 'Налады',
    description:
      'Кіруйце знешнім выглядам, мовай і загрузкамі для вэб-версіі {{appName}}.',
    gameplayTitle: 'Геймплэй',
    gameplayDescription: 'Наладзьце ваш гульнявы вопыт.',
    hapticsLabel: 'Тактыльная аддача',
    hapticsDescription:
      'Вібраваць, калі наступае ваш ход (толькі для мабільных прылад).',
    appearanceTitle: 'Знешні выгляд',
    appearanceDescription:
      'Выберыце тэму афармлення для вэб-версіі {{appName}}.',
    themeOptions: {
      system: {
        label: 'Як у сістэме',
        description:
          'Аўтаматычна прытрымлівацца налад вашай аперацыйнай сістэмы.',
      },
      light: {
        label: 'Светлая',
        description: 'Яркія нейтральныя тоны з лёгкімі градыентамі.',
      },
      dark: {
        label: 'Цёмная',
        description:
          'Сучасная начная палітра, ідэальная для гульні пры слабым асвятленні.',
      },
      neonLight: {
        label: 'Неонавая светлая',
        description: 'Свячэнне ў стылі аркад з люмінесцэнтнымі панэлямі.',
      },
      neonDark: {
        label: 'Неонавая цёмная',
        description:
          'Высакакантрастны стыль vaporwave для эфектных гульнявых сталоў.',
      },
    },
    languageTitle: 'Мова',
    languageDescription:
      'Пераклады інтэрфейсу знаходзяцца ў працэсе распрацоўкі. Захавайце ваш выбар для будучых абнаўленняў.',
    languageOptionLabels: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      ru: 'Русский',
      be: 'Беларуская',
    },
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(
      appConfig.downloads.description,
    ),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    accountTitle: 'Акаўнт',
    accountDescription:
      'Вэб-ўваход хутка з’явіцца. Пакуль што вы можаце кіраваць падпіскамі праз панэль кіравання або ў мабільным прыкладанні.',
    accountGuestStatus: 'Вы праглядаеце як госць.',
    accountPrimaryCta: 'Перайсці да ўваходу',
    accountSupportCtaLabel: appConfig.supportCta.label,
    blockedUsersTitle: 'Заблакаваныя карыстальнікі',
    blockedUsersDescription:
      'Заблакаваныя карыстальнікі не змогуць дасылаць вам запрашэнні ў гульню.',
    blockedUsersLoading: 'Загрузка...',
    blockedUsersEmpty: 'Няма заблакаваных карыстальнікаў',
    blockedUsersUnblock: 'Разблакаваць',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const settingsMessages = settingsMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type SettingsMessages = DeepPartial<
  (typeof settingsMessagesDefinition)['en']
>;
