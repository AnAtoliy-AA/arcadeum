import { SUPPORT_TEAM_NAMES } from '../constants';
import type { TranslationMap } from '../types';

export const supportMessages = {
  en: {
    title: 'Support the developers',
    tagline:
      'Keep {{appName}} iterating quickly and accessible to the tabletop community.',
    description:
      'Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.',
    team: {
      title: 'Meet the core team',
      members: {
        producer: {
          name: SUPPORT_TEAM_NAMES.en.producer,
          role: 'Product & realtime systems',
          bio: 'Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.',
        },
        designer: {
          name: SUPPORT_TEAM_NAMES.en.designer,
          role: 'Game designer & UX',
          bio: 'Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.',
        },
        engineer: {
          name: SUPPORT_TEAM_NAMES.en.engineer,
          role: 'Full-stack engineer',
          bio: 'Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.',
        },
      },
    },
    contribute: {
      title: 'Ways to contribute',
      sponsorTitle: 'Recurring sponsorship',
      sponsorDescription:
        'Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.',
      sponsorCta: 'Sponsor development',
      coffeeTitle: 'One-time boost',
      coffeeDescription:
        'Prefer a quick thank-you? Send the crew coffee and snacks so late-night playtests stay energized.',
      coffeeCta: 'Buy the team a coffee',
      paymentTitle: 'Card payment',
      paymentDescription:
        "Enter an amount and we'll open PayPal's secure checkout in your browser.",
      paymentCta: 'Enter amount',
      ibanTitle: 'Bank transfer',
      ibanDescription:
        'Need to pay by card through your bank? Enter the IBAN {{iban}} to send funds directly to {{appName}}.',
      ibanCta: 'Copy IBAN details',
      ibanCopied: 'IBAN copied to clipboard',
    },
    thanks:
      'Every contribution keeps {{appName}} evolving. Thank you for helping us build the future of remote tabletop play!',
    errors: {
      unableToOpen: "We couldn't open that link. Try again shortly.",
    },
  },
  es: {
    title: 'Apoya al equipo de desarrollo',
    tagline:
      'Ayuda a que {{appName}} evolucione rápido y siga abierto para la comunidad de juegos de mesa.',
    description:
      'Hoy financiamos por nuestra cuenta los laboratorios de pruebas, la infraestructura y los eventos con la comunidad. Tu aporte mantiene los servidores en tiempo real, habilita más noches de playtest y nos permite lanzar la próxima oleada de prototipos.',
    team: {
      title: 'Conoce al equipo central',
      members: {
        producer: {
          name: SUPPORT_TEAM_NAMES.es.producer,
          role: 'Producto y sistemas en tiempo real',
          bio: 'Organiza los prototipos, aterriza la hoja de ruta y mantiene el motor en tiempo real listo para cada sesión.',
        },
        designer: {
          name: SUPPORT_TEAM_NAMES.es.designer,
          role: 'Diseño de juegos y UX',
          bio: 'Convierte el feedback crudo de los playtests en mecánicas balanceadas, flujos pulidos y experiencias de bienvenida.',
        },
        engineer: {
          name: SUPPORT_TEAM_NAMES.es.engineer,
          role: 'Ingeniería full-stack',
          bio: 'Construye funciones multiplataforma, cuida la librería de componentes y mantiene el rendimiento fluido en todos los dispositivos.',
        },
      },
    },
    contribute: {
      title: 'Formas de contribuir',
      sponsorTitle: 'Patrocinio recurrente',
      sponsorDescription:
        'Configura un aporte mensual o anual que cubra hosting, sesiones de QA y nuevos prototipos de juegos.',
      sponsorCta: 'Patrocinar desarrollo',
      coffeeTitle: 'Impulso puntual',
      coffeeDescription:
        '¿Prefieres un agradecimiento rápido? Manda café y snacks al equipo para mantener la energía en los playtests nocturnos.',
      coffeeCta: 'Invitar un café',
      paymentTitle: 'Pago con tarjeta',
      paymentDescription:
        'Ingresa un monto y abriremos el checkout seguro de PayPal en tu navegador.',
      paymentCta: 'Ingresar monto',
      ibanTitle: 'Transferencia bancaria',
      ibanDescription:
        '¿Necesitas pagar con tarjeta desde tu banco? Introduce el IBAN {{iban}} y envía fondos directo a {{appName}}.',
      ibanCta: 'Copiar IBAN',
      ibanCopied: 'IBAN copiado al portapapeles',
    },
    thanks:
      'Cada contribución ayuda a que {{appName}} siga evolucionando. ¡Gracias por impulsar el futuro del juego de mesa remoto!',
    errors: {
      unableToOpen:
        'No pudimos abrir ese enlace. Intenta de nuevo en unos minutos.',
    },
  },
  fr: {
    title: "Soutenir l'équipe de développement",
    tagline:
      'Aide {{appName}} à progresser rapidement tout en restant accessible à la communauté des jeux de société.',
    description:
      "Nos laboratoires de tests, l'infrastructure et les événements communautaires sont entièrement autofinancés. Ton soutien maintient les serveurs temps réel, finance de nouvelles soirées playtest et nous permet de livrer la prochaine vague de prototypes.",
    team: {
      title: "Rencontrez l'équipe cœur",
      members: {
        producer: {
          name: SUPPORT_TEAM_NAMES.fr.producer,
          role: 'Produit & systèmes temps réel',
          bio: 'Orchestre les prototypes, ajuste la feuille de route et veille au bon fonctionnement du moteur temps réel à chaque session.',
        },
        designer: {
          name: SUPPORT_TEAM_NAMES.fr.designer,
          role: 'Game designer & UX',
          bio: 'Transforme les retours de playtest en mécaniques équilibrées, parcours fluides et expériences accueillantes.',
        },
        engineer: {
          name: SUPPORT_TEAM_NAMES.fr.engineer,
          role: 'Ingénieur full-stack',
          bio: 'Déploie des fonctionnalités multiplateformes, maintient la bibliothèque de composants et garantit des performances constantes.',
        },
      },
    },
    contribute: {
      title: 'Comment contribuer',
      sponsorTitle: 'Parrainage récurrent',
      sponsorDescription:
        "Mets en place une contribution mensuelle ou annuelle pour financer l'hébergement, les sessions QA et de nouveaux prototypes.",
      sponsorCta: 'Parrainer le développement',
      coffeeTitle: 'Coup de pouce ponctuel',
      coffeeDescription:
        "Envie d'un merci rapide ? Offre café et encas pour garder l'équipe en forme pendant les playtests nocturnes.",
      coffeeCta: 'Offrir un café',
      paymentTitle: 'Paiement par carte',
      paymentDescription:
        'Indique un montant et nous ouvrons le checkout sécurisé de PayPal dans ton navigateur.',
      paymentCta: 'Saisir le montant',
      ibanTitle: 'Virement bancaire',
      ibanDescription:
        "Besoin de payer par carte via ta banque ? Saisis l'IBAN {{iban}} pour envoyer des fonds directement à {{appName}}.",
      ibanCta: "Copier l'IBAN",
      ibanCopied: 'IBAN copié dans le presse-papiers',
    },
    thanks:
      "Chaque contribution fait évoluer {{appName}}. Merci de nous aider à imaginer l'avenir du jeu de plateau à distance !",
    errors: {
      unableToOpen:
        "Impossible d'ouvrir ce lien pour le moment. Réessaie bientôt.",
    },
  },
} as const satisfies TranslationMap;
