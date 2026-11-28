import { describe, it, expect } from 'vitest';
import { canShowEngineAids } from './engine-aids';
import type { ChessPlayer } from '../types';

const human = (id: string, color: 'white' | 'black'): ChessPlayer => ({
  playerId: id,
  color,
  isBot: false,
});
const bot = (id: string, color: 'white' | 'black'): ChessPlayer => ({
  playerId: id,
  color,
  isBot: true,
});

describe('canShowEngineAids', () => {
  const pvp = { players: [human('me', 'white'), human('opp', 'black')] };
  const pve = { players: [human('me', 'white'), bot('bot', 'black')] };

  it('hides aids from a seated player facing a human mid-game', () => {
    expect(
      canShowEngineAids({
        snapshot: pvp,
        currentUserId: 'me',
        isSpectator: false,
        isGameOver: false,
      }),
    ).toBe(false);
  });

  it('shows aids once the game is over', () => {
    expect(
      canShowEngineAids({
        snapshot: pvp,
        currentUserId: 'me',
        isSpectator: false,
        isGameOver: true,
      }),
    ).toBe(true);
  });

  it('shows aids to spectators', () => {
    expect(
      canShowEngineAids({
        snapshot: pvp,
        currentUserId: 'watcher',
        isSpectator: true,
        isGameOver: false,
      }),
    ).toBe(true);
  });

  it('treats a non-seated viewer as a spectator', () => {
    expect(
      canShowEngineAids({
        snapshot: pvp,
        currentUserId: 'watcher',
        isSpectator: false,
        isGameOver: false,
      }),
    ).toBe(true);
  });

  it('allows aids in practice games against bots only', () => {
    expect(
      canShowEngineAids({
        snapshot: pve,
        currentUserId: 'me',
        isSpectator: false,
        isGameOver: false,
      }),
    ).toBe(true);
  });

  it('hides aids while the snapshot is loading', () => {
    expect(
      canShowEngineAids({
        snapshot: null,
        currentUserId: 'me',
        isSpectator: false,
        isGameOver: false,
      }),
    ).toBe(false);
  });
});
