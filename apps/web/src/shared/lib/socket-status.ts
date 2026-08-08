import { create } from 'zustand';

interface SocketStatusState {
  isConnected: boolean;
  hasEverConnected: boolean;
  reconnectAttempts: number;
  setConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export const useSocketStatus = create<SocketStatusState>((set) => ({
  isConnected: false,
  hasEverConnected: false,
  reconnectAttempts: 0,
  setConnected: (isConnected) =>
    set((state) => ({
      isConnected,
      hasEverConnected: state.hasEverConnected || isConnected,
      reconnectAttempts: isConnected ? 0 : state.reconnectAttempts,
    })),
  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));
