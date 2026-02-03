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

function getShipCells(
  startRow: number,
  startCol: number,
  size: number,
  isVertical: boolean,
): ShipCell[] | null {
  const cells: ShipCell[] = [];
  for (let i = 0; i < size; i++) {
    const row = isVertical ? startRow + i : startRow;
    const col = isVertical ? startCol : startCol + i;

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }
    cells.push({ row, col });
  }
  return cells;
}

function canPlaceShip(
  board: CellState[][],
  row: number,
  col: number,
  size: number,
  isVertical: boolean,
): boolean {
  const cells = getShipCells(row, col, size, isVertical);

  // Check bounds
  if (!cells) return false;

  // Check collision and spacing
  for (const cell of cells) {
    if (board[cell.row][cell.col] !== CELL_STATE.EMPTY) return false;

    // Check neighbors (no adjacent ships allowed)
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

    for (const [dr, dc] of directions) {
      const r = cell.row + dr;
      const c = cell.col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === CELL_STATE.SHIP) return false;
      }
    }
  }

  return true;
}

export function randomlyPlaceShips(): Record<string, ShipCell[]> {
  const board = createEmptyBoard();
  const placements: Record<string, ShipCell[]> = {};

  // Sort ships by size descending to make placement easier
  const sortedShips = [...SHIPS].sort((a, b) => b.size - a.size);

  for (const ship of sortedShips) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 1000;

    while (!placed && attempts < maxAttempts) {
      attempts++;
      const isVertical = Math.random() < 0.5;
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      if (canPlaceShip(board, row, col, ship.size, isVertical)) {
        const cells = getShipCells(row, col, ship.size, isVertical);

        if (cells) {
          // Update local board
          cells.forEach((cell) => {
            board[cell.row][cell.col] = CELL_STATE.SHIP;
          });

          placements[ship.id] = cells;
          placed = true;
        }
      }
    }

    if (!placed) {
      // Failed to place a ship. Allow retry in caller or return empty to signal failure.
      return {};
    }
  }

  return placements;
}
