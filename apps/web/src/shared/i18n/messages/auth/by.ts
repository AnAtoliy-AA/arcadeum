import { appConfig } from '../../../config/app-config';

export const by = {
  badge: 'Ранні доступ',
  title: 'Увайдзіце ў {{appName}}',
  description:
    'Мы запрашаем стваральнікаў хвалямі, пакуль завяршаем укараненне бяспечнага ўваходу ў {{appName}}.',
  statusHeadline: 'Вэб-ўваход хутка з’явіцца.',
  statusDescription:
    'Запытайце ранні доступ, і мы паведамім вам, калі ваш акаўнт будзе гатовы, ці працягвайце ў маільным прыкладанні сёння.',
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
      usernameTooShort: 'Імя карыстальніка павінна быць не менш за 3 сімвалы.',
      invalidEmail: 'Калі ласка, увядзіце карэктны адрас электроннай пошты.',
      usernameTaken: 'Гэтае імя карыстальніка ўжо занята.',
      emailTaken: 'Гэты email ўжо зарэгістраваны.',
      invalidCredentials: 'Няправільны email ці пароль.',
      unknownError: 'Адбылася памылка. Калі ласка, паспрабуйце яшчэ раз.',
    },
    availability: {
      checking: 'Праверка...',
      available: 'Даступна',
    },
  },
  oauth: {
    title: 'Працягнуць з Google',
    loginButton: 'Працягнуць з Google',
    logoutButton: 'Адключыць Google',
    accessTokenLabel: 'Google access token',
    authorizationCodeLabel: 'Код аўтарызацыі',
    google: 'Працягнуць з Google',
    apple: 'Працягнуць з Apple',
    discord: 'Працягнуць з Discord',
    comingSoon: 'Хутка',
  },
  form: {
    tabSignIn: 'Увайсці',
    tabRegister: 'Стварыць акаўнт',
    headingSignIn: 'З вяртаннем.',
    headingRegister: 'Зробім гэта афіцыйна.',
    subSignIn: 'Скарыстайцеся адной з кнопак ніжэй — як хутчэй.',
    subRegister: 'Зойме 30 секунд. Абярыце спосаб ніжэй.',
    orWithEmail: 'або праз email',
    emailLabel: 'Адрас электроннай пошты',
    passwordLabel: 'Пароль',
    handleLabel: 'Гульнявое імя',
    rememberMe: 'Давяраць гэтай прыладзе',
    forgotPassword: 'Забылі пароль?',
    showPassword: 'Паказаць',
    hidePassword: 'Схаваць',
    submitSignIn: 'Увайсці',
    submitRegister: 'Стварыць акаўнт',
    magicLinkPrompt: 'Няма пароля?',
    magicLinkCta: 'Даслаць спасылку для ўваходу',
    magicLinkSentTitle: 'Праверце пошту',
    magicLinkSentBody:
      'Мы адправілі спасылку для ўваходу на {{email}}. Адкрыйце яе на гэтай прыладзе, каб завяршыць уваход.',
    magicLinkBack: 'Іншы спосаб',
    legal:
      'Працягваючы, вы пагаджаецеся з {{termsLink}} і {{privacyLink}} {{appName}}.',
    termsLink: 'Умовамі',
    privacyLink: 'Палітыкай прыватнасці',
  },
  brand: {
    statusPill: 'Усе сістэмы працуюць',
    eyebrow: 'Рады бачыць вас зноў',
    headlinePrefix: 'Працягніце там, дзе',
    headlineHighlight: 'спыніліся.',
    subline:
      'Увайдзіце, каб вярнуцца да рэйтынгавых матчаў, забраць штодзённы бонус і праверыць турнірную сетку.',
    featureOauthTitle: 'Уваход у адзін клік',
    featureOauthDetail: 'Google, Apple ці Discord',
    featureMagicTitle: 'Няма пароля?',
    featureMagicDetail: 'Дашлём магічную спасылку.',
    featureProgressTitle: 'Прагрэс захаваны',
    featureProgressDetail: 'статыстыка, сябры і дасягненні застаюцца.',
    proof:
      'На гэтым тыдні далучылася {{count}} гульцоў — паглядзіце, хто ў сетцы ў Гульнях.',
    proofCount: '240 000+',
    footHome: '← Назад на галоўную',
    footGames: 'Гульні',
    footHelp: 'Патрэбна дапамога?',
  },
  pwa: {
    title: 'Усталюйце дадатак.',
    body: 'Апавяшчэнні пра пачатак турніраў і запрашэнні на рэванш.',
    cta: 'Усталяваць',
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
};
