import {
  getActiveTeam,
  getActiveShooterId,
  advanceTeamRotationOnMiss,
  isTeamAlive,
  countAliveTeams,
} from './team-rotation.utils';
import { SeaBattleState, SeaBattleTeam } from './sea-battle.types';

function makeState(opts: {
  teams: { id: string; players: { id: string; alive: boolean }[] }[];
  currentTeamIndex?: number;
  shooterIndices?: Record<string, number>;
}): SeaBattleState {
  const teams: SeaBattleTeam[] = opts.teams.map((t) => ({
    id: t.id,
    name: t.id,
    color: '#000',
    playerIds: t.players.map((p) => p.id),
    currentShooterIndex: opts.shooterIndices?.[t.id] ?? 0,
  }));
  const allPlayers = opts.teams.flatMap((t) => t.players);
  return {
    phase: 'battle',
    players: allPlayers.map((p) => ({
      playerId: p.id,
      alive: p.alive,
      board: [],
      ships: [],
      shipsRemaining: p.alive ? 1 : 0,
      placementComplete: true,
    })),
    playerOrder: allPlayers.map((p) => p.id),
    currentTurnIndex: 0,
    teams,
    teamOrder: teams.map((t) => t.id),
    currentTeamIndex: opts.currentTeamIndex ?? 0,
    logs: [],
  } as SeaBattleState;
}

describe('team-rotation.utils', () => {
  describe('getActiveShooterId', () => {
    it("returns the active team's currentShooter playerId", () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: true },
              { id: 'b', alive: true },
            ],
          },
          { id: 't2', players: [{ id: 'c', alive: true }] },
        ],
        currentTeamIndex: 0,
        shooterIndices: { t1: 1 },
      });
      expect(getActiveShooterId(state)).toBe('b');
    });
  });

  describe('isTeamAlive', () => {
    it('returns true when at least one player on the team is alive', () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: false },
              { id: 'b', alive: true },
            ],
          },
        ],
      });
      expect(isTeamAlive(state, 't1')).toBe(true);
    });
    it('returns false when all team players are dead', () => {
      const state = makeState({
        teams: [{ id: 't1', players: [{ id: 'a', alive: false }] }],
      });
      expect(isTeamAlive(state, 't1')).toBe(false);
    });
  });

  describe('advanceTeamRotationOnMiss', () => {
    it("rotates the active team's shooter to the next alive teammate", () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: true },
              { id: 'b', alive: true },
            ],
          },
          {
            id: 't2',
            players: [
              { id: 'c', alive: true },
              { id: 'd', alive: true },
            ],
          },
        ],
        currentTeamIndex: 0,
      });
      advanceTeamRotationOnMiss(state);
      const t1 = state.teams!.find((t) => t.id === 't1')!;
      expect(t1.currentShooterIndex).toBe(1);
      expect(state.currentTeamIndex).toBe(1);
    });

    it('skips dead teammates when advancing shooter', () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: true },
              { id: 'b', alive: false },
              { id: 'c', alive: true },
            ],
          },
          { id: 't2', players: [{ id: 'd', alive: true }] },
        ],
        currentTeamIndex: 0,
      });
      advanceTeamRotationOnMiss(state);
      const t1 = state.teams!.find((t) => t.id === 't1')!;
      expect(t1.currentShooterIndex).toBe(2);
      expect(state.currentTeamIndex).toBe(1);
    });

    it('skips fully-eliminated teams when advancing team pointer', () => {
      const state = makeState({
        teams: [
          { id: 't1', players: [{ id: 'a', alive: true }] },
          { id: 't2', players: [{ id: 'b', alive: false }] },
          { id: 't3', players: [{ id: 'c', alive: true }] },
        ],
        currentTeamIndex: 0,
      });
      advanceTeamRotationOnMiss(state);
      expect(state.currentTeamIndex).toBe(2);
    });

    it('wraps shooter index correctly for single-survivor teams', () => {
      const state = makeState({
        teams: [
          {
            id: 't1',
            players: [
              { id: 'a', alive: false },
              { id: 'b', alive: true },
            ],
          },
          { id: 't2', players: [{ id: 'c', alive: true }] },
        ],
        currentTeamIndex: 0,
        shooterIndices: { t1: 1 },
      });
      advanceTeamRotationOnMiss(state);
      const t1 = state.teams!.find((t) => t.id === 't1')!;
      expect(t1.currentShooterIndex).toBe(1);
    });
  });

  describe('countAliveTeams', () => {
    it('counts only teams with at least one alive player', () => {
      const state = makeState({
        teams: [
          { id: 't1', players: [{ id: 'a', alive: true }] },
          { id: 't2', players: [{ id: 'b', alive: false }] },
          { id: 't3', players: [{ id: 'c', alive: true }] },
        ],
      });
      expect(countAliveTeams(state)).toBe(2);
    });
  });

  describe('getActiveTeam', () => {
    it('returns the team at currentTeamIndex', () => {
      const state = makeState({
        teams: [
          { id: 't1', players: [{ id: 'a', alive: true }] },
          { id: 't2', players: [{ id: 'b', alive: true }] },
        ],
        currentTeamIndex: 1,
      });
      expect(getActiveTeam(state)?.id).toBe('t2');
    });

    it('returns undefined when team mode is off', () => {
      const state = makeState({
        teams: [{ id: 't1', players: [{ id: 'a', alive: true }] }],
      });
      delete state.teams;
      expect(getActiveTeam(state)).toBeUndefined();
    });
  });
});
