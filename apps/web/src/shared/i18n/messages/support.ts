import type { DeepPartial, Locale } from '../types';

const supportMessagesDefinition = {
  en: {
    title: 'Support the developers',
    tagline:
      'Keep {{appName}} iterating quickly and accessible to the tabletop community.',
    description:
      'Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.',
    thanks:
      'Every contribution keeps {{appName}} evolving. Thank you for helping us build the future of remote tabletop play!',
    teamSectionTitle: 'Meet the core team',
    actionsSectionTitle: 'Ways to contribute',
    team: {
      producer: {
        role: 'Product & realtime systems',
        bio: 'Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.',
      },
      designer: {
        role: 'Game designer & UX',
        bio: 'Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.',
      },
      engineer: {
        role: 'Full-stack engineer',
        bio: 'Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.',
      },
    },
    actions: {
      payment: {
        title: 'Card payment',
        description:
          "Enter an amount and we'll open PayPal's secure checkout in your browser.",
        cta: 'Enter amount',
      },
      sponsor: {
        title: 'Recurring sponsorship',
        description:
          'Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.',
        cta: 'Sponsor development',
      },
      coffee: {
        title: 'One-time boost',
        description:
          'Prefer a quick thank-you? Send the crew coffee and snacks so late-night playtests stay energized.',
        cta: 'Buy the team a coffee',
      },
      iban: {
        title: 'Bank transfer',
        description:
          'Need to pay by card through your bank? Enter the IBAN {{iban}} to send funds directly to {{appName}}.',
        cta: 'Copy IBAN details',
        successMessage: 'IBAN copied to clipboard: {{iban}}',
      },
    },
  },
  es: {
    title: 'Apoya a los desarrolladores',
    tagline:
      'Mantén {{appName}} iterando rápidamente y accesible para la comunidad de juegos de mesa.',
    description:
      'Los laboratorios, la infraestructura y los eventos comunitarios de Arcade actualmente se financian a sí mismos. Tu aporte mantiene en línea los servidores en tiempo real, desbloquea más noches de pruebas y nos ayuda a lanzar la próxima ola de prototipos.',
    thanks:
      'Cada contribución mantiene a {{appName}} evolucionando. ¡Gracias por ayudarnos a construir el futuro de las pruebas de juegos de mesa a distancia!',
    teamSectionTitle: 'Conoce al equipo',
    actionsSectionTitle: 'Cómo contribuir',
    team: {
      producer: {
        role: 'Producto y sistemas en tiempo real',
        bio: 'Mantiene los prototipos organizados, las hojas de ruta realistas y el motor en tiempo real funcionando en cada sesión de pruebas.',
      },
      designer: {
        role: 'Diseño de juegos y UX',
        bio: 'Transforma comentarios en mecánicas equilibradas, flujos pulidos y experiencias de incorporación acogedoras.',
      },
      engineer: {
        role: 'Ingeniería full-stack',
        bio: 'Construye funciones multiplataforma, mantiene el kit de componentes y garantiza un rendimiento ágil en todos los dispositivos.',
      },
    },
    actions: {
      payment: {
        title: 'Pago con tarjeta',
        description:
          'Ingresa un importe y abriremos en tu navegador el checkout seguro de PayPal.',
        cta: 'Ingresar importe',
      },
      sponsor: {
        title: 'Patrocinio recurrente',
        description:
          'Configura una contribución mensual o anual para cubrir hosting, QA y nuevos prototipos de juegos.',
        cta: 'Patrocinar desarrollo',
      },
      coffee: {
        title: 'Impulso puntual',
        description:
          '¿Prefieres un agradecimiento rápido? Envía café y meriendas para que las sesiones nocturnas sigan con energía.',
        cta: 'Invitar un café',
      },
      iban: {
        title: 'Transferencia bancaria',
        description:
          '¿Necesitas pagar desde tu banco? Introduce el IBAN {{iban}} para enviar fondos directamente a {{appName}}.',
        cta: 'Copiar datos de IBAN',
        successMessage: 'IBAN copiado al portapapeles: {{iban}}',
      },
    },
  },
  fr: {
    title: 'Soutenir les développeurs',
    tagline:
      'Aidez {{appName}} à itérer rapidement et à rester accessible à la communauté des jeux de société.',
    description:
      "Les laboratoires, l'infrastructure et les événements communautaires d'Arcade sont aujourd'hui autofinancés. Votre soutien maintient les serveurs temps réel en ligne, débloque davantage de soirées de playtest et nous aide à sortir la prochaine vague de prototypes.",
    thanks:
      "Chaque contribution permet à {{appName}} de progresser. Merci de nous aider à bâtir l'avenir du jeu de société à distance !",
    teamSectionTitle: "Rencontrez l'équipe",
    actionsSectionTitle: 'Comment contribuer',
    team: {
      producer: {
        role: 'Produit et systèmes temps réel',
        bio: 'Garde les prototypes organisés, les feuilles de route réalistes et le moteur temps réel fluide pour chaque session de test.',
      },
      designer: {
        role: 'Game design et UX',
        bio: "Transforme les retours en mécaniques équilibrées, parcours raffinés et expériences d'accueil chaleureuses.",
      },
      engineer: {
        role: 'Ingénierie full-stack',
        bio: 'Construit des fonctionnalités multiplateformes, entretient la boîte à outils de composants et garantit des performances réactives sur tous les appareils.',
      },
    },
    actions: {
      payment: {
        title: 'Paiement par carte',
        description:
          'Saisissez un montant et nous ouvrirons le paiement sécurisé PayPal dans votre navigateur.',
        cta: 'Entrer un montant',
      },
      sponsor: {
        title: 'Parrainage récurrent',
        description:
          "Configurez une contribution mensuelle ou annuelle pour financer l'hébergement, les sessions de QA et les nouveaux prototypes de jeux.",
        cta: 'Soutenir le développement',
      },
      coffee: {
        title: 'Coup de pouce ponctuel',
        description:
          "Envie d'un merci rapide ? Offrez un café et des collations pour dynamiser les playtests nocturnes.",
        cta: 'Offrir un café',
      },
      iban: {
        title: 'Virement bancaire',
        description:
          "Besoin de payer par carte via votre banque ? Saisissez l'IBAN {{iban}} pour envoyer des fonds directement à {{appName}}.",
        cta: "Copier l'IBAN",
        successMessage: 'IBAN copié dans le presse-papiers : {{iban}}',
      },
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const supportMessages = supportMessagesDefinition;

/** Derived type with DeepPartial wrapper for backward compatibility */
export type SupportMessages = DeepPartial<
  (typeof supportMessagesDefinition)['en']
>;

/** Helper types for keyof typeof usage */
export type SupportTeamKey =
  keyof (typeof supportMessagesDefinition)['en']['team'];
export type SupportActionKey =
  keyof (typeof supportMessagesDefinition)['en']['actions'];
