import { SeaBattleEngine } from './sea-battle.engine';
import { GAME_PHASE, CELL_STATE } from './sea-battle.constants';

describe('SeaBattleEngine — team mode', () => {
  const engine = new SeaBattleEngine();

  describe('initializeState', () => {
    it('populates team fields when team config is provided', () => {
      const state = engine.initializeState(['a', 'b', 'c', 'd'], {
        teams: [
          { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
          { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
        ],
        hideShipsFromTeammates: true,
      });

      expect(state.teams).toHaveLength(2);
      expect(state.teams![0].currentShooterIndex).toBe(0);
      expect(state.teamOrder).toEqual(['t1', 't2']);
      expect(state.currentTeamIndex).toBe(0);
      expect(state.hideShipsFromTeammates).toBe(true);
    });

    it('leaves team fields undefined when no team config', () => {
      const state = engine.initializeState(['a', 'b']);
      expect(state.teams).toBeUndefined();
      expect(state.teamOrder).toBeUndefined();
      expect(state.hideShipsFromTeammates).toBeUndefined();
    });
  });

  describe('validateAction (attack) — team mode', () => {
    function placedTeamState() {
      const s = engine.initializeState(['a', 'b', 'c', 'd'], {
        teams: [
          { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
          { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
        ],
      });
      s.phase = GAME_PHASE.BATTLE;
      return s;
    }

    it('rejects attack on teammate', () => {
      const s = placedTeamState();
      const ok = engine.validateAction(
        s,
        'attack',
        { userId: 'a', roomId: 'r', sessionId: 's', timestamp: new Date() },
        { targetPlayerId: 'b', row: 0, col: 0 },
      );
      expect(ok).toBe(false);
    });

    it('rejects attack from non-active shooter', () => {
      const s = placedTeamState(); // active = a
      const ok = engine.validateAction(
        s,
        'attack',
        { userId: 'b', roomId: 'r', sessionId: 's', timestamp: new Date() },
        { targetPlayerId: 'c', row: 0, col: 0 },
      );
      expect(ok).toBe(false);
    });

    it('accepts attack from active shooter on enemy', () => {
      const s = placedTeamState();
      const ok = engine.validateAction(
        s,
        'attack',
        { userId: 'a', roomId: 'r', sessionId: 's', timestamp: new Date() },
        { targetPlayerId: 'c', row: 0, col: 0 },
      );
      expect(ok).toBe(true);
    });
  });

  describe('executeAction (attack) — team rotation', () => {
    function readyTeamState(
      playerIds: string[],
      teams: { id: string; playerIds: string[] }[],
    ) {
      const s = engine.initializeState(playerIds, {
        teams: teams.map((t) => ({
          id: t.id,
          name: t.id,
          color: '#000',
          playerIds: t.playerIds,
        })),
      });
      for (const p of s.players) {
        const r1 = engine.executeAction(s, 'autoPlace', {
          userId: p.playerId,
          roomId: '',
          sessionId: '',
          timestamp: new Date(),
        });
        Object.assign(s, r1.state);
        const r2 = engine.executeAction(s, 'confirmPlacement', {
          userId: p.playerId,
          roomId: '',
          sessionId: '',
          timestamp: new Date(),
        });
        Object.assign(s, r2.state);
      }
      return s;
    }

    it("miss advances team and rotates active team's shooter", () => {
      const s = readyTeamState(
        ['a', 'b', 'c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      const c = s.players.find((p) => p.playerId === 'c')!;
      let mr = -1,
        mc = -1;
      outer: for (let r = 0; r < c.board.length; r++) {
        for (let cc = 0; cc < c.board[r].length; cc++) {
          if (c.board[r][cc] === CELL_STATE.EMPTY) {
            mr = r;
            mc = cc;
            break outer;
          }
        }
      }
      expect(mr).toBeGreaterThanOrEqual(0);
      const result = engine.executeAction(
        s,
        'attack',
        { userId: 'a', roomId: '', sessionId: '', timestamp: new Date() },
        { targetPlayerId: 'c', row: mr, col: mc },
      );
      const ns = result.state!;
      expect(ns.currentTeamIndex).toBe(1);
      expect(ns.teams!.find((t) => t.id === 't1')!.currentShooterIndex).toBe(1);
    });

    it('hit keeps the same shooter (no pointer change)', () => {
      const four = readyTeamState(
        ['a', 'b', 'c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      const c = four.players.find((p) => p.playerId === 'c')!;
      let hr = -1,
        hc = -1;
      outer: for (let r = 0; r < c.board.length; r++) {
        for (let cc = 0; cc < c.board[r].length; cc++) {
          if (c.board[r][cc] === CELL_STATE.SHIP) {
            hr = r;
            hc = cc;
            break outer;
          }
        }
      }
      expect(hr).toBeGreaterThanOrEqual(0);
      const result = engine.executeAction(
        four,
        'attack',
        { userId: 'a', roomId: '', sessionId: '', timestamp: new Date() },
        { targetPlayerId: 'c', row: hr, col: hc },
      );
      const ns = result.state!;
      expect(ns.currentTeamIndex).toBe(0); // unchanged on hit
      expect(ns.teams!.find((t) => t.id === 't1')!.currentShooterIndex).toBe(0);
    });
  });

  describe('sanitizeStateForPlayer — team mode', () => {
    function placedTeamState(hide: boolean) {
      const s = engine.initializeState(['a', 'b', 'c', 'd'], {
        teams: [
          { id: 't1', name: 'Red', color: '#E33', playerIds: ['a', 'b'] },
          { id: 't2', name: 'Blue', color: '#36C', playerIds: ['c', 'd'] },
        ],
        hideShipsFromTeammates: hide,
      });
      for (const p of s.players) {
        const r = engine.executeAction(s, 'autoPlace', {
          userId: p.playerId,
          roomId: '',
          sessionId: '',
          timestamp: new Date(),
        });
        Object.assign(s, r.state);
      }
      return s;
    }

    it('reveals teammate ship cells when hideShipsFromTeammates is false', () => {
      const s = placedTeamState(false);
      const sanitized = engine.sanitizeStateForPlayer(s, 'a') as typeof s;
      const teammateB = sanitized.players.find((p) => p.playerId === 'b')!;
      const hasShipCell = teammateB.board.some((row) =>
        row.some((c) => c === CELL_STATE.SHIP),
      );
      expect(hasShipCell).toBe(true);
      expect(teammateB.ships.length).toBeGreaterThan(0);
      expect(teammateB.ships.every((sh) => sh.cells.length > 0)).toBe(true);
    });

    it('hides teammate ship cells when hideShipsFromTeammates is true', () => {
      const s = placedTeamState(true);
      const sanitized = engine.sanitizeStateForPlayer(s, 'a') as typeof s;
      const teammateB = sanitized.players.find((p) => p.playerId === 'b')!;
      const hasShipCell = teammateB.board.some((row) =>
        row.some((c) => c === CELL_STATE.SHIP),
      );
      expect(hasShipCell).toBe(false);
    });

    it('still hides enemy ship cells regardless of toggle', () => {
      const s = placedTeamState(false);
      const sanitized = engine.sanitizeStateForPlayer(s, 'a') as typeof s;
      const enemyC = sanitized.players.find((p) => p.playerId === 'c')!;
      const hasShipCell = enemyC.board.some((row) =>
        row.some((c) => c === CELL_STATE.SHIP),
      );
      expect(hasShipCell).toBe(false);
    });

    it('filters team-scoped logs to teammates only', () => {
      const s = placedTeamState(false);
      s.logs.push({
        id: 'log-1',
        type: 'message',
        message: 'go',
        createdAt: new Date().toISOString(),
        scope: 'team',
        senderId: 'a',
        senderName: 'A',
      });
      const seenByB = (engine.sanitizeStateForPlayer(s, 'b') as typeof s).logs;
      const seenByC = (engine.sanitizeStateForPlayer(s, 'c') as typeof s).logs;
      expect(seenByB.some((l) => l.id === 'log-1')).toBe(true);
      expect(seenByC.some((l) => l.id === 'log-1')).toBe(false);
    });
  });

  describe('isGameOver / getWinners — team mode', () => {
    function teamStateWithKills(
      survivors: string[],
      dead: string[],
      teams: { id: string; playerIds: string[] }[],
    ) {
      const s = engine.initializeState([...survivors, ...dead], {
        teams: teams.map((t) => ({
          id: t.id,
          name: t.id,
          color: '#000',
          playerIds: t.playerIds,
        })),
      });
      s.phase = GAME_PHASE.BATTLE;
      for (const p of s.players) {
        if (dead.includes(p.playerId)) p.alive = false;
      }
      return s;
    }

    it('isGameOver returns true when only one team has alive players', () => {
      const s = teamStateWithKills(
        ['a', 'b'],
        ['c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      expect(engine.isGameOver(s)).toBe(true);
    });

    it('isGameOver returns false when ≥2 teams have alive players', () => {
      const s = teamStateWithKills(
        ['a', 'c'],
        ['b', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      expect(engine.isGameOver(s)).toBe(false);
    });

    it('getWinners returns all surviving team members', () => {
      const s = teamStateWithKills(
        ['a', 'b'],
        ['c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      expect(engine.getWinners(s).sort()).toEqual(['a', 'b']);
    });
  });
});
