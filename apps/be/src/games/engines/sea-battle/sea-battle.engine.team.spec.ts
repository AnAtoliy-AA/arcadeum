import { SeaBattleEngine } from './sea-battle.engine';

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
});
