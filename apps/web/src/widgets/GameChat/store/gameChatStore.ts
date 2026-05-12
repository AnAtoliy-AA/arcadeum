import { create } from 'zustand';
import type {
  CriticalLogEntry as ChatLogEntry,
  ChatScope,
} from '@/shared/types/games';

export type { CriticalLogEntry as ChatLogEntry } from '@/shared/types/games';
export type { ChatScope } from '@/shared/types/games';

export type ChatDisplayNameResolver = (
  id?: string | null,
  fallback?: string | null,
) => string | undefined;

interface GameChatStore {
  logs: ChatLogEntry[];
  sendMessage: ((message: string, scope: ChatScope) => void) | null;
  resolveDisplayName: ChatDisplayNameResolver | null;
  setLogs: (logs: ChatLogEntry[]) => void;
  registerSendMessage: (
    fn: (message: string, scope: ChatScope) => void,
  ) => void;
  registerResolveDisplayName: (fn: ChatDisplayNameResolver | null) => void;
  clear: () => void;
}

export const useGameChatStore = create<GameChatStore>((set) => ({
  logs: [],
  sendMessage: null,
  resolveDisplayName: null,
  setLogs: (logs) => set({ logs }),
  registerSendMessage: (fn) => set({ sendMessage: fn }),
  registerResolveDisplayName: (fn) => set({ resolveDisplayName: fn }),
  clear: () => set({ logs: [], sendMessage: null, resolveDisplayName: null }),
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useGameChatStore: typeof useGameChatStore }
  ).useGameChatStore = useGameChatStore;
}
