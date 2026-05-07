import { SeaBattleEngine } from './sea-battle.engine';
import { GAME_PHASE } from './sea-battle.constants';

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
});
