import type { Locale, TranslationBundle } from "./types";
import { appConfig } from "../config/app-config";

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join("{appName}");
}

const enTranslations: TranslationBundle = {
  common: {
    languageNames: {
      en: "English",
      es: "Spanish",
      fr: "French",
    },
  },
  home: {
    kicker: appConfig.kicker,
    tagline: withAppNamePlaceholder(appConfig.tagline),
    description: withAppNamePlaceholder(appConfig.description),
    primaryCtaLabel: appConfig.primaryCta.label,
    supportCtaLabel: appConfig.supportCta.label,
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
  },
  settings: {
    title: "Settings",
    description: "Manage your appearance, language, and download preferences for the {appName} web experience.",
    appearanceTitle: "Appearance",
    appearanceDescription: "Choose a theme to use across the {appName} web experience.",
    themeOptions: {
      system: {
        label: "Match system appearance",
        description: "Follow your operating system preference automatically.",
      },
      light: {
        label: "Light",
        description: "Bright neutrals with airy surfaces and subtle gradients.",
      },
      dark: {
        label: "Dark",
        description: "Contemporary midnight palette ideal for low-light play.",
      },
      neonLight: {
        label: "Neon Light",
        description: "Arcade-inspired glow with luminous panels and neon edges.",
      },
      neonDark: {
        label: "Neon Dark",
        description: "High-contrast vaporwave styling for dramatic game tables.",
      },
    },
    languageTitle: "Language",
    languageDescription: "Interface translations are a work in progress. Save your preference for upcoming updates.",
    languageOptionLabels: {
      en: "English",
      es: "Español",
      fr: "Français",
    },
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
    accountTitle: "Account",
    accountDescription: "Web sign-in is rolling out soon. In the meantime, manage your subscriptions via the dashboard or continue in the mobile app.",
    accountGuestStatus: "You are browsing as a guest.",
    accountPrimaryCta: "Go to sign-in",
    accountSupportCtaLabel: appConfig.supportCta.label,
  },
  support: {
    title: "Support the developers",
    tagline: "Keep {appName} iterating quickly and accessible to the tabletop community.",
    description:
      "Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.",
    thanks:
      "Every contribution keeps {appName} evolving. Thank you for helping us build the future of remote tabletop play!",
    teamSectionTitle: "Meet the core team",
    actionsSectionTitle: "Ways to contribute",
    team: {
      producer: {
        role: "Product & realtime systems",
        bio: "Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.",
      },
      designer: {
        role: "Game designer & UX",
        bio: "Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.",
      },
      engineer: {
        role: "Full-stack engineer",
        bio: "Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.",
      },
    },
    actions: {
      payment: {
        title: "Card payment",
        description: "Enter an amount and we'll open UniPAY's secure checkout in your browser.",
        cta: "Enter amount",
      },
      sponsor: {
        title: "Recurring sponsorship",
        description: "Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.",
        cta: "Sponsor development",
      },
      coffee: {
        title: "One-time boost",
        description: "Prefer a quick thank-you? Send the crew coffee and snacks so late-night playtests stay energized.",
        cta: "Buy the team a coffee",
      },
      iban: {
        title: "Bank transfer",
        description: "Need to pay by card through your bank? Enter the IBAN {iban} to send funds directly to {appName}.",
        cta: "Copy IBAN details",
        successMessage: "IBAN copied to clipboard: {iban}",
      },
    },
  },
};

export const translations: Record<Locale, TranslationBundle> = {
  en: enTranslations,
  es: {
    common: {
      languageNames: {
        en: "Inglés",
        es: "Español",
        fr: "Francés",
      },
    },
    home: {
      kicker: "Arcade remoto para juegos de mesa",
      tagline: "{appName} es tu arcade remoto para pruebas rápidas de juegos de mesa.",
      description:
        "Crea salas en tiempo real, reúne a tu equipo de pruebas y deja que {appName} automatice reglas, puntuaciones y moderación para que te concentres en la diversión.",
      primaryCtaLabel: "Comenzar",
      supportCtaLabel: "Apoyar a los desarrolladores",
      downloadsTitle: "Instala las apps móviles",
      downloadsDescription:
        "Descarga las últimas compilaciones de Expo para iOS y Android directamente desde la web.",
      downloadsIosLabel: "Descargar para iOS",
      downloadsAndroidLabel: "Descargar para Android",
    },
    settings: {
      title: "Configuración",
      description:
        "Administra la apariencia, el idioma y las descargas para la experiencia web de {appName}.",
      appearanceTitle: "Apariencia",
      appearanceDescription:
        "Elige un tema para usar en toda la experiencia web de {appName}.",
      themeOptions: {
        system: {
          label: "Coincidir con el sistema",
          description: "Sigue automáticamente la preferencia de tu sistema operativo.",
        },
        light: {
          label: "Claro",
          description:
            "Blancos nítidos con degradados sutiles y un cromado luminoso.",
        },
        dark: {
          label: "Oscuro",
          description:
            "Paleta nocturna perfecta para sesiones en ambientes con poca luz.",
        },
        neonLight: {
          label: "Neón claro",
          description:
            "Brillo inspirado en arcades con paneles luminosos y bordes neón.",
        },
        neonDark: {
          label: "Neón oscuro",
          description:
            "Estilo vaporwave de alto contraste para mesas dramáticas.",
        },
      },
      languageTitle: "Idioma",
      languageDescription:
        "Las traducciones de la interfaz siguen en desarrollo. Guarda tu preferencia para las próximas actualizaciones.",
      languageOptionLabels: {
        en: "Inglés",
        es: "Español",
        fr: "Francés",
      },
      downloadsTitle: "Compilaciones móviles",
      downloadsDescription:
        "Descarga las últimas compilaciones de Expo para mantener los clientes móviles sincronizados con la versión web.",
      downloadsIosLabel: "Descargar para iOS",
      downloadsAndroidLabel: "Descargar para Android",
      accountTitle: "Cuenta",
      accountDescription:
        "El inicio de sesión web llegará pronto. Mientras tanto, administra tus suscripciones en el panel o continúa en la app móvil.",
      accountGuestStatus: "Estás navegando como invitado.",
      accountPrimaryCta: "Ir a iniciar sesión",
      accountSupportCtaLabel: "Apoyar a los desarrolladores",
    },
    support: {
      title: "Apoya a los desarrolladores",
      tagline: "Mantén {appName} iterando rápidamente y accesible para la comunidad de juegos de mesa.",
      description:
        "Los laboratorios, la infraestructura y los eventos comunitarios de Arcade actualmente se financian a sí mismos. Tu aporte mantiene en línea los servidores en tiempo real, desbloquea más noches de pruebas y nos ayuda a lanzar la próxima ola de prototipos.",
      thanks:
        "Cada contribución mantiene a {appName} evolucionando. ¡Gracias por ayudarnos a construir el futuro de las pruebas de juegos de mesa a distancia!",
      teamSectionTitle: "Conoce al equipo",
      actionsSectionTitle: "Cómo contribuir",
      team: {
        producer: {
          role: "Producto y sistemas en tiempo real",
          bio: "Mantiene los prototipos organizados, las hojas de ruta realistas y el motor en tiempo real funcionando en cada sesión de pruebas.",
        },
        designer: {
          role: "Diseño de juegos y UX",
          bio: "Transforma comentarios en mecánicas equilibradas, flujos pulidos y experiencias de incorporación acogedoras.",
        },
        engineer: {
          role: "Ingeniería full-stack",
          bio: "Construye funciones multiplataforma, mantiene el kit de componentes y garantiza un rendimiento ágil en todos los dispositivos.",
        },
      },
      actions: {
        payment: {
          title: "Pago con tarjeta",
          description:
            "Ingresa un importe y abriremos en tu navegador el checkout seguro de UniPAY.",
          cta: "Ingresar importe",
        },
        sponsor: {
          title: "Patrocinio recurrente",
          description:
            "Configura una contribución mensual o anual para cubrir hosting, QA y nuevos prototipos de juegos.",
          cta: "Patrocinar desarrollo",
        },
        coffee: {
          title: "Impulso puntual",
          description:
            "¿Prefieres un agradecimiento rápido? Envía café y meriendas para que las sesiones nocturnas sigan con energía.",
          cta: "Invitar un café",
        },
        iban: {
          title: "Transferencia bancaria",
          description:
            "¿Necesitas pagar desde tu banco? Introduce el IBAN {iban} para enviar fondos directamente a {appName}.",
          cta: "Copiar datos de IBAN",
          successMessage: "IBAN copiado al portapapeles: {iban}",
        },
      },
    },
  },
  fr: {
    common: {
      languageNames: {
        en: "Anglais",
        es: "Espagnol",
        fr: "Français",
      },
    },
    home: {
      kicker: "Arcade à distance pour les jeux de société",
      tagline: "{appName} est votre arcade à distance pour des playtests rapides de jeux de société.",
      description:
        "Créez des salons en temps réel, rassemblez votre équipe de test et laissez {appName} automatiser règles, scores et modération pour que vous puissiez vous concentrer sur le plaisir.",
      primaryCtaLabel: "Commencer",
      supportCtaLabel: "Soutenir les développeurs",
      downloadsTitle: "Installer les applications mobiles",
      downloadsDescription:
        "Téléchargez les dernières versions Expo pour iOS et Android directement depuis le web.",
      downloadsIosLabel: "Télécharger pour iOS",
      downloadsAndroidLabel: "Télécharger pour Android",
    },
    settings: {
      title: "Paramètres",
      description:
        "Gérez l'apparence, la langue et les téléchargements pour l'expérience web de {appName}.",
      appearanceTitle: "Apparence",
      appearanceDescription:
        "Choisissez un thème à utiliser sur l'ensemble de l'expérience web de {appName}.",
      themeOptions: {
        system: {
          label: "Suivre le système",
          description:
            "Suit automatiquement la préférence de votre système d'exploitation.",
        },
        light: {
          label: "Clair",
          description:
            "Blancs nets avec dégradés subtils et chrome lumineux.",
        },
        dark: {
          label: "Sombre",
          description:
            "Palette nocturne idéale pour les sessions dans un environnement peu éclairé.",
        },
        neonLight: {
          label: "Néon clair",
          description:
            "Éclat inspiré des arcades avec des panneaux lumineux et des bordures néon.",
        },
        neonDark: {
          label: "Néon sombre",
          description:
            "Style vaporwave à fort contraste pour des tables spectaculaires.",
        },
      },
      languageTitle: "Langue",
      languageDescription:
        "Les traductions de l'interface sont en cours. Enregistrez votre préférence pour les prochaines mises à jour.",
      languageOptionLabels: {
        en: "Anglais",
        es: "Espagnol",
        fr: "Français",
      },
      downloadsTitle: "Versions mobiles",
      downloadsDescription:
        "Récupérez les dernières versions Expo pour garder les applications mobiles synchronisées avec la version web.",
      downloadsIosLabel: "Télécharger pour iOS",
      downloadsAndroidLabel: "Télécharger pour Android",
      accountTitle: "Compte",
      accountDescription:
        "La connexion web arrive bientôt. En attendant, gérez vos abonnements via le tableau de bord ou continuez dans l'application mobile.",
      accountGuestStatus: "Vous naviguez en tant qu'invité.",
      accountPrimaryCta: "Aller à la connexion",
      accountSupportCtaLabel: "Soutenir les développeurs",
    },
    support: {
      title: "Soutenir les développeurs",
      tagline: "Aidez {appName} à itérer rapidement et à rester accessible à la communauté des jeux de société.",
      description:
        "Les laboratoires, l'infrastructure et les événements communautaires d'Arcade sont aujourd'hui autofinancés. Votre soutien maintient les serveurs temps réel en ligne, débloque davantage de soirées de playtest et nous aide à sortir la prochaine vague de prototypes.",
      thanks:
        "Chaque contribution permet à {appName} de progresser. Merci de nous aider à bâtir l'avenir du jeu de société à distance !",
      teamSectionTitle: "Rencontrez l'équipe",
      actionsSectionTitle: "Comment contribuer",
      team: {
        producer: {
          role: "Produit et systèmes temps réel",
          bio: "Garde les prototypes organisés, les feuilles de route réalistes et le moteur temps réel fluide pour chaque session de test.",
        },
        designer: {
          role: "Game design et UX",
          bio: "Transforme les retours en mécaniques équilibrées, parcours raffinés et expériences d'accueil chaleureuses.",
        },
        engineer: {
          role: "Ingénierie full-stack",
          bio: "Construit des fonctionnalités multiplateformes, entretient la boîte à outils de composants et garantit des performances réactives sur tous les appareils.",
        },
      },
      actions: {
        payment: {
          title: "Paiement par carte",
          description:
            "Saisissez un montant et nous ouvrirons le module sécurisé de paiement UniPAY dans votre navigateur.",
          cta: "Saisir le montant",
        },
        sponsor: {
          title: "Parrainage récurrent",
          description:
            "Mettez en place une contribution mensuelle ou annuelle pour financer l'hébergement, l'assurance qualité et de nouveaux prototypes.",
          cta: "Parrainer le développement",
        },
        coffee: {
          title: "Coup de pouce ponctuel",
          description:
            "Envie d'un merci rapide ? Offrez café et encas pour garder les playtests nocturnes sous tension.",
          cta: "Offrir un café",
        },
        iban: {
          title: "Virement bancaire",
          description:
            "Besoin de payer via votre banque ? Utilisez l'IBAN {iban} pour envoyer des fonds directement à {appName}.",
          cta: "Copier l'IBAN",
          successMessage: "IBAN copié dans le presse-papiers : {iban}",
        },
      },
    },
  },
};
