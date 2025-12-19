import type { TranslationMap } from '../types';

export const settingsMessages = {
  en: {
    appearanceTitle: 'Appearance',
    appearanceDescription:
      'Tweak how the interface looks regardless of your device theme.',
    themeLabel: 'Theme preference',
    languageLabel: 'App language',
    themeOptions: {
      system: {
        label: 'System default',
        description: 'Follow your device appearance settings.',
      },
      light: {
        label: 'Light',
        description: 'Always use the light interface.',
      },
      dark: {
        label: 'Dark',
        description: 'Always use the dark interface.',
      },
      neonLight: {
        label: 'Neon Light',
        description: 'Use neon gradients with brighter surfaces.',
      },
      neonDark: {
        label: 'Neon Dark',
        description: 'Embrace the full neon arcade glow.',
      },
    },
    languageTitle: 'Language',
    languageDescription:
      "Choose the language you prefer for in-app copy. We're rolling out more translations soon.",
    languageOptions: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
    },
    activeSelection: 'Active selection',
    tapToSwitch: 'Tap to switch',
    accountTitle: 'Account',
    accountDescription:
      'Manage your sign-in status and session tokens for this device.',
    accountSignedOut: 'You are browsing without signing in.',
    signedInAs: 'Signed in as {{user}}',
    downloadsTitle: 'Downloads',
    downloadsDescription:
      'Access the latest Expo builds for installing on physical devices.',
  },
  es: {
    appearanceTitle: 'Aspecto',
    appearanceDescription:
      'Ajusta el aspecto de la interfaz sin importar el tema del dispositivo.',
    themeLabel: 'Preferencia de tema',
    languageLabel: 'Idioma de la app',
    themeOptions: {
      system: {
        label: 'Predeterminado del sistema',
        description: 'Sigue los ajustes de apariencia de tu dispositivo.',
      },
      light: {
        label: 'Claro',
        description: 'Usa siempre la interfaz clara.',
      },
      dark: {
        label: 'Oscuro',
        description: 'Usa siempre la interfaz oscura.',
      },
      neonLight: {
        label: 'Neón Claro',
        description: 'Usa gradientes neón con superficies más brillantes.',
      },
      neonDark: {
        label: 'Neón Oscuro',
        description: 'Disfruta del brillo arcade neón completo.',
      },
    },
    languageTitle: 'Idioma',
    languageDescription:
      'Elige el idioma que prefieres para los textos de la aplicación. Pronto añadiremos más traducciones.',
    languageOptions: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
    },
    activeSelection: 'Selección activa',
    tapToSwitch: 'Toca para cambiar',
    accountTitle: 'Cuenta',
    accountDescription:
      'Administra tu estado de inicio de sesión y los tokens guardados en este dispositivo.',
    accountSignedOut: 'Estás navegando sin iniciar sesión.',
    signedInAs: 'Sesión iniciada como {{user}}',
    downloadsTitle: 'Descargas',
    downloadsDescription:
      'Accede a las últimas compilaciones de Expo para instalarlas en tus dispositivos.',
  },
  fr: {
    appearanceTitle: 'Apparence',
    appearanceDescription:
      "Ajustez l'apparence de l'interface indépendamment du thème de votre appareil.",
    themeLabel: 'Préférence de thème',
    languageLabel: "Langue de l'application",
    themeOptions: {
      system: {
        label: 'Réglage du système',
        description: "Suit les paramètres d'apparence de votre appareil.",
      },
      light: {
        label: 'Clair',
        description: "Utilise toujours l'interface claire.",
      },
      dark: {
        label: 'Sombre',
        description: "Utilise toujours l'interface sombre.",
      },
      neonLight: {
        label: 'Néon clair',
        description:
          'Utilisez des dégradés néon avec des surfaces plus lumineuses.',
      },
      neonDark: {
        label: 'Néon sombre',
        description: "Plongez dans l'ambiance arcade néon complète.",
      },
    },
    languageTitle: 'Langue',
    languageDescription:
      "Choisissez la langue des textes de l'application. Davantage de traductions arrivent bientôt.",
    languageOptions: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
    },
    activeSelection: 'Sélection active',
    tapToSwitch: 'Touchez pour changer',
    accountTitle: 'Compte',
    accountDescription:
      'Gérez votre état de connexion et les jetons enregistrés sur cet appareil.',
    accountSignedOut: 'Vous naviguez sans être connecté.',
    signedInAs: 'Connecté en tant que {{user}}',
    downloadsTitle: 'Téléchargements',
    downloadsDescription:
      'Accédez aux dernières compilations Expo à installer sur vos appareils.',
  },
} as const satisfies TranslationMap;
