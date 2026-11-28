import { PachisiEngine } from './pachisi.engine';
import { ACTION, GAME_PHASE } from './pachisi.constants';
import type { GameActionContext } from '../base/game-engine.interface';
import type { PachisiState } from '@arcadeum/games-core/games/pachisi/pachisi.types';
import { PachisiBot } from '@arcadeum/games-core/games/pachisi/pachisi-bot';
import {
  controllableOwners,
  getAllLegalMoves,
  partnerOf,
} from '@arcadeum/games-core/games/pachisi/pachisi.utils';

const [A1, B1, A2, B2] = ['a1', 'b1', 'a2', 'b2']; // seats 0,1,2,3
const FINISH = 56;

const ctx = (userId: string): GameActionContext => ({
  userId,
  roomId: 'room-1',
  sessionId: 'session-1',
  timestamp: new Date(),
});

function newGame(teams = true, players = [A1, B1, A2, B2]): PachisiState {
  const engine = new PachisiEngine(() => 1);
  const state = engine.initializeState(players, { options: { teams } });
  state.currentTurnIndex = 0;
  return state;
}

function setProgress(state: PachisiState, pid: string, values: number[]) {
  values.forEach((p, i) => {
    state.tokens[pid][i].progress = p;
  });
}

/** Roll `die` for the current player, returning the new state. */
function roll(state: PachisiState, die: number): PachisiState {
  const engine = new PachisiEngine(() => die);
  const pid = state.playerOrder[state.currentTurnIndex];
  const res = engine.executeAction(state, ACTION.ROLL_DICE, ctx(pid));
  expect(res.success).toBe(true);
  return res.state!;
}

function move(
  state: PachisiState,
  pid: string,
  tokenId: number,
  ownerId?: string,
) {
  const engine = new PachisiEngine(() => 1);
  return engine.executeAction(
    state,
    ACTION.MOVE_TOKEN,
    ctx(pid),
    ownerId ? { tokenId, ownerId } : { tokenId },
  );
}

describe('Pachisi teams (2v2)', () => {
  describe('setup', () => {
    it('enables team mode only with exactly 4 players', () => {
      expect(newGame(true).teamMode).toBe(true);
      expect(newGame(true, [A1, B1]).teamMode).toBe(false);
      expect(newGame(true, [A1, B1, A2]).teamMode).toBe(false);
      expect(newGame(false).teamMode).toBe(false);
    });

    it('normalizes options.teams to false when ignored', () => {
      expect(newGame(true, [A1, B1]).options.teams).toBe(false);
    });

    it('seats partners opposite: seats 0/2 are team 0, seats 1/3 team 1', () => {
      const state = newGame();
      expect(state.players.map((p) => [p.playerId, p.team])).toEqual([
        [A1, 0],
        [B1, 1],
        [A2, 0],
        [B2, 1],
      ]);
      expect(partnerOf(state, A1)).toBe(A2);
      expect(partnerOf(state, B2)).toBe(B1);
    });

    it('has no partners or team fields when teams are off', () => {
      const state = newGame(false);
      expect(partnerOf(state, A1)).toBeNull();
      expect(state.players.every((p) => p.team === undefined)).toBe(true);
    });

    it('turns alternate between teams', () => {
      const state = newGame();
      const teams = state.playerOrder.map(
        (id) => state.players.find((p) => p.playerId === id)!.team,
      );
      expect(teams).toEqual([0, 1, 0, 1]);
    });

    it('validates the teams option type', () => {
      const engine = new PachisiEngine();
      expect(engine.validateConfig({ options: { teams: true } })).toBe(true);
      expect(engine.validateConfig({ options: { teams: 'yes' } })).toBe(false);
    });
  });

  describe('captures', () => {
    // Cell 10 is not a star or a start cell. a1 (seat 0) progress 10 -> cell 10.
    // b1 (seat 1, offset 13) progress 49 -> cell 10. a2 (seat 2, offset 26)
    // progress 36 -> cell 10.
    it('partners can share a cell and never capture each other', () => {
      const state = newGame();
      setProgress(state, A1, [6, -1, -1, -1]);
      setProgress(state, A2, [36, -1, -1, -1]);
      const s = roll(state, 4);
      const res = move(s, A1, 0);
      expect(res.success).toBe(true);
      expect(res.state!.tokens[A1][0].progress).toBe(10);
      expect(res.state!.tokens[A2][0].progress).toBe(36); // not sent home
    });

    it('still captures opponents on the same cell', () => {
      const state = newGame();
      setProgress(state, A1, [6, -1, -1, -1]);
      setProgress(state, B1, [49, -1, -1, -1]);
      const res = move(roll(state, 4), A1, 0);
      expect(res.state!.tokens[A1][0].progress).toBe(10);
      expect(res.state!.tokens[B1][0].progress).toBe(-1);
    });

    it('opponents capture a partner token (only teammates are immune)', () => {
      const state = newGame();
      state.currentTurnIndex = 1; // b1 to move
      // b1 progress 45 + 4 = 49 -> cell (13+49)%52 = 10; a2 progress 36 -> cell 10
      setProgress(state, B1, [45, -1, -1, -1]);
      setProgress(state, A2, [36, -1, -1, -1]);
      const res = move(roll(state, 4), B1, 0);
      expect(res.state!.tokens[A2][0].progress).toBe(-1);
    });

    it('in a non-team 4-player game every other player is capturable', () => {
      const state = newGame(false);
      setProgress(state, A1, [6, -1, -1, -1]);
      setProgress(state, A2, [36, -1, -1, -1]);
      const res = move(roll(state, 4), A1, 0);
      expect(res.state!.tokens[A2][0].progress).toBe(-1);
    });
  });

  describe("moving the partner's tokens", () => {
    function finishedA1(): PachisiState {
      const state = newGame();
      setProgress(state, A1, [FINISH, FINISH, FINISH, FINISH]);
      setProgress(state, A2, [10, -1, -1, -1]);
      return state;
    }

    it("a player with unfinished tokens cannot touch the partner's", () => {
      const state = newGame();
      setProgress(state, A1, [5, -1, -1, -1]);
      setProgress(state, A2, [10, -1, -1, -1]);
      const rolled = roll(state, 3);
      expect(controllableOwners(rolled, A1)).toEqual([A1]);
      const res = move(rolled, A1, 0, A2);
      expect(res.success).toBe(false);
    });

    it("a finished player moves the partner's tokens on their turn", () => {
      const rolled = roll(finishedA1(), 3);
      expect(controllableOwners(rolled, A1)).toEqual([A1, A2]);
      expect(getAllLegalMoves(rolled, A1)).toEqual([
        { tokenId: 0, ownerId: A2 },
      ]);
      const res = move(rolled, A1, 0, A2);
      expect(res.success).toBe(true);
      expect(res.state!.tokens[A2][0].progress).toBe(13);
      expect(res.state!.currentTurnIndex).toBe(1); // turn passes to opponent
    });

    it('a 6 gives another roll and can release a partner token from the yard', () => {
      const rolled = roll(finishedA1(), 6);
      const res = move(rolled, A1, 1, A2);
      expect(res.success).toBe(true);
      expect(res.state!.tokens[A2][1].progress).toBe(0);
      expect(res.state!.phase).toBe(GAME_PHASE.ROLL);
      expect(res.state!.currentTurnIndex).toBe(0);
    });

    it("cannot move an opponent's tokens", () => {
      const rolled = roll(finishedA1(), 3);
      setProgress(rolled, B1, [10, -1, -1, -1]);
      expect(move(rolled, A1, 0, B1).success).toBe(false);
    });

    it('passes the turn when neither own nor partner tokens can move', () => {
      const state = finishedA1();
      setProgress(state, A2, [-1, -1, -1, -1]);
      const engine = new PachisiEngine(() => 3);
      const res = engine.executeAction(state, ACTION.ROLL_DICE, ctx(A1));
      expect(res.state!.phase).toBe(GAME_PHASE.ROLL);
      expect(res.state!.currentTurnIndex).toBe(1);
    });

    it('rejects a non-string ownerId', () => {
      const rolled = roll(finishedA1(), 3);
      const engine = new PachisiEngine();
      expect(
        engine.validateAction(rolled, ACTION.MOVE_TOKEN, ctx(A1), {
          tokenId: 0,
          ownerId: 42,
        }),
      ).toBe(false);
    });

    it("a finished player's partner moves are captured normally by opponents", () => {
      const state = finishedA1();
      state.currentTurnIndex = 1;
      setProgress(state, B1, [45, -1, -1, -1]);
      setProgress(state, A2, [36, -1, -1, -1]);
      const res = move(roll(state, 4), B1, 0);
      expect(res.state!.tokens[A2][0].progress).toBe(-1);
    });
  });

  describe('winning', () => {
    it('does not end the game when only one partner has finished', () => {
      const state = newGame();
      setProgress(state, A1, [FINISH, FINISH, FINISH, 53]);
      setProgress(state, A2, [10, 10, 10, 10]);
      const res = move(roll(state, 3), A1, 3);
      expect(res.state!.tokens[A1][3].progress).toBe(FINISH);
      expect(res.state!.phase).not.toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerIds).toEqual([]);
    });

    it('ends when the last partner token comes home, awarding both partners', () => {
      const state = newGame();
      setProgress(state, A1, [FINISH, FINISH, FINISH, FINISH]);
      setProgress(state, A2, [FINISH, FINISH, FINISH, 53]);
      // a1 (finished) moves a2's last token home with a 3.
      const res = move(roll(state, 3), A1, 3, A2);
      expect(res.success).toBe(true);
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerIds.sort()).toEqual([A1, A2].sort());
      expect(res.state!.winnerTeam).toBe(0);
      expect(new PachisiEngine().getWinners(res.state!).sort()).toEqual(
        [A1, A2].sort(),
      );
    });

    it('team 1 can win too', () => {
      const state = newGame();
      state.currentTurnIndex = 1;
      setProgress(state, B1, [FINISH, FINISH, FINISH, 53]);
      setProgress(state, B2, [FINISH, FINISH, FINISH, FINISH]);
      const res = move(roll(state, 3), B1, 3);
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerTeam).toBe(1);
      expect(res.state!.winnerIds.sort()).toEqual([B1, B2].sort());
    });

    it('without teams a single player finishing still wins alone', () => {
      const state = newGame(false);
      setProgress(state, A1, [FINISH, FINISH, FINISH, 53]);
      const res = move(roll(state, 3), A1, 3);
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerIds).toEqual([A1]);
      expect(res.state!.winnerTeam).toBeNull();
    });

    it('quick mode (2 tokens) works with teams', () => {
      const engine = new PachisiEngine(() => 3);
      const state = engine.initializeState([A1, B1, A2, B2], {
        options: { teams: true, mode: 'quick' },
      });
      state.currentTurnIndex = 0;
      setProgress(state, A1, [FINISH, FINISH]);
      setProgress(state, A2, [FINISH, 53]);
      const rolled = roll(state, 3);
      const res = move(rolled, A1, 1, A2);
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
    });
  });

  describe('forfeit', () => {
    it("the forfeiting player's whole team loses", () => {
      const state = newGame();
      const engine = new PachisiEngine();
      const res = engine.executeAction(state, ACTION.FORFEIT, ctx(B1));
      expect(res.state!.phase).toBe(GAME_PHASE.GAME_OVER);
      expect(res.state!.winnerIds.sort()).toEqual([A1, A2].sort());
      expect(res.state!.winnerTeam).toBe(0);
    });

    it('without teams forfeit still awards all other players', () => {
      const state = newGame(false);
      const engine = new PachisiEngine();
      const res = engine.executeAction(state, ACTION.FORFEIT, ctx(B1));
      expect(res.state!.winnerIds.sort()).toEqual([A1, A2, B2].sort());
    });
  });

  describe('bot', () => {
    it("moves the partner's tokens once its own are home", () => {
      const state = newGame();
      state.options.aiDifficulty = 'hard';
      setProgress(state, A1, [FINISH, FINISH, FINISH, FINISH]);
      setProgress(state, A2, [10, 20, -1, -1]);
      const rolled = roll(state, 3);
      const pick = new PachisiBot().pickMove(rolled, A1);
      expect(pick).not.toBeNull();
      expect(pick!.ownerId).toBe(A2);
      expect(move(rolled, A1, pick!.tokenId, pick!.ownerId).success).toBe(true);
    });

    it('does not count teammates as danger or capture targets', () => {
      const state = newGame();
      state.options.aiDifficulty = 'expert';
      setProgress(state, A1, [6, -1, -1, -1]);
      setProgress(state, A2, [36, -1, -1, -1]);
      const rolled = roll(state, 4);
      const pick = new PachisiBot().pickMove(rolled, A1);
      expect(pick).toEqual({ tokenId: 0 });
    });
  });
});
