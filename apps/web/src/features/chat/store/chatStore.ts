import { create } from 'zustand';
import { ChatMessage } from '../api';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loading: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => {
      if (message.tempId) {
        const optimisticIndex = state.messages.findIndex(
          (m) => m.tempId === message.tempId || m.id === message.tempId,
        );

        if (optimisticIndex !== -1) {
          const newMessages = [...state.messages];
          newMessages[optimisticIndex] = message;
          return { messages: newMessages };
        }
      }

      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }

      return { messages: [...state.messages, message] };
    }),
  setLoading: (loading) => set({ loading }),
  reset: () =>
    set({
      messages: [],
      error: null,
    }),
}));
