import { describe, it, expect, beforeEach } from 'vitest';
import { useSoloThemeStore } from './soloThemeStore';

describe('soloThemeStore', () => {
  beforeEach(() => {
    useSoloThemeStore.setState({ themes: {} });
  });

  it('returns default theme when no theme is set', () => {
    const theme = useSoloThemeStore.getState().getTheme('game_2048_v1');
    expect(theme).toBe('adventure');
  });

  it('sets and retrieves theme for a game', () => {
    useSoloThemeStore.getState().setTheme('game_2048_v1', 'cyberpunk');
    expect(useSoloThemeStore.getState().getTheme('game_2048_v1')).toBe(
      'cyberpunk',
    );
    expect(useSoloThemeStore.getState().getTheme('minesweeper_v1')).toBe(
      'adventure',
    );
  });

  it('supports multiple independent game themes', () => {
    useSoloThemeStore.getState().setTheme('game_2048_v1', 'cyberpunk');
    useSoloThemeStore.getState().setTheme('minesweeper_v1', 'retro-arcade');
    useSoloThemeStore.getState().setTheme('solitaire_v1', 'forest-moss');

    expect(useSoloThemeStore.getState().getTheme('game_2048_v1')).toBe(
      'cyberpunk',
    );
    expect(useSoloThemeStore.getState().getTheme('minesweeper_v1')).toBe(
      'retro-arcade',
    );
    expect(useSoloThemeStore.getState().getTheme('solitaire_v1')).toBe(
      'forest-moss',
    );
  });
});
