import { SeaBattleEngine } from './sea-battle.engine';
import { GAME_PHASE, CELL_STATE } from './sea-battle.constants';

describe('SeaBattleEngine — special weapons (sonar & radar)', () => {
  const engine = new SeaBattleEngine();
  const ctx = (userId: string) => ({
    userId,
    roomId: 'r',
    sessionId: 's',
    timestamp: new Date(),
  });

  function battleState(opts?: { sonar?: boolean; radar?: boolean }) {
    const s = engine.initializeState(['a', 'b', 'c'], {
      specialWeapons: { sonar: opts?.sonar, radar: opts?.radar },
    });
    s.phase = GAME_PHASE.BATTLE;

    for (const p of s.players) {
      p.placementComplete = true;
      p.shipsRemaining = 10;
      p.ships = [
        {
          id: 'battleship-1',
          name: 'Battleship',
          size: 4,
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
          ],
          hits: 0,
          sunk: false,
        },
      ];
      for (const cell of p.ships[0].cells) {
        p.board[cell.row][cell.col] = CELL_STATE.SHIP;
      }
    }

    return s;
  }

  describe('useSonar', () => {
    it('reveals ship positions on target board', () => {
      const s = battleState({ sonar: true });
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });

      expect(result.success).toBe(true);
      expect(result.state!.lastSonar).toBeDefined();
      expect(result.state!.lastSonar!.attackerId).toBe('a');
      expect(result.state!.lastSonar!.targetId).toBe('b');
      expect(result.state!.lastSonar!.shipPositions).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
    });

    it('marks sonar as used for the player', () => {
      const s = battleState({ sonar: true });
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });

      expect(result.state!.specialWeaponUsage?.['a']?.sonarUsed).toBe(true);
    });

    it('prevents using sonar twice', () => {
      const s = battleState({ sonar: true });
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });

      const ok = engine.validateAction(result.state!, 'useSonar', ctx('a'), {
        targetPlayerId: 'c',
      });
      expect(ok).toBe(false);
    });

    it('advances turn after sonar', () => {
      const s = battleState({ sonar: true });
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });

      expect(result.state!.currentTurnIndex).not.toBe(s.currentTurnIndex);
    });

    it('rejects sonar when not enabled', () => {
      const s = battleState({});
      const ok = engine.validateAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });
      expect(ok).toBe(false);
    });

    it('rejects sonar on self', () => {
      const s = battleState({ sonar: true });
      const ok = engine.validateAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'a',
      });
      expect(ok).toBe(false);
    });

    it('rejects sonar during placement phase', () => {
      const s = battleState({ sonar: true });
      s.phase = GAME_PHASE.PLACEMENT;
      const ok = engine.validateAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });
      expect(ok).toBe(false);
    });

    it('rejects sonar from non-active player', () => {
      const s = battleState({ sonar: true });
      const ok = engine.validateAction(s, 'useSonar', ctx('b'), {
        targetPlayerId: 'c',
      });
      expect(ok).toBe(false);
    });

    it('rejects sonar on dead target', () => {
      const s = battleState({ sonar: true });
      s.players[1].alive = false;
      const ok = engine.validateAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });
      expect(ok).toBe(false);
    });

    it('excludes sunk ships from sonar results', () => {
      const s = battleState({ sonar: true });
      s.players[1].ships[0].sunk = true;
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });

      expect(result.state!.lastSonar!.shipPositions).toEqual([]);
    });

    it('sanitizes lastSonar for non-attacker', () => {
      const s = battleState({ sonar: true });
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });
      const state = result.state!;

      const sanitizedB = engine.sanitizeStateForPlayer(state, 'b');
      expect(sanitizedB.lastSonar).toBeUndefined();

      const sanitizedA = engine.sanitizeStateForPlayer(state, 'a');
      expect(sanitizedA.lastSonar).toBeDefined();
    });
  });

  describe('useRadar', () => {
    it('scans a row and reveals cell states', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });

      expect(result.success).toBe(true);
      expect(result.state!.lastRadar).toBeDefined();
      expect(result.state!.lastRadar!.attackerId).toBe('a');
      expect(result.state!.lastRadar!.targetId).toBe('b');
      expect(result.state!.lastRadar!.row).toBe(0);
      expect(result.state!.lastRadar!.col).toBeUndefined();

      const cells = result.state!.lastRadar!.cells;
      expect(cells.length).toBe(10);
      expect(cells[0]).toEqual({ row: 0, col: 0, state: CELL_STATE.SHIP });
      expect(cells[1]).toEqual({ row: 0, col: 1, state: CELL_STATE.SHIP });
      expect(cells[4]).toEqual({ row: 0, col: 4, state: CELL_STATE.EMPTY });
    });

    it('scans a column and reveals cell states', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        col: 0,
      });

      expect(result.success).toBe(true);
      expect(result.state!.lastRadar!.col).toBe(0);
      expect(result.state!.lastRadar!.row).toBeUndefined();

      const cells = result.state!.lastRadar!.cells;
      expect(cells.length).toBe(10);
      expect(cells[0]).toEqual({ row: 0, col: 0, state: CELL_STATE.SHIP });
      expect(cells[1]).toEqual({ row: 1, col: 0, state: CELL_STATE.EMPTY });
    });

    it('marks radar as used for the player', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });

      expect(result.state!.specialWeaponUsage?.['a']?.radarUsed).toBe(true);
    });

    it('prevents using radar twice', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });

      const ok = engine.validateAction(result.state!, 'useRadar', ctx('a'), {
        targetPlayerId: 'c',
        col: 1,
      });
      expect(ok).toBe(false);
    });

    it('advances turn after radar', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });

      expect(result.state!.currentTurnIndex).not.toBe(s.currentTurnIndex);
    });

    it('rejects radar when not enabled', () => {
      const s = battleState({});
      const ok = engine.validateAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });
      expect(ok).toBe(false);
    });

    it('rejects radar without row or col', () => {
      const s = battleState({ radar: true });
      const ok = engine.validateAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
      });
      expect(ok).toBe(false);
    });

    it('rejects radar with both row and col', () => {
      const s = battleState({ radar: true });
      const ok = engine.validateAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
        col: 0,
      });
      expect(ok).toBe(false);
    });

    it('rejects radar with out-of-bounds row', () => {
      const s = battleState({ radar: true });
      const ok = engine.validateAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 15,
      });
      expect(ok).toBe(false);
    });

    it('rejects radar on self', () => {
      const s = battleState({ radar: true });
      const ok = engine.validateAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'a',
        row: 0,
      });
      expect(ok).toBe(false);
    });

    it('sanitizes lastRadar for non-attacker', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });
      const state = result.state!;

      const sanitizedB = engine.sanitizeStateForPlayer(state, 'b');
      expect(sanitizedB.lastRadar).toBeUndefined();

      const sanitizedA = engine.sanitizeStateForPlayer(state, 'a');
      expect(sanitizedA.lastRadar).toBeDefined();
    });
  });

  describe('available actions', () => {
    it('includes useSonar when enabled and unused', () => {
      const s = battleState({ sonar: true });
      const actions = engine.getAvailableActions(s, 'a');
      expect(actions).toContain('useSonar');
    });

    it('includes useRadar when enabled and unused', () => {
      const s = battleState({ radar: true });
      const actions = engine.getAvailableActions(s, 'a');
      expect(actions).toContain('useRadar');
    });

    it('excludes useSonar after it has been used', () => {
      const s = battleState({ sonar: true });
      const result = engine.executeAction(s, 'useSonar', ctx('a'), {
        targetPlayerId: 'b',
      });
      const actions = engine.getAvailableActions(result.state!, 'a');
      expect(actions).not.toContain('useSonar');
    });

    it('excludes useRadar after it has been used', () => {
      const s = battleState({ radar: true });
      const result = engine.executeAction(s, 'useRadar', ctx('a'), {
        targetPlayerId: 'b',
        row: 0,
      });
      const actions = engine.getAvailableActions(result.state!, 'a');
      expect(actions).not.toContain('useRadar');
    });

    it('does not include special weapons when not enabled', () => {
      const s = battleState({});
      const actions = engine.getAvailableActions(s, 'a');
      expect(actions).not.toContain('useSonar');
      expect(actions).not.toContain('useRadar');
    });
  });
});
