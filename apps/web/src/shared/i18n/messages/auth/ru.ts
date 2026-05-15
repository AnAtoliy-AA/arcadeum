import { appConfig } from '../../../config/app-config';

export const ru = {
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
      usernameTaken: 'Это имя пользователя уже занято.',
      emailTaken: 'Этот email уже зарегистрирован.',
      invalidCredentials: 'Неверный email или пароль.',
      unknownError: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
    },
    availability: {
      checking: 'Проверка...',
      available: 'Доступно',
    },
  },
  oauth: {
    title: 'Продолжить с Google',
    loginButton: 'Продолжить с Google',
    logoutButton: 'Отключить Google',
    accessTokenLabel: 'Google access token',
    authorizationCodeLabel: 'Код авторизации',
    google: 'Продолжить с Google',
    apple: 'Продолжить с Apple',
    discord: 'Продолжить с Discord',
    comingSoon: 'Скоро',
  },
  form: {
    tabSignIn: 'Войти',
    tabRegister: 'Создать аккаунт',
    headingSignIn: 'С возвращением.',
    headingRegister: 'Создадим аккаунт.',
    subSignIn: 'Используйте кнопку ниже — что быстрее всего.',
    subRegister: 'Займёт 30 секунд. Выберите способ ниже.',
    orWithEmail: 'или по email',
    emailLabel: 'Адрес электронной почты',
    passwordLabel: 'Пароль',
    handleLabel: 'Игровое имя',
    rememberMe: 'Доверять этому устройству',
    forgotPassword: 'Забыли пароль?',
    showPassword: 'Показать',
    hidePassword: 'Скрыть',
    submitSignIn: 'Войти',
    submitRegister: 'Создать аккаунт',
    magicLinkPrompt: 'Нет пароля?',
    magicLinkCta: 'Прислать ссылку для входа',
    magicLinkSentTitle: 'Проверьте почту',
    magicLinkSentBody:
      'Мы отправили ссылку для входа на {{email}}. Откройте её на этом устройстве, чтобы завершить вход.',
    magicLinkBack: 'Другой способ',
    legal:
      'Продолжая, вы принимаете {{termsLink}} и {{privacyLink}} {{appName}}.',
    termsLink: 'Условия',
    privacyLink: 'Политику конфиденциальности',
  },
  brand: {
    statusPill: 'Все системы в норме',
    eyebrow: 'Рады снова вас видеть',
    headlinePrefix: 'Продолжите там, где',
    headlineHighlight: 'остановились.',
    subline:
      'Войдите, чтобы вернуться к рейтинговым матчам, забрать ежедневный бонус и проверить турнирную сетку.',
    featureOauthTitle: 'Вход в один клик',
    featureOauthDetail: 'Google, Apple или Discord',
    featureMagicTitle: 'Нет пароля?',
    featureMagicDetail: 'Пришлём магическую ссылку.',
    featureProgressTitle: 'Прогресс сохранён',
    featureProgressDetail: 'статистика, друзья и достижения переносятся.',
    proof:
      'На этой неделе присоединилось {{count}} игроков — смотрите, кто онлайн в Играх.',
    proofCount: '240 000+',
    footHome: '← Назад на главную',
    footGames: 'Игры',
    footHelp: 'Нужна помощь?',
  },
  pwa: {
    title: 'Установите приложение.',
    body: 'Уведомления о турнирах и приглашениях на реванш.',
    cta: 'Установить',
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
};
