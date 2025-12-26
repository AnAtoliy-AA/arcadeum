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
    },
    messages: {
      directChat: 'Discussion Directe',
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const chatListMessages = chatListMessagesDefinition;

/** Derived type from the chatListMessages object - English locale structure */
export type ChatListMessages = (typeof chatListMessagesDefinition)['en'];
