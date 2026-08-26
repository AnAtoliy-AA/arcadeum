import { describe, it, expect } from 'vitest';
import { DOWNLOADABLE_GAMES } from './downloadable-games';
import { OFFLINE_GAME_SLUGS } from '@/features/offline/lib/offline-capable';
import { gameMetadata } from '@/features/games/registry';
import type { GameSlug } from '@/features/games/registry.types';

describe('DOWNLOADABLE_GAMES', () => {
  it('contains exactly one entry per OFFLINE_GAME_SLUGS slug (bot-mode games)', () => {
    const botSlugs = DOWNLOADABLE_GAMES.filter((g) => g.kind === 'bot').map(
      (g) => g.slug,
    );
    const expected = OFFLINE_GAME_SLUGS.map((e) => e.slug);
    expect(botSlugs.sort()).toEqual(expected.sort());
  });

  it('includes all four puzzle games', () => {
    const puzzleSlugs = DOWNLOADABLE_GAMES.filter(
      (g) => g.kind === 'puzzle',
    ).map((g) => g.slug);
    expect(puzzleSlugs.sort()).toEqual([
      '2048',
      'minesweeper',
      'solitaire',
      'sudoku',
    ]);
  });

  it('every bot-mode game has a matching gameMetadata entry', () => {
    for (const game of DOWNLOADABLE_GAMES.filter((g) => g.kind === 'bot')) {
      expect(gameMetadata[game.metadataKey as GameSlug]).toBeDefined();
    }
  });

  it('every puzzle game has a matching gameMetadata entry', () => {
    for (const game of DOWNLOADABLE_GAMES.filter((g) => g.kind === 'puzzle')) {
      expect(gameMetadata[game.metadataKey as GameSlug]).toBeDefined();
    }
  });

  it('route for bot-mode games points to /offline/<slug>', () => {
    const bot = DOWNLOADABLE_GAMES.find((g) => g.slug === 'chess');
    expect(bot?.route).toBe('offline/chess');
  });

  it('route for puzzle games points to /games/<slug>/play', () => {
    const puzzle = DOWNLOADABLE_GAMES.find((g) => g.slug === 'solitaire');
    expect(puzzle?.route).toBe('games/solitaire/play');
  });
});
