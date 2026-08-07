import { create } from 'zustand';

interface SocketStatusState {
  isConnected: boolean;
  reconnectAttempts: number;
  setConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export const useSocketStatus = create<SocketStatusState>((set) => ({
  isConnected: false,
  reconnectAttempts: 0,
  setConnected: (isConnected) =>
    set({ isConnected, reconnectAttempts: isConnected ? 0 : undefined }),
  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));
