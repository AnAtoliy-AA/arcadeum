import { SeaBattleEngine } from './sea-battle.engine';
import { GAME_PHASE, CELL_STATE, SHIPS } from './sea-battle.constants';
import type { SeaBattleState, ShipCell } from './sea-battle.types';

describe('SeaBattleEngine — moveShip', () => {
  const engine = new SeaBattleEngine();

  function placementState(): SeaBattleState {
    const s = engine.initializeState(['a', 'b']);
    s.phase = GAME_PHASE.PLACEMENT;
    return s;
  }

  function placeAt(
    state: SeaBattleState,
    playerId: string,
    shipId: string,
    cells: ShipCell[],
  ) {
    const player = state.players.find((p) => p.playerId === playerId)!;
    const config = SHIPS.find((s) => s.id === shipId)!;
    player.ships.push({
      id: shipId,
      name: config.name,
      size: config.size,
      cells,
      hits: 0,
      sunk: false,
    });
    for (const cell of cells) {
      player.board[cell.row][cell.col] = CELL_STATE.SHIP;
    }
  }

  const ctx = (userId: string) => ({
    userId,
    roomId: 'r',
    sessionId: 's',
    timestamp: new Date(),
  });

  describe('validateAction', () => {
    it('accepts moving a placed ship to a valid empty area', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 5, col: 5 },
          { row: 5, col: 6 },
          { row: 5, col: 7 },
          { row: 5, col: 8 },
        ],
      });
      expect(ok).toBe(true);
    });

    it('allows a one-cell nudge along the same axis (overlap with self)', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
      });
      expect(ok).toBe(true);
    });

    it('rejects overlap with another ship', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      placeAt(s, 'a', 'cruiser-1', [
        { row: 5, col: 5 },
        { row: 5, col: 6 },
        { row: 5, col: 7 },
      ]);
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 5, col: 5 },
          { row: 5, col: 6 },
          { row: 5, col: 7 },
          { row: 5, col: 8 },
        ],
      });
      expect(ok).toBe(false);
    });

    it('rejects adjacency (diagonal corner touch) with another ship', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      placeAt(s, 'a', 'cruiser-1', [
        { row: 5, col: 5 },
        { row: 5, col: 6 },
        { row: 5, col: 7 },
      ]);
      // Touching corner of cruiser-1 at (5,5) — diagonal at (4,4)
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 4, col: 1 },
          { row: 4, col: 2 },
          { row: 4, col: 3 },
          { row: 4, col: 4 },
        ],
      });
      expect(ok).toBe(false);
    });

    it('rejects out-of-bounds cells', () => {
      const s = placementState();
      placeAt(s, 'a', 'destroyer-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ]);
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'destroyer-1',
        cells: [
          { row: 0, col: 9 },
          { row: 0, col: 10 },
        ],
      });
      expect(ok).toBe(false);
    });

    it('rejects when ship is not currently placed', () => {
      const s = placementState();
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
        ],
      });
      expect(ok).toBe(false);
    });

    it('rejects when player has already confirmed placement', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      const player = s.players.find((p) => p.playerId === 'a')!;
      player.placementComplete = true;

      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 5, col: 5 },
          { row: 5, col: 6 },
          { row: 5, col: 7 },
          { row: 5, col: 8 },
        ],
      });
      expect(ok).toBe(false);
    });

    it('rejects outside the PLACEMENT phase', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      s.phase = GAME_PHASE.BATTLE;

      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 5, col: 5 },
          { row: 5, col: 6 },
          { row: 5, col: 7 },
          { row: 5, col: 8 },
        ],
      });
      expect(ok).toBe(false);
    });

    it('rejects cell-count mismatch (wrong ship size)', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      const ok = engine.validateAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        // Battleship is size 4 — only 3 cells provided
        cells: [
          { row: 5, col: 5 },
          { row: 5, col: 6 },
          { row: 5, col: 7 },
        ],
      });
      expect(ok).toBe(false);
    });
  });

  describe('executeAction', () => {
    it('clears the old cells, stamps the new cells, and replaces the ship entry', () => {
      const s = placementState();
      placeAt(s, 'a', 'battleship-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
      const newCells = [
        { row: 5, col: 5 },
        { row: 5, col: 6 },
        { row: 5, col: 7 },
        { row: 5, col: 8 },
      ];
      const result = engine.executeAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: newCells,
      });
      expect(result.success).toBe(true);

      const ns = result.state!;
      const player = ns.players.find((p) => p.playerId === 'a')!;

      // Old cells are empty
      for (const c of [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]) {
        expect(player.board[c.row][c.col]).toBe(CELL_STATE.EMPTY);
      }
      // New cells stamped
      for (const c of newCells) {
        expect(player.board[c.row][c.col]).toBe(CELL_STATE.SHIP);
      }
      const ships = player.ships.filter((sh) => sh.id === 'battleship-1');
      expect(ships).toHaveLength(1);
      expect(ships[0].cells).toEqual(newCells);
      expect(ships[0].hits).toBe(0);
      expect(ships[0].sunk).toBe(false);
    });

    it('logs a "Moved <ship>" private action entry', () => {
      const s = placementState();
      placeAt(s, 'a', 'cruiser-1', [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ]);
      const before = s.logs.length;
      const result = engine.executeAction(s, 'moveShip', ctx('a'), {
        shipId: 'cruiser-1',
        cells: [
          { row: 5, col: 0 },
          { row: 5, col: 1 },
          { row: 5, col: 2 },
        ],
      });
      const ns = result.state!;
      expect(ns.logs.length).toBe(before + 1);
      const log = ns.logs[ns.logs.length - 1];
      expect(log.type).toBe('action');
      expect(log.message).toBe('Moved Cruiser');
      expect(log.scope).toBe('private');
      expect(log.senderId).toBe('a');
    });

    it('returns failure if ship id is not currently placed', () => {
      const s = placementState();
      const result = engine.executeAction(s, 'moveShip', ctx('a'), {
        shipId: 'battleship-1',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
