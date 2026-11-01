import type { GameOptions } from '@/shared/types/games';

export interface UseRematchOptions {
  roomId: string;
  gameOptions?: GameOptions;
}

export interface RematchInvitation {
  newRoomId: string;
  hostId: string;
  hostName: string;
  message?: string;
  timeout: number;
}

export interface RematchWaitingState {
  newRoomId: string;
  pendingUserIds: string[];
  acceptedUserIds?: string[];
  declinedUserIds?: string[];
  status:
    'waiting' | 'accepted' | 'declined' | 'cancelled' | 'expired' | 'partial';
  rematchNumber?: number;
}

export interface UseRematchResult {
  rematchLoading: boolean;
  rematchError: string | null;
  showRematchModal: boolean;
  openRematchModal: () => void;
  closeRematchModal: () => void;
  handleRematch: (participantIds: string[], message?: string) => Promise<void>;
  invitation: RematchInvitation | null;
  invitationTimeLeft: number;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;
  isAcceptingInvitation: boolean;
  handleReinvite: (userIds: string[]) => void;
  handleBlockRematch: (roomId: string) => void;
  handleBlockUser: (userId: string) => void;
  waiting: RematchWaitingState | null;
  waitingTimeLeft: number;
  cancelRematch: () => void;
  joinRematchRoom: () => void;
  dismissWaiting: () => void;
}
