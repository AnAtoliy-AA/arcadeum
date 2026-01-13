import { create } from 'zustand';
import { ChatMessage } from '../api';

interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setConnected: (status: boolean) => void;
  setAuthenticated: (status: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isConnected: false,
  isAuthenticated: false,
  loading: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    }),
  setConnected: (isConnected) => set({ isConnected }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  reset: () =>
    set({
      messages: [],
      isConnected: false,
      isAuthenticated: false,
      error: null,
    }),
}));
