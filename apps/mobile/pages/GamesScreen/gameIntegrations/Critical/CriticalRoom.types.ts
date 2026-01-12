import type { GameRoomSummary, GameSessionSummary } from '../../api/gamesApi';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';

export interface CriticalRoomHandle {
  onSessionSnapshot: () => void;
  onSessionStarted: () => void;
  onCatComboPlayed: () => void;
  onException: () => void;
}

export interface CriticalRoomProps {
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
  | 'draw'
  | 'skip'
  | 'attack'
  | 'shuffle'
  | 'favor'
  | 'nope'
  | 'see_the_future'
  | 'cat_pair'
  | 'cat_trio'
  | 'cat_fiver'
  | 'defuse'
  | 'targeted_attack'
  | 'personal_attack'
  | 'attack_of_the_dead'
  | 'super_skip'
  | 'reverse'
  | null;
