import type { GameRoomSummary, GameSessionSummary } from '../../api/gamesApi';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';

export interface TexasHoldemRoomHandle {
  onSessionSnapshot: () => void;
  onSessionStarted: () => void;
  onHoldemActionPerformed: () => void;
  onException: () => void;
}

export interface TexasHoldemRoomProps {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  fallbackName?: string;
  gameId?: string;
  tokens: SessionTokensSnapshot;
  refreshTokens: () => Promise<SessionTokensSnapshot>;
  insetsTop: number;
  fetchRoom: (mode: 'refresh') => Promise<void>;
  refreshing: boolean;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  deleting: boolean;
  leaving: boolean;
  onDeleteRoom: () => void;
  onLeaveRoom: () => void;
  onViewGame: () => void;
  setRoom: React.Dispatch<React.SetStateAction<GameRoomSummary | null>>;
  setSession: React.Dispatch<React.SetStateAction<GameSessionSummary | null>>;
}

export type ActionBusyType =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'all-in'
  | null;
