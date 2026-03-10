import type { DeepPartial, Locale } from '../types';

const pwaMessagesDefinition = {
  en: {
    install: {
      title: 'Install Arcadeum',
      button: 'Install App',
      notNow: 'Not Now',
      installAs: 'Install as',
      webApp: 'Web App',
      getThe: 'Get the',
      appGuide: 'App Guide',
      description:
        'Install Arcadeum on your device for the best gaming experience.',
      features: {
        fast: 'Faster loading and performance',
        notifications: 'Get game invites instantly',
      },
      manual: {
        title: 'How to Install',
        ios: 'Tap the share button {{icon}} in the browser toolbar and select "Add to Home Screen" {{plus}}.',
        generic:
          'Open your browser menu and select "Install" or "Add to Home Screen".',
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
      installAs: 'Instalar como',
      webApp: 'Web App',
      getThe: 'Obtener la',
      appGuide: 'Guía de la App',
      description:
        'Instala Arcadeum en tu dispositivo para la mejor experiencia de juego.',
      features: {
        fast: 'Carga y rendimiento más rápidos',
        notifications: 'Recibe invitaciones de juego al instante',
      },
      manual: {
        title: 'Cómo instalar',
        ios: 'Toca el botón compartir {{icon}} en la barra de herramientas del navegador y selecciona "Añadir a la pantalla de inicio" {{plus}}.',
        generic:
          'Abre el menú de tu navegador y selecciona "Instalar" o "Añadir a la pantalla de inicio".',
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
      installAs: 'Installer comme',
      webApp: 'Web App',
      getThe: "Obtenir l'",
      appGuide: "Guide de l'App",
      description:
        'Installez Arcadeum sur votre appareil pour la meilleure expérience de jeu.',
      features: {
        fast: 'Chargement et performances plus rapides',
        notifications: 'Recevez les invitations instantanément',
      },
      manual: {
        title: 'Comment installer',
        ios: "Appuyez sur le bouton de partage {{icon}} dans la barre d'outils du navigateur et sélectionnez \"Sur l'écran d'accueil\" {{plus}}.",
        generic:
          'Ouvrez le menu de votre navigateur et sélectionnez "Installer" ou "Ajouter à l\'écran d\'accueil".',
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
      installAs: 'Установить как',
      webApp: 'Веб-приложение',
      getThe: 'Открыть',
      appGuide: 'Инструкцию',
      description:
        'Установите Arcadeum на устройство для лучшего игрового опыта.',
      features: {
        fast: 'Быстрая загрузка и производительность',
        notifications: 'Получайте приглашения мгновенно',
      },
      manual: {
        title: 'Как установить',
        ios: 'Нажмите кнопку «Поделиться» {{icon}} в панели браузера и выберите «На экран „Домой“» {{plus}}.',
        generic:
          'Открывайте меню браузера и выбирайте «Установить» или «На экран „Домой“».',
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
      installAs: 'Усталяваць як',
      webApp: 'Вэб-прыкладанне',
      getThe: 'Адкрыць',
      appGuide: 'Інструкцыю',
      description:
        'Усталюйце Arcadeum на прыладу для лепшага гульнявога досведу.',
      features: {
        fast: 'Хуткая загрузка і прадукцыйнасць',
        notifications: 'Атрымлівайце запрашэнні імгненна',
      },
      manual: {
        title: 'Як усталяваць',
        ios: 'Націсніце кнопку «Падзяліцца» {{icon}} у панэлі браўзера і выберыце «На экран „Дамоў“» {{plus}}.',
        generic:
          'Адкрывайце меню браўзера і выбірайце «Усталяваць» або «На экран „Дамоў“».',
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
