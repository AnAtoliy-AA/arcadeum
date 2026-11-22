import { describe, it, expect } from 'vitest';
import {
  applyGamePreset,
  buildGameOptions,
  initialForm,
  parseInitialGameId,
  resolveTheme,
  supportedRules,
  switchGame,
  toApiVisibility,
  validateRoomName,
} from './createFlow';
import { ROOM_NAME_MAX } from './form';
import { VISIBLE_GAMES, themesFor } from './themes';

describe('validateRoomName', () => {
  it('rejects empty and whitespace-only names', () => {
    expect(validateRoomName('')).toBe('required');
    expect(validateRoomName('   ')).toBe('required');
  });
  it('rejects names over the limit', () => {
    expect(validateRoomName('x'.repeat(ROOM_NAME_MAX + 1))).toBe('tooLong');
  });
  it('accepts a normal name and the exact limit', () => {
    expect(validateRoomName('Friday game')).toBeNull();
    expect(validateRoomName('x'.repeat(ROOM_NAME_MAX))).toBeNull();
  });
});

describe('parseInitialGameId', () => {
  it('falls back to the first visible game for unknown ids', () => {
    expect(parseInitialGameId('nope')).toBe(VISIBLE_GAMES[0]);
    expect(parseInitialGameId(null)).toBe(VISIBLE_GAMES[0]);
  });
  it('keeps a valid id', () => {
    expect(parseInitialGameId('chess_v1')).toBe('chess_v1');
  });
});

describe('resolveTheme', () => {
  it('keeps a valid theme and falls back for an invalid one', () => {
    const [first] = themesFor('chess_v1');
    expect(resolveTheme('chess_v1', first.id)).toBe(first.id);
    expect(themesFor('chess_v1').map((t) => t.id)).toContain(
      resolveTheme('chess_v1', 'does-not-exist'),
    );
  });
});

describe('switchGame', () => {
  it('resets packs/rules and drops a player cap the new game cannot use', () => {
    const form = {
      ...initialForm('critical_v1', undefined, null),
      maxPlayers: 5,
      expansionPackIds: ['core', 'attack'],
      rules: { combos: true, idle: true, teams: false, spectators: true },
    };
    const next = switchGame(form, 'chess_v1');
    expect(next.gameId).toBe('chess_v1');
    expect(next.maxPlayers).toBe('auto');
    expect(next.expansionPackIds).toEqual(['core']);
    expect(next.rules.combos).toBe(false);
    expect(themesFor('chess_v1').map((t) => t.id)).toContain(next.themeId);
  });
  it('keeps a player cap that still fits', () => {
    const form = {
      ...initialForm('critical_v1', undefined, null),
      maxPlayers: 4,
    };
    expect(switchGame(form, 'sea_battle_v1').maxPlayers).toBe(4);
  });
});

describe('applyGamePreset', () => {
  it('clamps the ranked preset to games with a fixed 4 player table', () => {
    const form = initialForm('hearts_v1', undefined, null);
    const out = applyGamePreset(form, 'ranked');
    expect(out.maxPlayers).toBe('auto');
    expect(out.ranked).toBe(true);
    expect(out.preset).toBe('ranked');
  });
  it('turns off rules the game does not support', () => {
    const out = applyGamePreset(
      initialForm('chess_v1', undefined, null),
      'party',
    );
    expect(out.rules.combos).toBe(false);
    expect(out.rules.teams).toBe(false);
    expect(out.rules.idle).toBe(false);
  });
  it('keeps supported rules for Critical', () => {
    const out = applyGamePreset(
      initialForm('critical_v1', undefined, null),
      'party',
    );
    expect(out.rules.combos).toBe(true);
    expect(out.rules.idle).toBe(true);
  });
});

describe('buildGameOptions', () => {
  it('sends the keys the server reads for Critical', () => {
    const form = {
      ...initialForm('critical_v1', 'cyberpunk', null),
      expansionPackIds: ['core', 'attack', 'future'],
      rules: { combos: true, idle: true, teams: false, spectators: true },
      ranked: true,
    };
    const opts = buildGameOptions(form);
    expect(opts.expansions).toEqual(['attack', 'future']);
    expect(opts.allowActionCardCombos).toBe(true);
    expect(opts.idleTimerEnabled).toBe(true);
    expect(opts.ranked).toBe(true);
    expect(opts).not.toHaveProperty('expansionPacks');
  });
  it('maps team mode for games that support it', () => {
    const form = {
      ...initialForm('tic_tac_toe_v1', undefined, null),
      rules: { combos: false, idle: false, teams: true, spectators: true },
    };
    expect(buildGameOptions(form).teamMode).toBe(true);
  });
  it('ignores unsupported rules', () => {
    const form = {
      ...initialForm('chess_v1', undefined, null),
      rules: { combos: true, idle: true, teams: true, spectators: true },
    };
    const opts = buildGameOptions(form);
    expect(opts).not.toHaveProperty('teamMode');
    expect(opts).not.toHaveProperty('idleTimerEnabled');
    expect(opts.variant).toBe('standard');
  });
  it('lists supported rules only', () => {
    expect(supportedRules('chess_v1')).toEqual([]);
    expect(supportedRules('critical_v1')).toEqual(['combos', 'idle']);
  });
});

describe('toApiVisibility', () => {
  it('treats link-only and invite-only rooms as private', () => {
    expect(toApiVisibility('public')).toBe('public');
    expect(toApiVisibility('unlisted')).toBe('private');
    expect(toApiVisibility('private')).toBe('private');
  });
});
