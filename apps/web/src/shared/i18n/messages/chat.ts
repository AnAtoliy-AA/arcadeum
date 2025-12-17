import type { ChatListMessages, ChatMessages, Locale } from "../types";

export const chatMessages: Record<Locale, ChatMessages> = {
  en: {
    notFound: "Chat not found",
    status: {
      connected: "Connected",
      connecting: "Connecting...",
    },
    input: {
      placeholder: "Type a message...",
      ariaLabel: "Message input",
    },
    send: "Send",
  },
  es: {
    notFound: "Chat no encontrado",
    status: {
      connected: "Conectado",
      connecting: "Conectando...",
    },
    input: {
      placeholder: "Escribe un mensaje...",
      ariaLabel: "Entrada de mensaje",
    },
    send: "Enviar",
  },
  fr: {
    notFound: "Discussion introuvable",
    status: {
      connected: "Connecté",
      connecting: "Connexion...",
    },
    input: {
      placeholder: "Écrire un message...",
      ariaLabel: "Saisie de message",
    },
    send: "Envoyer",
  },
};

export const chatListMessages: Record<Locale, ChatListMessages> = {
  en: {
    search: {
      placeholder: "Search users...",
      ariaLabel: "Search for users to chat with",
    },
    empty: {
      noChats: "No chats yet. Start a conversation!",
      unauthenticated: "Sign in to start chatting",
    },
    messages: {
      directChat: "Direct Chat",
    },
  },
  es: {
    search: {
      placeholder: "Buscar usuarios...",
      ariaLabel: "Buscar usuarios para chatear",
    },
    empty: {
      noChats: "Aún no hay chats. ¡Inicia una conversación!",
      unauthenticated: "Inicia sesión para chatear",
    },
    messages: {
      directChat: "Chat Directo",
    },
  },
  fr: {
    search: {
      placeholder: "Rechercher des utilisateurs...",
      ariaLabel: "Rechercher des utilisateurs avec qui discuter",
    },
    empty: {
      noChats: "Aucune discussion pour le moment. Lancez une conversation !",
      unauthenticated: "Connectez-vous pour discuter",
    },
    messages: {
      directChat: "Discussion Directe",
    },
  },
};
