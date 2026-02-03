import {
  BOARD_SIZE,
  CELL_STATE,
  CellState,
  GAME_PHASE,
  SHIPS,
} from './sea-battle.constants';
import {
  ShipCell,
  SeaBattlePlayer,
  Ship,
  SeaBattleState,
} from './sea-battle.types';

export function createEmptyBoard(): CellState[][] {
  return Array.from(
    { length: BOARD_SIZE },
    () => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY) as CellState[],
  );
}

export function areCellsValid(cells: ShipCell[]): boolean {
  return cells.every(
    (cell) =>
      cell.row >= 0 &&
      cell.row < BOARD_SIZE &&
      cell.col >= 0 &&
      cell.col < BOARD_SIZE,
  );
}

export function areCellsConnected(cells: ShipCell[]): boolean {
  if (cells.length <= 1) return true;

  const sorted = [...cells].sort((a, b) =>
    a.row === b.row ? a.col - b.col : a.row - b.row,
  );

  const isHorizontal = sorted.every((c) => c.row === sorted[0].row);
  const isVertical = sorted.every((c) => c.col === sorted[0].col);

  if (!isHorizontal && !isVertical) return false;

  for (let i = 1; i < sorted.length; i++) {
    if (isHorizontal) {
      if (sorted[i].col !== sorted[i - 1].col + 1) return false;
    } else {
      if (sorted[i].row !== sorted[i - 1].row + 1) return false;
    }
  }

  return true;
}

export function markSurroundingCellsAsMiss(
  player: SeaBattlePlayer,
  ship: Ship,
): void {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const cell of ship.cells) {
    for (const [dr, dc] of directions) {
      const r = cell.row + dr;
      const c = cell.col + dc;

      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (player.board[r][c] === CELL_STATE.EMPTY) {
          player.board[r][c] = CELL_STATE.MISS;
        }
      }
    }
  }
}

export function sanitizeSeaBattleState(
  state: SeaBattleState,
  playerId: string,
): Partial<SeaBattleState> {
  // Deep clone state
  const sanitized = JSON.parse(JSON.stringify(state)) as SeaBattleState;

  for (const player of sanitized.players) {
    if (player.playerId !== playerId) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (player.board[row][col] === CELL_STATE.SHIP) {
            player.board[row][col] = CELL_STATE.EMPTY;
          }
        }
      }
      player.ships = player.ships.map((ship: Ship) => ({
        ...ship,
        cells: ship.sunk ? ship.cells : [],
      }));
    }
  }

  sanitized.logs = sanitized.logs.filter((log) => {
    if (log.scope === 'private') {
      return log.senderId === playerId;
    }
    return true;
  });

  return sanitized;
}

export function getSeaBattleAvailableActions(
  state: SeaBattleState,
  playerId: string,
): string[] {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player || !player.alive) return [];

  const actions: string[] = ['chat'];

  if (state.phase === GAME_PHASE.PLACEMENT) {
    if (!player.placementComplete) {
      if (player.ships.length < SHIPS.length) {
        actions.push('placeShip');
      }
      if (player.ships.length === SHIPS.length) {
        actions.push('confirmPlacement');
      }
      if (player.ships.length > 0) {
        actions.push('resetPlacement');
      }
    }
  }

  if (state.phase === GAME_PHASE.BATTLE) {
    const currentPlayerId = state.playerOrder[state.currentTurnIndex];
    if (playerId === currentPlayerId) {
      actions.push('attack');
    }
  }

  return actions;
}
