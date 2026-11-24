'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { Rotation } = require('../rotation');
const { GAMES, validateGames } = require('../games');

const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

test('config covers the 12 AI-vs-AI games and excludes unsupported ones', () => {
  assert.equal(GAMES.length, 12);
  const ids = GAMES.map((g) => g.id);
  assert.ok(!ids.includes('texas_holdem_v1') && !ids.includes('glimworm_v1'));
  assert.deepEqual(validateGames(GAMES), []);
  assert.ok(GAMES.every((g) => g.moveDelayMs === 2000));
});

test('validateGames rejects excluded, bad delay and duplicates', () => {
  const bad = [
    { id: 'glimworm_v1', moveDelayMs: 2000, maxDurationMs: 1, themes: ['a'] },
    { id: 'chess_v1', moveDelayMs: 3000, maxDurationMs: 1, themes: ['a'] },
    { id: 'chess_v1', moveDelayMs: 2000, maxDurationMs: 1, themes: ['a'] },
  ];
  const p = validateGames(bad).join('|');
  assert.match(p, /not supported/);
  assert.match(p, /moveDelayMs/);
  assert.match(p, /duplicate/);
});

test('never plays the same game back to back, across many bags', () => {
  const r = new Rotation({ games: GAMES, rng: seeded(7) });
  let prev = null;
  for (let i = 0; i < 500; i++) {
    const { game } = r.next();
    assert.notEqual(game.id, prev);
    prev = game.id;
  }
});

test('every game appears once per cycle', () => {
  const r = new Rotation({ games: GAMES, rng: seeded(3) });
  const first = new Set();
  for (let i = 0; i < GAMES.length; i++) first.add(r.next().game.id);
  assert.equal(first.size, GAMES.length);
});

test('themes rotate per game and differ from the previous game theme', () => {
  const games = [
    { id: 'a', themes: ['x', 'y', 'z'] },
    { id: 'b', themes: ['x', 'y', 'z'] },
  ];
  const r = new Rotation({ games, rng: seeded(1) });
  const picks = [];
  for (let i = 0; i < 12; i++) picks.push(r.next());
  for (let i = 1; i < picks.length; i++)
    assert.notEqual(picks[i].theme, picks[i - 1].theme);
  const aThemes = new Set(
    picks.filter((p) => p.game.id === 'a').map((p) => p.theme),
  );
  assert.ok(aThemes.size > 1);
});

test('peek returns the game next() will return', () => {
  const r = new Rotation({ games: GAMES, rng: seeded(9) });
  for (let i = 0; i < 30; i++) {
    const p = r.peek();
    assert.equal(r.next().game.id, p.id);
  }
});

test('rotation needs two games', () => {
  assert.throws(() => new Rotation({ games: [GAMES[0]] }));
});
