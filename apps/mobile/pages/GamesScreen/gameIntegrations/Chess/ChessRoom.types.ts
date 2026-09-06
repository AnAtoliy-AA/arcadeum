import type { GameRoomSummary, GameSessionSummary } from '../../api/gamesApi';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';

export interface ChessRoomHandle {
  onSessionSnapshot: () => void;
  onSessionStarted: () => void;
  onChessActionPerformed: () => void;
  onException: () => void;
}

export interface ChessRoomProps {
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

export type ChessPieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type ChessPieceColor = 'white' | 'black';
export type ChessFile = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type ChessRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ChessPiece {
  type: ChessPieceType;
  color: ChessPieceColor;
}

export interface ChessBoardState {
  board: (ChessPiece | null)[][];
  currentTurnColor: ChessPieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  lastMove?: { from: { file: ChessFile; rank: ChessRank }; to: { file: ChessFile; rank: ChessRank } };
}
