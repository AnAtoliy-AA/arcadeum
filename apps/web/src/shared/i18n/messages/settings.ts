import { appConfig } from '../../config/app-config';
import type { DeepPartial, Locale } from '../types';

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join('{appName}');
}

const settingsMessagesDefinition = {
  en: {
    title: 'Settings',
    description:
      'Manage your appearance, language, and download preferences for the {appName} web experience.',
    gameplayTitle: 'Gameplay',
    gameplayDescription: 'Customize your in-game experience.',
    hapticsLabel: 'Haptic Feedback',
    appearanceTitle: 'Appearance',
    appearanceDescription:
      'Choose a theme to use across the {appName} web experience.',
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
  },
  es: {
    title: 'Configuración',
    description:
      'Administra la apariencia, el idioma y las descargas para la experiencia web de {appName}.',
    gameplayTitle: 'Juego',
    gameplayDescription: 'Personaliza tu experiencia de juego.',
    hapticsLabel: 'Respuesta háptica',
    appearanceTitle: 'Apariencia',
    appearanceDescription:
      'Elige un tema para usar en toda la experiencia web de {appName}.',
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
  },
  fr: {
    title: 'Paramètres',
    description:
      "Gérez l'apparence, la langue et les téléchargements pour l'expérience web de {appName}.",
    gameplayTitle: 'Jeu',
    gameplayDescription: 'Personnalisez votre expérience de jeu.',
    hapticsLabel: 'Retour haptique',
    appearanceTitle: 'Apparence',
    appearanceDescription:
      "Choisissez un thème à utiliser sur l'ensemble de l'expérience web de {appName}.",
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
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const settingsMessages = settingsMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type SettingsMessages = DeepPartial<
  (typeof settingsMessagesDefinition)['en']
>;
