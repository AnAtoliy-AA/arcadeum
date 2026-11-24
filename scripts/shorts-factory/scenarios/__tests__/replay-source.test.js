'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { detectDramaticMoment, fetchReplays } = require('../replay-source');

const act = (userId, message) => ({
  action: 'move',
  userId,
  payload: { message },
  timestamp: 't',
});
const mk = (actions, winner = 'a') => ({
  actions,
  result: { winnerIds: [winner], isDraw: false },
  players: [],
});

test('too short or empty replays have no dramatic moment', () => {
  assert.equal(detectDramaticMoment(null), null);
  assert.equal(detectDramaticMoment(mk([act('a', 'move')])), null);
});

test('detects a comeback when the winner trailed early then dominated', () => {
  const actions = [
    act('b', 'b captured a pawn'),
    act('a', 'a moves'),
    act('b', 'b captured a knight'),
    act('a', 'a moves'),
    act('b', 'b captured a rook'),
    act('a', 'a moves'),
    act('a', 'a captured a queen'),
    act('a', 'a captured a rook'),
    act('a', 'a combo x3'),
    act('a', 'checkmate, a wins'),
  ];
  const m = detectDramaticMoment(mk(actions));
  assert.equal(m.kind, 'comeback');
  assert.ok(m.step >= 6);
});

test('detects a last move win', () => {
  const actions = [
    act('b', 'b captured a pawn'),
    act('a', 'a moves'),
    act('b', 'b captured a knight'),
    act('a', 'a moves'),
    act('b', 'b moves'),
    act('a', 'a moves'),
    act('b', 'b moves'),
    act('a', 'a captured the flag and wins'),
  ];
  const m = detectDramaticMoment(mk(actions));
  assert.equal(m.kind, 'last_second_win');
  assert.equal(m.step, actions.length - 1);
});

test('falls back to a replay highlight on the biggest capture', () => {
  const actions = [
    act('a', 'a moves'),
    act('b', 'b moves'),
    act('a', 'a captured a pawn'),
    act('b', 'b moves'),
    act('a', 'a moves'),
    act('b', 'b moves'),
  ];
  const m = detectDramaticMoment(mk(actions));
  assert.equal(m.kind, 'replay_highlight');
  assert.equal(m.step, 2);
});

test('fetchReplays never throws and returns [] on http errors or no api', async () => {
  assert.deepEqual(await fetchReplays({}), []);
  const http = {
    get: async () => {
      throw new Error('down');
    },
  };
  assert.deepEqual(await fetchReplays({ baseApiUrl: 'http://x', http }), []);
});

test('fetchReplays loads details for finished replays only', async () => {
  const calls = [];
  const http = {
    get: async (url) => {
      calls.push(url);
      if (url.endsWith('/games/replays'))
        return {
          data: {
            entries: [
              { replayId: 'r1', result: {}, totalMoves: 20 },
              { replayId: 'r2', totalMoves: 20 },
            ],
          },
        };
      return { data: { replay: { replayId: 'r1', actions: [] } } };
    },
  };
  const out = await fetchReplays({
    baseApiUrl: 'http://x/',
    gameId: 'chess_v1',
    http,
  });
  assert.equal(out.length, 1);
  assert.equal(calls.length, 2);
});
