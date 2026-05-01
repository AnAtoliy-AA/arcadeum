export const BOARD_SIZE = 10;

export interface ChatLogEntry {
  message: string;
  [key: string]: unknown;
}

export interface GameChatStore {
  getState: () => {
    logs: ChatLogEntry[];
  };
}

export interface TestWindow {
  gameSocket: {
    connected: boolean;
    _mockListeners: Record<string, unknown[]>;
    trigger: (event: string, data: unknown) => void;
  };
  useGameChatStore: GameChatStore;
}

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0),
  );
}

export function createSeaBattleState(
  userId: string,
  otherUserId: string,
  logs: Record<string, unknown>[] = [],
) {
  return {
    phase: 'battle',
    playerOrder: [userId, otherUserId],
    currentTurnIndex: 0,
    players: [
      {
        playerId: userId,
        alive: true,
        board: createEmptyBoard(),
        ships: [],
        shipsRemaining: 5,
        placementComplete: true,
      },
      {
        playerId: otherUserId,
        alive: true,
        board: createEmptyBoard(),
        ships: [],
        shipsRemaining: 5,
        placementComplete: true,
      },
    ],
    logs,
  };
}
