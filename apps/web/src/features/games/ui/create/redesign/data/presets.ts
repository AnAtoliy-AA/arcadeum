import type { CreateRoomForm, PresetId } from './form';

interface PresetConfig {
  visibility: CreateRoomForm['visibility'];
  maxPlayers: CreateRoomForm['maxPlayers'];
  rules: CreateRoomForm['rules'];
  ranked: boolean;
}

export const PRESETS: Record<Exclude<PresetId, 'custom'>, PresetConfig> = {
  ranked: {
    visibility: 'public',
    maxPlayers: 2,
    rules: { combos: false, idle: true, teams: false, spectators: true },
    ranked: true,
  },
  friends: {
    visibility: 'unlisted',
    maxPlayers: 'auto',
    rules: { combos: false, idle: false, teams: false, spectators: true },
    ranked: false,
  },
  party: {
    visibility: 'public',
    maxPlayers: 'auto',
    rules: { combos: true, idle: true, teams: true, spectators: true },
    ranked: false,
  },
};

export function applyPreset(
  form: CreateRoomForm,
  preset: Exclude<PresetId, 'custom'>,
): CreateRoomForm {
  const cfg = PRESETS[preset];
  return {
    ...form,
    visibility: cfg.visibility,
    maxPlayers: cfg.maxPlayers,
    rules: { ...form.rules, ...cfg.rules },
    ranked: cfg.ranked,
    preset,
  };
}
