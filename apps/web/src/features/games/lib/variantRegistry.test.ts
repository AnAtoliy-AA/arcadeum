import { describe, it, expect } from 'vitest';
import { resolveGameDisplayInfo } from './variantRegistry';

describe('resolveGameDisplayInfo', () => {
  it('resolves cascade mode translation key', () => {
    const info = resolveGameDisplayInfo('cascade_v1', { mode: 'classic' });
    expect(info.variantName).toBe('games.cascade_v1.modes.classic.name');
  });

  it('resolves glimworm mode translation key', () => {
    const info = resolveGameDisplayInfo('glimworm_v1', { mode: 'classic' });
    expect(info.variantName).toBe('games.glimworm_v1.modes.classic.name');
  });

  it('resolves chess standard mode translation key', () => {
    const info = resolveGameDisplayInfo('chess_v1', { variant: 'standard' });
    expect(info.variantName).toBe('games.chess_v1.lobby.standard');
  });

  it('resolves checkers standard mode translation key', () => {
    const info = resolveGameDisplayInfo('checkers_v1', { variant: 'standard' });
    expect(info.variantName).toBe('games.checkers_v1.lobby.standard');
  });

  it('resolves shared theme translation key', () => {
    const info = resolveGameDisplayInfo('tic_tac_toe_v1', {
      theme: 'cyberpunk',
    });
    expect(info.themeName).toBe('games.themes.cyberpunk.name');
  });

  it('handles unknown variant gracefully', () => {
    const info = resolveGameDisplayInfo('sea_battle_v1', {
      variant: 'custom_mode',
    });
    expect(info.variantName).toBe('custom_mode');
  });
});
