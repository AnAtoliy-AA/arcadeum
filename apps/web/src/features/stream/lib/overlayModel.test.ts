import { describe, expect, it } from 'vitest';
import type { GameRoomSummary, GameSessionSummary } from '@/shared/types/games';
import { buildOverlayModel } from './overlayModel';

const members = (ids: string[]) =>
  ids.map((id, i) => ({
    id,
    displayName: `Bot ${i + 1}`,
    isHost: i === 0,
  }));

function room(
  gameId: string,
  ids: string[],
  gameOptions: Record<string, unknown> = {},
): GameRoomSummary {
  return {
    id: 'r1',
    gameId,
    name: 'AI vs AI',
    hostId: ids[0],
    visibility: 'public',
    playerCount: ids.length,
    maxPlayers: ids.length,
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'in_progress',
    gameOptions: { aiVsAi: true, botDifficulty: 'expert', ...gameOptions },
    members: members(ids),
  };
}

function session(
  gameId: string,
  state: Record<string, unknown>,
  status: GameSessionSummary['status'] = 'active',
): GameSessionSummary {
  return {
    id: 's1',
    roomId: 'r1',
    gameId,
    engine: gameId,
    status,
    state,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:05.000Z',
  };
}

const AB = ['bot-a', 'bot-b'];
const ABCD = ['bot-a', 'bot-b', 'bot-c', 'bot-d'];
const seats = (ids: string[]) => ids.map((playerId) => ({ playerId }));

describe('buildOverlayModel', () => {
  it('returns null until the room or session names a game', () => {
    expect(buildOverlayModel(null, null)).toBeNull();
  });

  it('shows the roster as waiting before a session exists', () => {
    const model = buildOverlayModel(
      { ...room('chess_v1', AB), status: 'lobby' },
      null,
    );
    expect(model?.phase).toBe('waiting');
    expect(model?.players.map((p) => p.name)).toEqual(['Bot 1', 'Bot 2']);
    expect(model?.players.every((p) => p.isBot)).toBe(true);
  });

  describe('chess', () => {
    const state = {
      players: [
        { playerId: 'bot-a', color: 'white' },
        { playerId: 'bot-b', color: 'black' },
      ],
      currentTurnColor: 'black',
      moveHistory: [
        { piece: { type: 'pawn', color: 'white' }, captured: null },
        {
          piece: { type: 'knight', color: 'black' },
          captured: { type: 'pawn', color: 'white' },
        },
        {
          piece: { type: 'queen', color: 'white' },
          captured: { type: 'rook', color: 'black' },
        },
      ],
    };

    it('reports turn, move count, captured glyphs and material lead', () => {
      const model = buildOverlayModel(
        room('chess_v1', AB),
        session('chess_v1', state),
      );
      expect(model?.phase).toBe('active');
      expect(model?.moveCount).toBe(3);
      const [white, black] = model!.players;
      expect(white.side).toBe('white');
      expect(white.capturedGlyphs).toBe('♜');
      expect(white.score).toBe(4); // rook (5) minus pawn (1)
      expect(black.capturedGlyphs).toBe('♟');
      expect(black.score).toBeNull();
      expect(black.active).toBe(true);
      expect(white.active).toBe(false);
    });

    it('labels bots with their chess personality when known', () => {
      const model = buildOverlayModel(
        room('chess_v1', AB, {
          botPersonalityWhite: 'does-not-exist',
          botPersonalityBlack: 'does-not-exist',
        }),
        session('chess_v1', state),
      );
      // Unknown ids fall back to the difficulty label, never a blank.
      expect(model?.players[0].personality).toEqual({
        kind: 'difficulty',
        level: 'expert',
      });
    });

    it('names the winner by colour when the game ends', () => {
      const model = buildOverlayModel(
        room('chess_v1', AB),
        session('chess_v1', { ...state, winnerColor: 'white' }, 'completed'),
      );
      expect(model?.phase).toBe('finished');
      expect(model?.outcome).toEqual({ kind: 'win', winnerNames: ['Bot 1'] });
      expect(model?.players[0].isWinner).toBe(true);
    });
  });

  it('checkers: pieces remaining and whose turn', () => {
    const model = buildOverlayModel(
      room('checkers_v1', AB),
      session('checkers_v1', {
        phase: 'playing',
        players: [
          { playerId: 'bot-a', color: 'light', piecesRemaining: 9 },
          { playerId: 'bot-b', color: 'dark', piecesRemaining: 11 },
        ],
        playerOrder: AB,
        currentTurnIndex: 1,
      }),
    );
    expect(model?.players[0].stats).toEqual([{ key: 'piecesLeft', value: 9 }]);
    expect(model?.players[1].active).toBe(true);
  });

  it('tic-tac-toe: symbols and a draw', () => {
    const model = buildOverlayModel(
      room('tic_tac_toe_v1', AB),
      session(
        'tic_tac_toe_v1',
        {
          phase: 'finished',
          players: [
            { playerId: 'bot-a', symbol: 'X' },
            { playerId: 'bot-b', symbol: 'O' },
          ],
          playerOrder: AB,
          currentTurnIndex: 0,
          isDraw: true,
          winnerId: null,
        },
        'completed',
      ),
    );
    expect(model?.players.map((p) => p.side)).toEqual(['X', 'O']);
    expect(model?.outcome).toEqual({ kind: 'draw', winnerNames: [] });
    expect(model?.players.some((p) => p.active)).toBe(false);
  });

  it('go: captures per colour as the score', () => {
    const model = buildOverlayModel(
      room('go_v1', AB),
      session('go_v1', {
        phase: 'playing',
        players: [
          { playerId: 'bot-a', color: 'black' },
          { playerId: 'bot-b', color: 'white' },
        ],
        captures: { black: 3, white: 1 },
        playerOrder: AB,
        currentTurnIndex: 0,
      }),
    );
    expect(model?.players.map((p) => p.score)).toEqual([3, 1]);
  });

  it('backgammon: borne off per player', () => {
    const model = buildOverlayModel(
      room('backgammon_v1', AB),
      session('backgammon_v1', {
        phase: 'playing',
        players: [
          { playerId: 'bot-a', color: 'white' },
          { playerId: 'bot-b', color: 'black' },
        ],
        borneOff: { 'bot-a': 4, 'bot-b': 0 },
        playerOrder: AB,
        currentTurnIndex: 0,
      }),
    );
    expect(model?.players[0].stats).toContainEqual({
      key: 'borneOff',
      value: 4,
    });
  });

  it('pachisi: tokens home, 4 seats, multiple winners', () => {
    const model = buildOverlayModel(
      room('pachisi_v1', ABCD),
      session(
        'pachisi_v1',
        {
          phase: 'finished',
          players: ABCD.map((playerId, seat) => ({
            playerId,
            seat,
            color: ['red', 'green', 'yellow', 'blue'][seat],
          })),
          tokens: {
            'bot-a': [
              { id: 0, progress: 56 },
              { id: 1, progress: 12 },
            ],
            'bot-b': [{ id: 0, progress: -1 }],
          },
          playerOrder: ABCD,
          currentTurnIndex: 0,
          winnerIds: ['bot-a'],
          winnerId: 'bot-a',
        },
        'completed',
      ),
    );
    expect(model?.players).toHaveLength(4);
    expect(model?.players[0].stats).toEqual([{ key: 'tokensHome', value: 1 }]);
    expect(model?.outcome.winnerNames).toEqual(['Bot 1']);
  });

  it('cat dash: turn from currentPlayerIndex, winner from winner id', () => {
    const base = {
      players: [
        { playerId: 'bot-a', position: 4 },
        { playerId: 'bot-b', position: 9 },
      ],
      currentPlayerIndex: 1,
      gameOver: false,
    };
    const live = buildOverlayModel(
      room('cat_dash_v1', AB),
      session('cat_dash_v1', base),
    );
    expect(live?.players[1].active).toBe(true);
    const done = buildOverlayModel(
      room('cat_dash_v1', AB),
      session('cat_dash_v1', { ...base, gameOver: true, winner: 'bot-b' }),
    );
    expect(done?.phase).toBe('finished');
    expect(done?.outcome.winnerNames).toEqual(['Bot 2']);
  });

  it('sea battle and critical: active seat from playerOrder', () => {
    for (const gameId of ['sea_battle_v1', 'critical_v1']) {
      const model = buildOverlayModel(
        room(gameId, AB),
        session(gameId, {
          phase: 'playing',
          players: seats(AB),
          playerOrder: AB,
          currentTurnIndex: 1,
        }),
      );
      expect(model?.players.find((p) => p.active)?.id).toBe('bot-b');
    }
  });

  describe('card games never expose private hands', () => {
    const hand = ['AS', 'KH', 'QD'];

    it('hearts: scores and a card count, never card faces', () => {
      const model = buildOverlayModel(
        room('hearts_v1', ABCD),
        session('hearts_v1', {
          phase: 'playing',
          players: seats(ABCD),
          playerOrder: ABCD,
          currentTurnIndex: 2,
          hands: Object.fromEntries(ABCD.map((id) => [id, hand])),
          scores: { 'bot-a': 12, 'bot-b': 0, 'bot-c': 5, 'bot-d': 1 },
        }),
      );
      expect(model?.players[0].score).toBe(12);
      expect(model?.players[0].stats).toEqual([{ key: 'cards', value: 3 }]);
      expect(model?.players[2].active).toBe(true);
      expect(JSON.stringify(model)).not.toMatch(/AS|KH|QD/);
    });

    it('spades: bids are public, hands are not', () => {
      const model = buildOverlayModel(
        room('spades_v1', ABCD),
        session('spades_v1', {
          phase: 'playing',
          players: seats(ABCD),
          playerOrder: ABCD,
          currentTurnIndex: 0,
          hands: Object.fromEntries(ABCD.map((id) => [id, hand])),
          bids: { 'bot-a': 3, 'bot-b': null, 'bot-c': 0, 'bot-d': 2 },
          scores: {},
        }),
      );
      expect(model?.players[0].stats).toContainEqual({ key: 'bid', value: 3 });
      expect(model?.players[1].stats.some((s) => s.key === 'bid')).toBe(false);
      expect(JSON.stringify(model)).not.toMatch(/AS|KH|QD/);
    });

    it('cascade: hand size only', () => {
      const model = buildOverlayModel(
        room('cascade_v1', AB),
        session('cascade_v1', {
          phase: 'playing',
          players: [
            {
              playerId: 'bot-a',
              hand: [{ id: 'secret-1' }, { id: 'secret-2' }],
            },
            { playerId: 'bot-b', hand: [{ id: 'secret-3' }] },
          ],
          playerOrder: AB,
          currentTurnIndex: 0,
        }),
      );
      expect(model?.players[0].stats).toEqual([{ key: 'cards', value: 2 }]);
      expect(JSON.stringify(model)).not.toContain('secret');
    });
  });

  it('changes progressToken whenever the position changes', () => {
    const a = buildOverlayModel(
      room('chess_v1', AB),
      session('chess_v1', { players: [], moveHistory: [] }),
    );
    const b = buildOverlayModel(
      room('chess_v1', AB),
      session('chess_v1', { players: [], moveHistory: [{}] }),
    );
    expect(a?.progressToken).not.toBe(b?.progressToken);
  });

  it('survives garbage state without throwing', () => {
    const model = buildOverlayModel(
      room('go_v1', AB),
      session('go_v1', { players: 'nope', captures: 5 } as never),
    );
    expect(model?.phase).toBe('active');
    expect(model?.players.map((p) => p.name)).toEqual(['Bot 1', 'Bot 2']);
  });
});
