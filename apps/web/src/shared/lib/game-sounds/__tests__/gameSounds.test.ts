import { describe, it, expect, beforeEach } from 'vitest';
import { gameSounds } from '../GameSoundManager';
import { getGameSounds, getSoundEntry } from '../gameSoundRegistry';
import type { GameSoundId } from '../gameSoundTypes';

describe('GameSoundManager & Registry', () => {
  beforeEach(() => {
    gameSounds.setMuted(false);
    gameSounds.setVolume(0.5);
  });

  it('exposes mute controls correctly', () => {
    expect(gameSounds.isMuted()).toBe(false);
    gameSounds.setMuted(true);
    expect(gameSounds.isMuted()).toBe(true);
    gameSounds.toggleMute();
    expect(gameSounds.isMuted()).toBe(false);
  });

  it('clamps volume between 0 and 1', () => {
    gameSounds.setVolume(1.5);
    expect(gameSounds.getVolume()).toBe(1);
    gameSounds.setVolume(-0.5);
    expect(gameSounds.getVolume()).toBe(0);
    gameSounds.setVolume(0.7);
    expect(gameSounds.getVolume()).toBe(0.7);
  });

  it('returns valid sound entries for registered sounds', () => {
    const click = getSoundEntry('click');
    expect(click).toBeDefined();
    expect(click?.file).toContain('/sounds/shared/click.wav');

    const invalid = getSoundEntry('nonexistent_sound' as GameSoundId);
    expect(invalid).toBeUndefined();
  });

  it('registers all 18 games in GAME_SOUND_TYPES', () => {
    const expectedGames = [
      'solitaire_v1',
      'minesweeper_v1',
      'sudoku_v1',
      'game_2048_v1',
      'hearts_v1',
      'spades_v1',
      'cascade_v1',
      'critical_v1',
      'chess_v1',
      'chess_puzzles_v1',
      'checkers_v1',
      'backgammon_v1',
      'go_v1',
      'pachisi_v1',
      'tic_tac_toe_v1',
      'sea_battle_v1',
      'glimworm_v1',
      'cat_dash_v1',
    ];

    for (const gameId of expectedGames) {
      const sounds = getGameSounds(gameId);
      expect(sounds.length).toBeGreaterThan(0);
      for (const soundId of sounds) {
        expect(getSoundEntry(soundId)).toBeDefined();
      }
    }
  });

  it('does not throw when play is called while muted', () => {
    gameSounds.setMuted(true);
    expect(() => gameSounds.play('click')).not.toThrow();
  });

  it('does not throw when preloading game sounds', () => {
    expect(() =>
      gameSounds.preload('chess_v1', ['chess_move', 'chess_capture']),
    ).not.toThrow();
  });
});
