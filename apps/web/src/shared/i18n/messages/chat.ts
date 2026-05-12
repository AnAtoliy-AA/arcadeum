export const en = {
  chat: {
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
    you: 'You',
  },
  list: {
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
};

export const es = {
  chat: {
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
    you: 'Tú',
  },
  list: {
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
};

export const fr = {
  chat: {
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
    you: 'Toi',
  },
  list: {
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
};

export const ru = {
  chat: {
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
    you: 'Вы',
  },
  list: {
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
};

export const by = {
  chat: {
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
    you: 'Вы',
  },
  list: {
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
};

export const chatMessages = {
  en: en.chat,
  es: es.chat,
  fr: fr.chat,
  ru: ru.chat,
  by: by.chat,
} as const;

export const chatListMessages = {
  en: en.list,
  es: es.list,
  fr: fr.list,
  ru: ru.list,
  by: by.list,
} as const;

/** Derived types for backward compatibility */
export type ChatMessages = typeof en.chat;
export type ChatListMessages = typeof en.list;
