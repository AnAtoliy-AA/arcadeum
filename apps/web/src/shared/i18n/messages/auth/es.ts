import { appConfig } from '../../../config/app-config';

export const es = {
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
      usernameTaken: 'Este nombre de usuario ya está en uso.',
      emailTaken: 'Este correo electrónico ya está registrado.',
      invalidCredentials: 'Correo electrónico o contraseña inválidos.',
      unknownError: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
    },
    availability: {
      checking: 'Comprobando...',
      available: 'Disponible',
    },
  },
  oauth: {
    title: 'Continuar con Google',
    loginButton: 'Continuar con Google',
    logoutButton: 'Desconectar Google',
    accessTokenLabel: 'Token de acceso de Google',
    authorizationCodeLabel: 'Código de autorización',
    google: 'Continuar con Google',
    googleShort: 'Google',
    apple: 'Continuar con Apple',
    appleShort: 'Apple',
    discord: 'Continuar con Discord',
    discordShort: 'Discord',
    comingSoon: 'Próximamente',
  },
  form: {
    tabSignIn: 'Iniciar sesión',
    tabRegister: 'Crear cuenta',
    headingSignIn: 'Bienvenido de nuevo.',
    headingRegister: 'Hazlo oficial.',
    subSignIn: 'Usa uno de los botones de abajo, el que sea más rápido.',
    subRegister:
      'Tarda 30 segundos. Elige una forma de comenzar a continuación.',
    orWithEmail: 'o con correo',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    handleLabel: 'Nombre de jugador',
    rememberMe: 'Confiar en este dispositivo',
    forgotPassword: '¿Olvidaste tu contraseña?',
    showPassword: 'Mostrar',
    hidePassword: 'Ocultar',
    submitSignIn: 'Iniciar sesión',
    submitRegister: 'Crear cuenta',
    magicLinkPrompt: '¿No tienes tu contraseña?',
    magicLinkCta: 'Envíame un enlace de acceso',
    magicLinkSentTitle: 'Revisa tu bandeja de entrada',
    magicLinkSentBody:
      'Enviamos un enlace de acceso a {{email}}. Haz clic en él desde este dispositivo para iniciar sesión.',
    magicLinkBack: 'Usar otro método',
    passwordMismatch: 'Las contraseñas no coinciden.',
    legal:
      'Al continuar aceptas los {{termsLink}} y la {{privacyLink}} de {{appName}}.',
    termsLink: 'Términos',
    privacyLink: 'Política de privacidad',
  },
  brand: {
    statusPill: 'Todos los sistemas operativos',
    eyebrow: 'Qué gusto verte de nuevo',
    headlinePrefix: 'Continúa justo donde lo',
    headlineHighlight: 'dejaste.',
    subline:
      'Inicia sesión para volver a las partidas clasificatorias, reclamar tu bono diario y revisar tu cuadro del torneo.',
    featureOauthTitle: 'Inicio de sesión en un clic',
    featureOauthDetail: 'Google, Apple o Discord',
    featureMagicTitle: '¿Sin contraseña?',
    featureMagicDetail: 'Te enviamos un enlace mágico.',
    featureProgressTitle: 'Tu progreso está a salvo',
    featureProgressDetail: 'estadísticas, amigos y desbloqueos se conservan.',
    proof:
      'Acompañado por {{count}} jugadores esta semana — mira quién está en línea en Juegos.',
    proofCount: '240.000+',
    footHome: '← Volver al inicio',
    footGames: 'Explorar juegos',
    footHelp: '¿Necesitas ayuda?',
  },
  pwa: {
    title: 'Descarga la app.',
    body: 'Alertas de inicio de torneos e invitaciones a la revancha.',
    cta: 'Instalar',
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
};
