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
      linkedin: {
        title: 'Connect on LinkedIn',
        description: 'Follow {{appName}} updates and professional news.',
        cta: 'Connect',
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
  ru: {
    title: 'Поддержите разработчиков',
    tagline:
      'Помогите {{appName}} развиваться быстро и оставаться доступным для всех.',
    description:
      'Лаборатории Arcade, инфраструктура и общественные мероприятия сегодня финансируются самостоятельно. Ваша поддержка помогает держать игровые серверы в сети, позволяет проводить больше плейтестов и помогает нам выпускать новые прототипы.',
    thanks:
      'Каждый вклад помогает {{appName}} развиваться. Спасибо за помощь в создании будущего настольных игр на расстоянии!',
    teamSectionTitle: 'Познакомьтесь с основной командой',
    actionsSectionTitle: 'Способы помочь',
    team: {
      producer: {
        role: 'Продукт и системы реального времени',
        bio: 'Организует разработку прототипов, следит за реальностью планов и бесперебойной работой игрового движка.',
      },
      designer: {
        role: 'Геймдизайнер и UX',
        bio: 'Превращает отзывы игроков в сбалансированную механику, отточенные интерфейсы и понятный ввод в игру.',
      },
      engineer: {
        role: 'Full-stack инженер',
        bio: 'Создает кроссплатформенные функции, поддерживает библиотеку компонентов и обеспечивает быструю работу на всех устройствах.',
      },
    },
    actions: {
      payment: {
        title: 'Оплата картой',
        description:
          'Введите сумму, и мы откроем безопасную страницу PayPal в вашем браузере.',
        cta: 'Введите сумму',
      },
      sponsor: {
        title: 'Регулярная поддержка',
        description:
          'Оформите ежемесячный или ежегодный взнос для оплаты хостинга, QA-сессий и новых прототипов.',
        cta: 'Стать спонсором',
      },
      coffee: {
        title: 'Разовый буст',
        description:
          'Хотите быстро поблагодарить? Угостите команду кофе, чтобы ночные плейтесты проходили бодро.',
        cta: 'Купить команде кофе',
      },
      iban: {
        title: 'Банковский перевод',
        description:
          'Нужно перевести через банк? Используйте IBAN {{iban}} для прямой поддержки {{appName}}.',
        cta: 'Копировать данные IBAN',
        successMessage: 'IBAN скопирован в буфер обмена: {{iban}}',
      },
      linkedin: {
        title: 'Связаться в LinkedIn',
        description:
          'Следите за обновлениями {{appName}} и профессиональными новостями.',
        cta: 'Связаться',
      },
    },
  },
  be: {
    title: 'Падтрымайце распрацоўшчыкаў',
    tagline:
      'Дапамажыце {{appName}} развівацца хутка і заставацца даступным для ўсіх.',
    description:
      'Лабараторыі Arcade, інфраструктура і грамадскія мерапрыемствы сёння фінансуюцца самастойна. Ваша падтрымка дапамагае трымаць гульнявыя серверы ў сетцы, дазваляе праводзіць больш плэйтэстаў і дапамагае нам выпускаць новыя прататыпы.',
    thanks:
      'Кожны ўнёсак дапамагае {{appName}} развівацца. Дзякуй за дапамогу ў стварэнні будучыні настольных гульняў на адлегласці!',
    teamSectionTitle: 'Пазнаёмцеся з асноўнай камандай',
    actionsSectionTitle: 'Спосабы дапамагчы',
    team: {
      producer: {
        role: 'Прадукт і сістэмы рэальнага часу',
        bio: 'Арганізоўвае распрацоўку прататыпаў, сочыць за рэальнасцю планаў і бесперабойнай працай гульнявога рухавіка.',
      },
      designer: {
        role: 'Геймдызайнер і UX',
        bio: 'Ператварае водгукі гульцоў у збалансаваную механіку, адточаныя інтэрфейсы і зразумелы ўвод у гульню.',
      },
      engineer: {
        role: 'Full-stack інжынер',
        bio: 'Стварае кроссплатформавыя функцыі, падтрымлівае бібліятэку кампанентаў і забяспечвае хуткую працу на ўсіх прыладах.',
      },
    },
    actions: {
      payment: {
        title: 'Аплата картай',
        description:
          'Увядзіце суму, і мы адкрыем бяспечную старонку PayPal у вашым браўзеры.',
        cta: 'Увядзіце суму',
      },
      sponsor: {
        title: 'Рэгулярная падтрымка',
        description:
          'Аформіце штомесячны або штогадовы ўзнос для аплаты хостынгу, QA-сесій і новых прататыпаў.',
        cta: 'Стаць спонсарам',
      },
      coffee: {
        title: 'Разавы буст',
        description:
          'Хочаце хутка падзякаваць? Частуйце каманду кавай, каб начныя плэйтэсты праходзілі бадзёра.',
        cta: 'Купіць камандзе каву',
      },
      iban: {
        title: 'Банкаўскі перавод',
        description:
          'Трэба перавесці праз банк? Выкарыстоўвайце IBAN {{iban}} для прамой падтрымкі {{appName}}.',
        cta: 'Капіяваць даныя IBAN',
        successMessage: 'IBAN скапіяваны ў буфер абмену: {{iban}}',
      },
      linkedin: {
        title: 'Звязацца ў LinkedIn',
        description:
          'Сачыце за абнаўленнямі {{appName}} і прафесійнымі навінамі.',
        cta: 'Звязацца',
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
