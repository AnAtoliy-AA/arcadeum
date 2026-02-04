import { appConfig } from '../../config/app-config';
import type { DeepPartial, Locale } from '../types';

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join('{{appName}}');
}

const authMessagesDefinition = {
  en: {
    badge: 'Early access',
    title: 'Sign in to {{appName}}',
    description:
      "We're inviting creators in waves while we finish rolling out secure sign-in for {{appName}}.",
    statusHeadline: 'Web sign-in is rolling out soon.',
    statusDescription:
      "Request early access and we'll notify you when your account is ready, or continue on mobile today.",
    primaryCtaLabel: 'Contact the team',
    secondaryCtaLabel: appConfig.primaryCta.label,
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(
      appConfig.downloads.description,
    ),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    homeLinkLabel: 'Back to home',
    shortcuts: {
      browseGames: 'Browse games without signing in',
    },
    sections: {
      local: 'Email sign-in',
      oauth: 'Google sign-in',
      status: 'Session status',
    },
    providers: {
      guest: 'Guest',
      local: 'Email',
      oauth: 'Google',
    },
    statuses: {
      processing: 'Processing...',
      redirecting: 'Redirecting...',
      loadingSession: 'Loading session...',
    },
    local: {
      loginTitle: 'Sign in with email',
      registerTitle: 'Create an email account',
      helper: {
        allowedCharacters:
          'Usernames can include letters, numbers, underscores, and hyphens.',
      },
      errors: {
        passwordMismatch: 'Passwords do not match.',
        usernameTooShort: 'Username must be at least 3 characters.',
        invalidEmail: 'Please enter a valid email address.',
      },
    },
    oauth: {
      title: 'Continue with Google',
      loginButton: 'Continue with Google',
      logoutButton: 'Disconnect Google',
      accessTokenLabel: 'Google access token',
      authorizationCodeLabel: 'Authorization code',
    },
    statusCard: {
      heading: 'Current session',
      description:
        "Manage your {{appName}} web session, review the linked identity, and disconnect when you're done.",
      sessionActive: 'You are signed in on the web.',
      signOutLabel: 'Sign out',
      guestDescription:
        'Your {{appName}} web session details will appear here once you sign in.',
      details: {
        provider: 'Provider',
        displayName: 'Display name',
        userId: 'User ID',
        accessExpires: 'Access expires',
        refreshExpires: 'Refresh expires',
        updated: 'Updated',
        sessionAccessToken: 'Session access token',
        refreshToken: 'Refresh token',
      },
    },
  },
  es: {
    badge: 'Acceso anticipado',
    title: 'Inicia sesión en {{appName}}',
    description:
      'Estamos invitando a creadores por etapas mientras finalizamos el lanzamiento del inicio de sesión seguro de {{appName}}.',
    statusHeadline: 'El inicio de sesión web llegará pronto.',
    statusDescription:
      'Solicita acceso temprano y te avisaremos cuando tu cuenta esté lista, o continúa en móvil hoy mismo.',
    primaryCtaLabel: 'Contactar al equipo',
    secondaryCtaLabel: appConfig.primaryCta.label,
    downloadsTitle: 'Compilaciones móviles',
    downloadsDescription:
      'Descarga las últimas compilaciones de Expo para mantener los clientes móviles sincronizados con la versión web.',
    downloadsIosLabel: 'Descargar para iOS',
    downloadsAndroidLabel: 'Descargar para Android',
    homeLinkLabel: 'Volver al inicio',
    shortcuts: {
      browseGames: 'Explorar juegos sin iniciar sesión',
    },
    sections: {
      local: 'Inicio de sesión con correo',
      oauth: 'Google',
      status: 'Estado de la sesión',
    },
    providers: {
      guest: 'Invitado',
      local: 'Correo electrónico',
      oauth: 'Google',
    },
    statuses: {
      processing: 'Procesando...',
      redirecting: 'Redirigiendo...',
      loadingSession: 'Cargando sesión...',
    },
    local: {
      loginTitle: 'Inicia sesión con correo electrónico',
      registerTitle: 'Crea una cuenta con correo',
      helper: {
        allowedCharacters:
          'Caracteres permitidos: letras, números, guiones bajos y guiones.',
      },
      errors: {
        passwordMismatch: 'Las contraseñas no coinciden.',
        usernameTooShort:
          'El nombre de usuario debe tener al menos 3 caracteres.',
        invalidEmail: 'Por favor, introduce una dirección de correo válida.',
      },
    },
    oauth: {
      title: 'Continuar con Google',
      loginButton: 'Continuar con Google',
      logoutButton: 'Desconectar Google',
      accessTokenLabel: 'Token de acceso de Google',
      authorizationCodeLabel: 'Código de autorización',
    },
    statusCard: {
      heading: 'Sesión actual',
      description:
        'Administra tu sesión web de {{appName}}, revisa la identidad vinculada y desconéctate cuando termines.',
      sessionActive: 'Has iniciado sesión en la web.',
      signOutLabel: 'Cerrar sesión',
      guestDescription:
        'Los detalles de tu sesión web de {{appName}} aparecerán aquí cuando inicies sesión.',
      details: {
        provider: 'Proveedor',
        displayName: 'Nombre visible',
        userId: 'ID de usuario',
        accessExpires: 'Vencimiento del acceso',
        refreshExpires: 'Vencimiento del token de actualización',
        updated: 'Actualizado',
        sessionAccessToken: 'Token de acceso de la sesión',
        refreshToken: 'Token de actualización',
      },
    },
  },
  fr: {
    badge: 'Accès anticipé',
    title: 'Connectez-vous à {{appName}}',
    description:
      "Nous ouvrons progressivement l'accès aux créateurs pendant que nous finalisons le déploiement de la connexion sécurisée pour {{appName}}.",
    statusHeadline: 'La connexion web arrive bientôt.',
    statusDescription:
      "Demandez un accès anticipé et nous vous préviendrons quand votre compte sera prêt, ou continuez sur mobile dès aujourd'hui.",
    primaryCtaLabel: "Contacter l'équipe",
    secondaryCtaLabel: appConfig.primaryCta.label,
    downloadsTitle: 'Versions mobiles',
    downloadsDescription:
      'Récupérez les dernières versions Expo pour garder les applications mobiles synchronisées avec la version web.',
    downloadsIosLabel: 'Télécharger pour iOS',
    downloadsAndroidLabel: 'Télécharger pour Android',
    homeLinkLabel: "Retour à l'accueil",
    shortcuts: {
      browseGames: 'Explorer les jeux sans se connecter',
    },
    sections: {
      local: 'Connexion par e-mail',
      oauth: 'Connexion Google',
      status: 'Statut de session',
    },
    providers: {
      guest: 'Invité',
      local: 'E-mail',
      oauth: 'Google',
    },
    statuses: {
      processing: 'Traitement...',
      redirecting: 'Redirection...',
      loadingSession: 'Chargement de la session...',
    },
    local: {
      loginTitle: 'Se connecter avec un e-mail',
      registerTitle: 'Créer un compte par e-mail',
      helper: {
        allowedCharacters:
          'Caractères autorisés : lettres, chiffres, underscores et tirets.',
      },
      errors: {
        passwordMismatch: 'Les mots de passe ne correspondent pas.',
        usernameTooShort:
          "Le nom d'utilisateur doit comporter au moins 3 caractères.",
        invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
      },
    },
    oauth: {
      title: 'Continuer avec Google',
      loginButton: 'Continuer avec Google',
      logoutButton: 'Déconnecter Google',
      accessTokenLabel: "Jeton d'accès Google",
      authorizationCodeLabel: "Code d'autorisation",
    },
    statusCard: {
      heading: 'Session actuelle',
      description:
        "Gérez votre session web {{appName}}, vérifiez l'identité associée et déconnectez-vous quand vous avez terminé.",
      sessionActive: 'Vous êtes connecté sur le web.',
      signOutLabel: 'Se déconnecter',
      guestDescription:
        'Les détails de votre session web {{appName}} apparaîtreont ici une fois connecté.',
      details: {
        provider: 'Fournisseur',
        displayName: 'Nom affiché',
        userId: 'ID utilisateur',
        accessExpires: "Expiration de l'accès",
        refreshExpires: "Expiration du jeton d'actualisation",
        updated: 'Mis à jour',
        sessionAccessToken: "Jeton d'accès de session",
        refreshToken: "Jeton d'actualisation",
      },
    },
  },
  ru: {
    badge: 'Ранний доступ',
    title: 'Войдите в {{appName}}',
    description:
      'Мы приглашаем создателей волнами, пока завершаем внедрение безопасного входа в {{appName}}.',
    statusHeadline: 'Веб-вход скоро появится.',
    statusDescription:
      'Запросите ранний доступ, и мы сообщим вам, когда ваш аккаунт будет готов, или продолжайте в мобильном приложении сегодня.',
    primaryCtaLabel: 'Связаться с командой',
    secondaryCtaLabel: appConfig.primaryCta.label,
    downloadsTitle: 'Мобильные сборки',
    downloadsDescription:
      'Загрузите последние сборки Expo, чтобы синхронизировать мобильные клиенты с веб-версией.',
    downloadsIosLabel: 'Скачать для iOS',
    downloadsAndroidLabel: 'Скачать для Android',
    homeLinkLabel: 'Вернуться на главную',
    shortcuts: {
      browseGames: 'Просмотр игр без входа',
    },
    sections: {
      local: 'Вход по почте',
      oauth: 'Вход через Google',
      status: 'Статус сессии',
    },
    providers: {
      guest: 'Гость',
      local: 'Email',
      oauth: 'Google',
    },
    statuses: {
      processing: 'Обработка...',
      redirecting: 'Перенаправление...',
      loadingSession: 'Загрузка сессии...',
    },
    local: {
      loginTitle: 'Войти через email',
      registerTitle: 'Создать аккаунт через email',
      helper: {
        allowedCharacters:
          'Имя пользователя может содержать буквы, цифры, подчеркивания и дефисы.',
      },
      errors: {
        passwordMismatch: 'Пароли не совпадают.',
        usernameTooShort: 'Имя пользователя должно быть не менее 3 символов.',
        invalidEmail: 'Пожалуйста, введите корректный адрес электронной почты.',
      },
    },
    oauth: {
      title: 'Продолжить с Google',
      loginButton: 'Продолжить с Google',
      logoutButton: 'Отключить Google',
      accessTokenLabel: 'Google access token',
      authorizationCodeLabel: 'Код авторизации',
    },
    statusCard: {
      heading: 'Текущая сессия',
      description:
        'Управляйте вашей веб-сессией {{appName}}, проверяйте связанный профиль и выходите, когда закончите.',
      sessionActive: 'Вы вошли в систему через веб.',
      signOutLabel: 'Выйти',
      guestDescription:
        'Детали вашей веб-сессии {{appName}} появятся здесь после входа.',
      details: {
        provider: 'Провайдер',
        displayName: 'Отображаемое имя',
        userId: 'ID пользователя',
        accessExpires: 'Доступ истекает',
        refreshExpires: 'Обновление истекает',
        updated: 'Обновлено',
        sessionAccessToken: 'AccessToken сессии',
        refreshToken: 'RefreshToken',
      },
    },
  },
  be: {
    badge: 'Ранні доступ',
    title: 'Увайдзіце ў {{appName}}',
    description:
      'Мы запрашаем стваральнікаў хвалямі, пакуль завяршаем укараненне бяспечнага ўваходу ў {{appName}}.',
    statusHeadline: 'Вэб-ўваход хутка з’явіцца.',
    statusDescription:
      'Запытайце ранні доступ, і мы паведамім вам, калі ваш акаўнт будзе гатовы, ці працягвайце ў мабільным прыкладанні сёння.',
    primaryCtaLabel: 'Звязацца з камандай',
    secondaryCtaLabel: appConfig.primaryCta.label,
    downloadsTitle: 'Мабільныя зборкі',
    downloadsDescription:
      'Загрузіце апошнія зборкі Expo, каб сінхранізаваць мабільныя кліенты з вэб-версіяй.',
    downloadsIosLabel: 'Спампаваць для iOS',
    downloadsAndroidLabel: 'Спампаваць для Android',
    homeLinkLabel: 'Вярнуцца на галоўную',
    shortcuts: {
      browseGames: 'Прагляд гульняў без уваходу',
    },
    sections: {
      local: 'Уваход праз пошту',
      oauth: 'Уваход праз Google',
      status: 'Статус сесіі',
    },
    providers: {
      guest: 'Госць',
      local: 'Email',
      oauth: 'Google',
    },
    statuses: {
      processing: 'Апрацоўка...',
      redirecting: 'Перанакіраванне...',
      loadingSession: 'Загрузка сесіі...',
    },
    local: {
      loginTitle: 'Увайсці праз email',
      registerTitle: 'Стварыць акаўнт праз email',
      helper: {
        allowedCharacters:
          'Імя карыстальніка можа ўтрымліваць літары, лічбы, падкрэсліванні і дэфісы.',
      },
      errors: {
        passwordMismatch: 'Паролі не супадаюць.',
        usernameTooShort:
          'Імя карыстальніка павінна быць не менш за 3 сімвалы.',
        invalidEmail: 'Калі ласка, увядзіце карэктны адрас электроннай пошты.',
      },
    },
    oauth: {
      title: 'Працягнуць з Google',
      loginButton: 'Працягнуць з Google',
      logoutButton: 'Адключыць Google',
      accessTokenLabel: 'Google access token',
      authorizationCodeLabel: 'Код аўтарызацыі',
    },
    statusCard: {
      heading: 'Бягучая сесія',
      description:
        'Кіруйце вашай вэб-сесіяй {{appName}}, правярайце звязаны профіль і выходзьце, калі скончыце.',
      sessionActive: 'Вы ўвайшлі ў сістэму праз вэб.',
      signOutLabel: 'Выйсці',
      guestDescription:
        'Дэталі вашай вэб-сесіі {{appName}} з’явяцца тут пасля ўваходу.',
      details: {
        provider: 'Правайдэр',
        displayName: 'Імя, якое адлюстроўваецца',
        userId: 'ID карыстальніка',
        accessExpires: 'Доступ заканчваецца',
        refreshExpires: 'Абнаўленне заканчваецца',
        updated: 'Абноўлена',
        sessionAccessToken: 'AccessToken сесіі',
        refreshToken: 'RefreshToken',
      },
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const authMessages = authMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type AuthMessages = DeepPartial<(typeof authMessagesDefinition)['en']>;
