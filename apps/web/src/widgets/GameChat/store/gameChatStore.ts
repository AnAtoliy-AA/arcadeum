import { create } from 'zustand';
import type {
  CriticalLogEntry as ChatLogEntry,
  ChatScope,
} from '@/shared/types/games';

export type { CriticalLogEntry as ChatLogEntry } from '@/shared/types/games';
export type { ChatScope } from '@/shared/types/games';

interface GameChatStore {
  logs: ChatLogEntry[];
  sendMessage: ((message: string, scope: ChatScope) => void) | null;
  setLogs: (logs: ChatLogEntry[]) => void;
  registerSendMessage: (
    fn: (message: string, scope: ChatScope) => void,
  ) => void;
  clear: () => void;
}

export const useGameChatStore = create<GameChatStore>((set) => ({
  logs: [],
  sendMessage: null,
  setLogs: (logs) => set({ logs }),
  registerSendMessage: (fn) => set({ sendMessage: fn }),
  clear: () => set({ logs: [], sendMessage: null }),
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useGameChatStore: typeof useGameChatStore }
  ).useGameChatStore = useGameChatStore;
}
