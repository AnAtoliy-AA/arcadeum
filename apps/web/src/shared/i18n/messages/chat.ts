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
    loginButton: 'Log In',
    you: 'You',
  },
  chatList: {
    search: {
      placeholder: 'Search users...',
      ariaLabel: 'Search for users to chat with',
    },
    empty: {
      noChats: 'No chats yet',
      unauthenticated: 'Sign in to chat',
      loading: 'Loading...',
      startConversation: 'Start a conversation by searching for a user above!',
    },
    messages: {
      directChat: 'Direct Chat',
    },
    loading: 'Loading chats...',
    loginButton: 'Log In',
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
    loginButton: 'Iniciar sesión',
    you: 'Tú',
  },
  chatList: {
    search: {
      placeholder: 'Buscar usuarios...',
      ariaLabel: 'Buscar usuarios para chatear',
    },
    empty: {
      noChats: 'Aún no hay chats',
      unauthenticated: 'Inicia sesión para chatear',
      loading: 'Cargando...',
      startConversation: '¡Inicia una conversación buscando un usuario arriba!',
    },
    messages: {
      directChat: 'Chat Directo',
    },
    loading: 'Cargando chats...',
    loginButton: 'Iniciar sesión',
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
    loginButton: 'Se connecter',
    you: 'Toi',
  },
  chatList: {
    search: {
      placeholder: 'Rechercher des utilisateurs...',
      ariaLabel: 'Rechercher des utilisateurs avec qui discuter',
    },
    empty: {
      noChats: 'Aucune discussion pour le moment',
      unauthenticated: 'Connectez-vous pour discuter',
      loading: 'Chargement...',
      startConversation:
        'Lancez une conversation en recherchant un utilisateur ci-dessus !',
    },
    messages: {
      directChat: 'Discussion Directe',
    },
    loading: 'Chargement des discussions...',
    loginButton: 'Se connecter',
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
    loginButton: 'Войти',
    you: 'Вы',
  },
  chatList: {
    search: {
      placeholder: 'Поиск пользователей...',
      ariaLabel: 'Поиск пользователей для чата',
    },
    empty: {
      noChats: 'Чатов пока нет',
      unauthenticated: 'Войдите, чтобы начать общаться',
      loading: 'Загрузка...',
      startConversation: 'Начните общение, найдя пользователя выше!',
    },
    messages: {
      directChat: 'Личный чат',
    },
    loading: 'Загрузка чатов...',
    loginButton: 'Войти',
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
    loginButton: 'Увайсці',
    you: 'Вы',
  },
  chatList: {
    search: {
      placeholder: 'Пошук карыстальнікаў...',
      ariaLabel: 'Пошук карыстальнікаў для чата',
    },
    empty: {
      noChats: 'Чатаў пакуль няма',
      unauthenticated: 'Увайдзіце, каб пачаць камунікаваць',
      loading: 'Загрузка...',
      startConversation: 'Пачніце зносіны, знайшоўшы карыстальніка вышэй!',
    },
    messages: {
      directChat: 'Асабісты чат',
    },
    loading: 'Загрузка чатаў...',
    loginButton: 'Увайсці',
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
  en: en.chatList,
  es: es.chatList,
  fr: fr.chatList,
  ru: ru.chatList,
  by: by.chatList,
} as const;

/** Derived types for backward compatibility */
export type ChatMessages = typeof en.chat;
export type ChatListMessages = typeof en.chatList;
