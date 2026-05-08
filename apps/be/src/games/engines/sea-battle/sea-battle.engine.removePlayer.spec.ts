import { SeaBattleEngine } from './sea-battle.engine';
import { GAME_PHASE } from './sea-battle.constants';

describe('SeaBattleEngine — removePlayer', () => {
  const engine = new SeaBattleEngine();

  describe('team mode', () => {
    function battleTeamState(
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
      s.phase = GAME_PHASE.BATTLE;
      return s;
    }

    it("active shooter leaving passes the turn to the next team and advances their team's shooter", () => {
      const s = battleTeamState(
        ['a', 'b', 'c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      const result = engine.removePlayer(s, 'a');
      const ns = result.state!;

      expect(ns.players.find((p) => p.playerId === 'a')!.alive).toBe(false);
      expect(ns.currentTeamIndex).toBe(1);
      expect(ns.teams!.find((t) => t.id === 't1')!.currentShooterIndex).toBe(1);
      expect(ns.playerOrder[ns.currentTurnIndex]).toBe('c');
    });

    it("non-active teammate leaving does not change turn or active team's shooter", () => {
      const s = battleTeamState(
        ['a', 'b', 'c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      const result = engine.removePlayer(s, 'b');
      const ns = result.state!;

      expect(ns.players.find((p) => p.playerId === 'b')!.alive).toBe(false);
      expect(ns.currentTeamIndex).toBe(0);
      expect(ns.teams!.find((t) => t.id === 't1')!.currentShooterIndex).toBe(0);
      expect(ns.playerOrder[ns.currentTurnIndex]).toBe('a');
    });

    it("inactive team's current shooter leaving rotates only that team's shooter", () => {
      const s = battleTeamState(
        ['a', 'b', 'c', 'd'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c', 'd'] },
        ],
      );
      const result = engine.removePlayer(s, 'c');
      const ns = result.state!;

      expect(ns.currentTeamIndex).toBe(0);
      expect(ns.teams!.find((t) => t.id === 't2')!.currentShooterIndex).toBe(1);
      expect(ns.playerOrder[ns.currentTurnIndex]).toBe('a');
    });

    it('skips a fully dead team when the active shooter leaves', () => {
      const s = battleTeamState(
        ['a', 'b', 'c', 'd', 'e'],
        [
          { id: 't1', playerIds: ['a', 'b'] },
          { id: 't2', playerIds: ['c'] },
          { id: 't3', playerIds: ['d', 'e'] },
        ],
      );
      s.players.find((p) => p.playerId === 'c')!.alive = false;

      const result = engine.removePlayer(s, 'a');
      const ns = result.state!;

      expect(ns.currentTeamIndex).toBe(2);
      expect(ns.playerOrder[ns.currentTurnIndex]).toBe('d');
    });

    it('ends the game when the active shooter leaving wipes their team and only one survives', () => {
      const s = battleTeamState(
        ['a', 'b'],
        [
          { id: 't1', playerIds: ['a'] },
          { id: 't2', playerIds: ['b'] },
        ],
      );
      const result = engine.removePlayer(s, 'a');
      const ns = result.state!;

      expect(ns.winnerId).toBe('t2');
      expect(engine.isGameOver(ns)).toBe(true);
    });
  });

  describe('FFA mode', () => {
    it('advances currentTurnIndex when the active player leaves', () => {
      const s = engine.initializeState(['a', 'b', 'c']);
      s.phase = GAME_PHASE.BATTLE;
      const result = engine.removePlayer(s, 'a');
      const ns = result.state!;

      expect(ns.players.find((p) => p.playerId === 'a')!.alive).toBe(false);
      expect(ns.playerOrder[ns.currentTurnIndex]).toBe('b');
    });

    it('does not change currentTurnIndex when a non-active player leaves', () => {
      const s = engine.initializeState(['a', 'b', 'c']);
      s.phase = GAME_PHASE.BATTLE;
      const result = engine.removePlayer(s, 'b');
      const ns = result.state!;

      expect(ns.playerOrder[ns.currentTurnIndex]).toBe('a');
    });
  });
});
