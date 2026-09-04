import { create } from 'zustand';

interface GameInviteState {
  inviteUserId: string | null;
  setInviteUser: (userId: string) => void;
  consumeInviteUser: () => string | null;
  clearInviteUser: () => void;
}

export const useGameInviteStore = create<GameInviteState>((set, get) => ({
  inviteUserId: null,
  setInviteUser: (userId) => set({ inviteUserId: userId }),
  consumeInviteUser: () => {
    const id = get().inviteUserId;
    set({ inviteUserId: null });
    return id;
  },
  clearInviteUser: () => set({ inviteUserId: null }),
}));
