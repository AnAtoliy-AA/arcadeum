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
  highlightedCells: { row: number; col: number }[];
  persistedCell: { row: number; col: number } | null;
  persistedCells: { row: number; col: number }[];
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
  setHighlightedCells: (cells: { row: number; col: number }[]) => void;
  setPersistedCell: (cell: { row: number; col: number } | null) => void;
  setPersistedCells: (cells: { row: number; col: number }[]) => void;
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
  highlightedCells: [],
  persistedCell: null,
  persistedCells: [],
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
  setHighlightedCell: (cell) =>
    set({ highlightedCell: cell, highlightedCells: cell ? [cell] : [] }),
  setHighlightedCells: (cells) =>
    set({ highlightedCells: cells, highlightedCell: cells[0] ?? null }),
  setPersistedCell: (cell) =>
    set((s) => {
      const isSame =
        cell &&
        s.persistedCell?.row === cell.row &&
        s.persistedCell?.col === cell.col;
      return {
        persistedCell: isSame ? null : cell,
        persistedCells: isSame ? [] : cell ? [cell] : [],
      };
    }),
  setPersistedCells: (cells) =>
    set((s) => {
      const isSame =
        cells.length > 0 &&
        s.persistedCells.length === cells.length &&
        cells.every(
          (c, i) =>
            c.row === s.persistedCells[i]?.row &&
            c.col === s.persistedCells[i]?.col,
        );
      return {
        persistedCells: isSame ? [] : cells,
        persistedCell: isSame ? null : (cells[0] ?? null),
      };
    }),
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
      highlightedCells: [],
      persistedCell: null,
      persistedCells: [],
    }),
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useGameChatStore: typeof useGameChatStore }
  ).useGameChatStore = useGameChatStore;
}
