import type { DeepPartial, Locale } from '../types';

const pwaMessagesDefinition = {
  en: {
    install: {
      title: 'Install Arcadeum',
      button: 'Install App',
      notNow: 'Not Now',
      description:
        'Install Arcadeum on your device for the best gaming experience.',
      features: {
        fast: 'Faster loading and performance',
        offline: 'Play even when offline',
        notifications: 'Get game invites instantly',
      },
    },
    offline: {
      title: "You're Offline",
      description:
        "It looks like you've lost your internet connection. Check your network and try again.",
      retry: 'Try Again',
    },
  },
  es: {
    install: {
      title: 'Instalar Arcadeum',
      button: 'Instalar App',
      notNow: 'Ahora no',
      description:
        'Instala Arcadeum en tu dispositivo para la mejor experiencia de juego.',
      features: {
        fast: 'Carga y rendimiento más rápidos',
        offline: 'Juega incluso sin conexión',
        notifications: 'Recibe invitaciones de juego al instante',
      },
    },
    offline: {
      title: 'Sin conexión',
      description:
        'Parece que has perdido tu conexión a internet. Revisa tu red e inténtalo de nuevo.',
      retry: 'Reintentar',
    },
  },
  fr: {
    install: {
      title: 'Installer Arcadeum',
      button: "Installer l'app",
      notNow: 'Plus tard',
      description:
        'Installez Arcadeum sur votre appareil pour la meilleure expérience de jeu.',
      features: {
        fast: 'Chargement et performances plus rapides',
        offline: 'Jouez même hors ligne',
        notifications: 'Recevez les invitations instantanément',
      },
    },
    offline: {
      title: 'Vous êtes hors ligne',
      description:
        'Il semble que vous ayez perdu votre connexion internet. Vérifiez votre réseau et réessayez.',
      retry: 'Réessayer',
    },
  },
  ru: {
    install: {
      title: 'Установить Arcadeum',
      button: 'Установить',
      notNow: 'Не сейчас',
      description:
        'Установите Arcadeum на устройство для лучшего игрового опыта.',
      features: {
        fast: 'Быстрая загрузка и производительность',
        offline: 'Играйте даже офлайн',
        notifications: 'Получайте приглашения мгновенно',
      },
    },
    offline: {
      title: 'Нет подключения',
      description:
        'Похоже, вы потеряли подключение к интернету. Проверьте сеть и попробуйте снова.',
      retry: 'Повторить',
    },
  },
  by: {
    install: {
      title: 'Усталяваць Arcadeum',
      button: 'Усталяваць',
      notNow: 'Не зараз',
      description:
        'Усталюйце Arcadeum на прыладу для лепшага гульнявога досведу.',
      features: {
        fast: 'Хуткая загрузка і прадукцыйнасць',
        offline: 'Гуляйце нават афлайн',
        notifications: 'Атрымлівайце запрашэнні імгненна',
      },
    },
    offline: {
      title: 'Няма злучэння',
      description:
        'Падобна, вы страцілі злучэнне з інтэрнэтам. Праверце сетку і паспрабуйце зноў.',
      retry: 'Паўтарыць',
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const pwaMessages = pwaMessagesDefinition;

export type PwaMessages = DeepPartial<(typeof pwaMessagesDefinition)['en']>;
