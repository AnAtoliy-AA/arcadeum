import { describe, expect, it } from 'vitest';
import { getVisibleOpponents } from './index';

const players = [
  { playerId: 'me', alive: true },
  { playerId: 'winner', alive: true },
  { playerId: 'eliminated', alive: false },
];

describe('getVisibleOpponents', () => {
  it('hides eliminated opponents during an active game', () => {
    expect(getVisibleOpponents(players, 'me', false)).toEqual([players[1]]);
  });

  it('shows all opponents after the game ends', () => {
    expect(getVisibleOpponents(players, 'me', true)).toEqual([
      players[1],
      players[2],
    ]);
  });
});
