import { appConfig } from '../../../config/app-config';

export const fr = {
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
      usernameTaken: "Ce nom d'utilisateur est déjà pris.",
      emailTaken: 'Cet e-mail est déjà enregistré.',
      invalidCredentials: 'E-mail ou mot de passe invalide.',
      unknownError: 'Une erreur est survenue. Veuillez réessayer.',
    },
    availability: {
      checking: 'Vérification...',
      available: 'Disponible',
    },
  },
  oauth: {
    title: 'Continuer avec Google',
    loginButton: 'Continuer avec Google',
    logoutButton: 'Déconnecter Google',
    accessTokenLabel: "Jeton d'accès Google",
    authorizationCodeLabel: "Code d'autorisation",
    google: 'Continuer avec Google',
    apple: 'Continuer avec Apple',
    discord: 'Continuer avec Discord',
    comingSoon: 'Bientôt disponible',
  },
  form: {
    tabSignIn: 'Se connecter',
    tabRegister: 'Créer un compte',
    headingSignIn: 'Heureux de vous revoir.',
    headingRegister: 'Rendez-le officiel.',
    subSignIn: "Utilisez l'un des boutons ci-dessous — le plus rapide.",
    subRegister: 'Cela prend 30 secondes. Choisissez comment commencer.',
    orWithEmail: 'ou par e-mail',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Mot de passe',
    handleLabel: 'Pseudo de joueur',
    rememberMe: 'Faire confiance à cet appareil',
    forgotPassword: 'Mot de passe oublié ?',
    showPassword: 'Afficher',
    hidePassword: 'Masquer',
    submitSignIn: 'Se connecter',
    submitRegister: 'Créer un compte',
    magicLinkPrompt: 'Pas de mot de passe ?',
    magicLinkCta: 'Envoyez-moi un lien de connexion',
    magicLinkSentTitle: 'Consultez votre boîte de réception',
    magicLinkSentBody:
      'Nous avons envoyé un lien de connexion à {{email}}. Cliquez dessus depuis cet appareil pour terminer la connexion.',
    magicLinkBack: 'Utiliser une autre méthode',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    legal:
      'En continuant, vous acceptez les {{termsLink}} et la {{privacyLink}} de {{appName}}.',
    termsLink: 'Conditions',
    privacyLink: 'Politique de confidentialité',
  },
  brand: {
    statusPill: 'Tous les systèmes fonctionnent',
    eyebrow: 'Ravi de vous revoir',
    headlinePrefix: 'Reprenez là où vous',
    headlineHighlight: 'vous étiez arrêté.',
    subline:
      'Connectez-vous pour relancer vos parties classées, réclamer votre bonus quotidien et suivre votre tableau de tournoi.',
    featureOauthTitle: 'Connexion en un clic',
    featureOauthDetail: 'Google, Apple ou Discord',
    featureMagicTitle: 'Pas de mot de passe ?',
    featureMagicDetail: 'Nous vous envoyons un lien magique.',
    featureProgressTitle: 'Vos progrès sont sauvegardés',
    featureProgressDetail: 'stats, amis et déblocages sont conservés.',
    proof:
      'Rejoint par {{count}} joueurs cette semaine — voyez qui est en ligne dans Parcourir les jeux.',
    proofCount: '240 000+',
    footHome: "← Retour à l'accueil",
    footGames: 'Parcourir les jeux',
    footHelp: "Besoin d'aide ?",
  },
  pwa: {
    title: "Téléchargez l'app.",
    body: 'Alertes pour les débuts de tournois et les invitations à la revanche.',
    cta: 'Installer',
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
};
