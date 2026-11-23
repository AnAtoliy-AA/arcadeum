'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalisePuzzle,
  fetchPuzzle,
  BUNDLED,
  pickBundled,
} = require('../puzzles');
const { parseFen, applyUci } = require('../chess-board');
const { puzzleScene, replayScene } = require('../scene-html');
const { buildScenario } = require('../library');

test('bundled puzzles are well formed and their moves apply', () => {
  for (const p of BUNDLED) {
    let { board } = parseFen(p.fen);
    for (const m of p.solution) board = applyUci(board, m);
    assert.ok(p.solution.length >= 1);
  }
});

test('normalisePuzzle plays the opponent setup move first', () => {
  const raw = {
    puzzleId: 'abc',
    fen: '4k3/8/8/8/8/8/4p3/4K2R b - - 0 1',
    moves: ['e2e1q', 'h1h8'],
    rating: 900,
  };
  const p = normalisePuzzle(raw);
  assert.equal(p.id, 'abc');
  assert.deepEqual(p.solution, ['h1h8']);
  assert.ok(p.fen.startsWith('4k3/8/8/8/8/8/8/4q2R w'));
  assert.equal(normalisePuzzle({}), null);
  assert.equal(normalisePuzzle({ fen: 'bad', moves: ['a1a2', 'a2a3'] }), null);
});

test('fetchPuzzle falls back to bundled data when the API fails', async () => {
  const http = {
    get: async () => {
      throw new Error('down');
    },
  };
  const p = await fetchPuzzle({ baseApiUrl: 'http://x', seed: 7, http });
  assert.equal(p.source, 'bundled');
  assert.equal((await fetchPuzzle({ seed: 7 })).id, pickBundled(7).id);
});

test('fetchPuzzle returns an API puzzle when valid', async () => {
  const http = {
    get: async () => ({
      data: {
        puzzleId: 'p1',
        fen: '4k3/8/8/8/8/8/4p3/4K2R b - - 0 1',
        moves: ['e2e1q', 'h1h8'],
        rating: 900,
      },
    }),
  };
  const p = await fetchPuzzle({ baseApiUrl: 'http://x', seed: 1, http });
  assert.equal(p.source, 'api');
});

test('puzzle scene has content in the first frame, no loading state, hook included', () => {
  const scenario = {
    ...buildScenario('chess', 'puzzle', 'cyberpunk'),
    seed: 1,
  };
  const html = puzzleScene({ scenario, puzzle: BUNDLED[0] });
  assert.ok(html.includes(scenario.hook));
  assert.ok(html.includes('1080'));
  assert.ok(html.includes('window.__sceneDone'));
  assert.ok(html.includes('__sceneMarkerMs'));
  assert.ok(!html.includes('—'));
});

test('replay scene escapes hostile log text', () => {
  const scenario = {
    ...buildScenario('chess', 'replay_highlight', 'default'),
    seed: 1,
  };
  const replay = {
    players: [{ id: 'a', displayName: '<img src=x onerror=1>' }],
    result: { winnerIds: ['a'] },
    actions: Array.from({ length: 8 }, () => ({
      userId: 'a',
      payload: { message: '</script><b>x' },
    })),
  };
  const html = replayScene({
    scenario,
    replay,
    moment: { step: 5, label: 'x' },
  });
  assert.ok(!html.includes('</script><b>'));
});
