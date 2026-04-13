import type { Locale } from '../types';

const chatMessagesDefinition = {
  en: {
    notFound: 'Chat not found',
    status: {
      connected: 'Connected',
      connecting: 'Connecting...',
    },
    input: {
      placeholder: 'Type a message...',
      ariaLabel: 'Message input',
    },
    send: 'Send',
    loginRequired: 'Login required to view messages',
  },
  es: {
    notFound: 'Chat no encontrado',
    status: {
      connected: 'Conectado',
      connecting: 'Conectando...',
    },
    input: {
      placeholder: 'Escribe un mensaje...',
      ariaLabel: 'Entrada de mensaje',
    },
    send: 'Enviar',
    loginRequired: 'Inicia sesión para ver los mensajes',
  },
  fr: {
    notFound: 'Discussion introuvable',
    status: {
      connected: 'Connecté',
      connecting: 'Connexion...',
    },
    input: {
      placeholder: 'Écrire un message...',
      ariaLabel: 'Saisie de message',
    },
    send: 'Envoyer',
    loginRequired: 'Connexion requise pour voir les messages',
  },
  ru: {
    notFound: 'Чат не найден',
    status: {
      connected: 'Подключено',
      connecting: 'Подключение...',
    },
    input: {
      placeholder: 'Введите сообщение...',
      ariaLabel: 'Ввод сообщения',
    },
    send: 'Отправить',
    loginRequired: 'Войдите, чтобы просмотреть сообщения',
  },
  by: {
    notFound: 'Чат не знойдзены',
    status: {
      connected: 'Падключана',
      connecting: 'Падключэнне...',
    },
    input: {
      placeholder: 'Увядзіце паведамленне...',
      ariaLabel: 'Увод паведамлення',
    },
    send: 'Адправіць',
    loginRequired: 'Увайдзіце, каб прагледзець паведамленні',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const chatMessages = chatMessagesDefinition;

/** Derived type from the chatMessages object - English locale structure */
export type ChatMessages = (typeof chatMessagesDefinition)['en'];

const chatListMessagesDefinition = {
  en: {
    search: {
      placeholder: 'Search users...',
      ariaLabel: 'Search for users to chat with',
    },
    empty: {
      noChats: 'No chats yet. Start a conversation!',
      unauthenticated: 'Sign in to start chatting',
      loading: 'Loading...',
    },
    messages: {
      directChat: 'Direct Chat',
    },
  },
  es: {
    search: {
      placeholder: 'Buscar usuarios...',
      ariaLabel: 'Buscar usuarios para chatear',
    },
    empty: {
      noChats: 'Aún no hay chats. ¡Inicia una conversación!',
      unauthenticated: 'Inicia sesión para chatear',
      loading: 'Cargando...',
    },
    messages: {
      directChat: 'Chat Directo',
    },
  },
  fr: {
    search: {
      placeholder: 'Rechercher des utilisateurs...',
      ariaLabel: 'Rechercher des utilisateurs avec qui discuter',
    },
    empty: {
      noChats: 'Aucune discussion pour le moment. Lancez une conversation !',
      unauthenticated: 'Connectez-vous pour discuter',
      loading: 'Chargement...',
    },
    messages: {
      directChat: 'Discussion Directe',
    },
  },
  ru: {
    search: {
      placeholder: 'Поиск пользователей...',
      ariaLabel: 'Поиск пользователей для чата',
    },
    empty: {
      noChats: 'Чатов пока нет. Начните общение!',
      unauthenticated: 'Войдите, чтобы начать общаться',
      loading: 'Загрузка...',
    },
    messages: {
      directChat: 'Личный чат',
    },
  },
  by: {
    search: {
      placeholder: 'Пошук карыстальнікаў...',
      ariaLabel: 'Пошук карыстальнікаў для чата',
    },
    empty: {
      noChats: 'Чатаў пакуль няма. Пачніце зносіны!',
      unauthenticated: 'Увайдзіце, каб пачаць камунікаваць',
      loading: 'Загрузка...',
    },
    messages: {
      directChat: 'Асабісты чат',
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const chatListMessages = chatListMessagesDefinition;

/** Derived type from the chatListMessages object - English locale structure */
export type ChatListMessages = (typeof chatListMessagesDefinition)['en'];
