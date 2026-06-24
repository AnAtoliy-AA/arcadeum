import { describe, it, expect } from 'vitest';
import { applyPreset, PRESETS } from './presets';
import type { CreateRoomForm } from './form';

function baseForm(): CreateRoomForm {
  return {
    gameId: 'critical_v1',
    themeId: 'cyberpunk',
    expansionPackIds: ['core'],
    maxPlayers: 4,
    visibility: 'private',
    roomName: "Anatoli's game",
    notes: '',
    rules: {
      combos: false,
      idle: false,
      teams: false,
      spectators: false,
    },
    preset: 'custom',
  };
}

describe('applyPreset', () => {
  it('overwrites visibility, maxPlayers, rules with the ranked preset', () => {
    const out = applyPreset(baseForm(), 'ranked');
    expect(out.visibility).toBe('public');
    expect(out.maxPlayers).toBe(2);
    expect(out.rules.idle).toBe(true);
    expect(out.rules.spectators).toBe(true);
    expect(out.preset).toBe('ranked');
  });

  it('does not touch gameId, themeId, expansionPackIds, roomName, or notes', () => {
    const before = baseForm();
    const out = applyPreset(before, 'friends');
    expect(out.gameId).toBe(before.gameId);
    expect(out.themeId).toBe(before.themeId);
    expect(out.expansionPackIds).toEqual(before.expansionPackIds);
    expect(out.roomName).toBe(before.roomName);
    expect(out.notes).toBe(before.notes);
  });

  it('party preset turns all four rule toggles on', () => {
    const out = applyPreset(baseForm(), 'party');
    expect(out.rules).toEqual({
      combos: true,
      idle: true,
      teams: true,
      spectators: true,
    });
    expect(out.maxPlayers).toBe('auto');
    expect(out.visibility).toBe('public');
  });

  it('friends preset sets visibility unlisted with auto cap', () => {
    const out = applyPreset(baseForm(), 'friends');
    expect(out.visibility).toBe('unlisted');
    expect(out.maxPlayers).toBe('auto');
  });

  it('every preset is reachable from the registry', () => {
    expect(Object.keys(PRESETS)).toEqual(
      expect.arrayContaining(['ranked', 'friends', 'party']),
    );
  });
});
