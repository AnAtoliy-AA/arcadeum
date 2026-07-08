import { create } from 'zustand';
import type {
  CriticalLogEntry as ChatLogEntry,
  ChatScope,
} from '@/shared/types/games';

export type { CriticalLogEntry as ChatLogEntry } from '@/shared/types/games';
export type { ChatScope } from '@/shared/types/games';

export type ChatDisplayNameResolver = (
  id?: string,
  fallback?: string,
) => string | undefined;

export type ChatActorColorResolver = (id?: string | null) => string | undefined;

export interface ChatEquippedItems {
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId: string | null;
  equippedFrameId: string | null;
  equippedAuraId: string | null;
  equippedBannerId: string | null;
}

export type ChatEquippedResolver = (
  id?: string | null,
) => ChatEquippedItems | null;

interface GameChatStore {
  logs: ChatLogEntry[];
  sendMessage: ((message: string, scope: ChatScope) => void) | null;
  resolveDisplayName: ChatDisplayNameResolver | null;
  fallbackResolveDisplayName: ChatDisplayNameResolver | null;
  resolveActorColor: ChatActorColorResolver | null;
  resolveEquipped: ChatEquippedResolver | null;
  currentUserId: string | null;
  chatPanelOpen: boolean;
  highlightedCell: { row: number; col: number } | null;
  persistedCell: { row: number; col: number } | null;
  setLogs: (logs: ChatLogEntry[]) => void;
  addLog: (entry: ChatLogEntry) => void;
  registerSendMessage: (
    fn: (message: string, scope: ChatScope) => void,
  ) => void;
  registerResolveDisplayName: (fn: ChatDisplayNameResolver | null) => void;
  registerFallbackResolveDisplayName: (
    fn: ChatDisplayNameResolver | null,
  ) => void;
  registerResolveActorColor: (fn: ChatActorColorResolver | null) => void;
  registerResolveEquipped: (fn: ChatEquippedResolver | null) => void;
  setCurrentUserId: (id: string | null) => void;
  setChatPanelOpen: (open: boolean) => void;
  setHighlightedCell: (cell: { row: number; col: number } | null) => void;
  setPersistedCell: (cell: { row: number; col: number } | null) => void;
  clear: () => void;
}

export const useGameChatStore = create<GameChatStore>((set) => ({
  logs: [],
  sendMessage: null,
  resolveDisplayName: null,
  fallbackResolveDisplayName: null,
  resolveActorColor: null,
  resolveEquipped: null,
  currentUserId: null,
  chatPanelOpen: false,
  highlightedCell: null,
  persistedCell: null,
  setLogs: (logs) => set({ logs }),
  addLog: (entry) => set((s) => ({ logs: [...s.logs, entry] })),
  registerSendMessage: (fn) => set({ sendMessage: fn }),
  registerResolveDisplayName: (fn) => set({ resolveDisplayName: fn }),
  registerFallbackResolveDisplayName: (fn) =>
    set({ fallbackResolveDisplayName: fn }),
  registerResolveActorColor: (fn) => set({ resolveActorColor: fn }),
  registerResolveEquipped: (fn) => set({ resolveEquipped: fn }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  setHighlightedCell: (cell) => set({ highlightedCell: cell }),
  setPersistedCell: (cell) =>
    set((s) => ({
      persistedCell:
        cell &&
        s.persistedCell?.row === cell.row &&
        s.persistedCell?.col === cell.col
          ? null
          : cell,
    })),
  clear: () =>
    set({
      logs: [],
      sendMessage: null,
      resolveDisplayName: null,
      fallbackResolveDisplayName: null,
      resolveActorColor: null,
      resolveEquipped: null,
      currentUserId: null,
      chatPanelOpen: false,
      highlightedCell: null,
      persistedCell: null,
    }),
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useGameChatStore: typeof useGameChatStore }
  ).useGameChatStore = useGameChatStore;
}
