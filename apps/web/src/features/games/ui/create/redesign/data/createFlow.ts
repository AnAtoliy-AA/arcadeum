import { skinIdToThemeId } from '@/features/games/lib/shared-themes';
import { applyPreset } from './presets';
import { GAMES, VISIBLE_GAMES, themesFor, type GameId } from './themes';
import {
  ROOM_NAME_MAX,
  type CreateRoomForm,
  type PresetId,
  type Visibility,
} from './form';

export type RuleKey = keyof CreateRoomForm['rules'];

/**
 * House rules that really change the game on the server. Anything not listed
 * here would be a toggle that does nothing, so it is not shown.
 */
const SUPPORTED_RULES: Partial<Record<GameId, RuleKey[]>> = {
  critical_v1: ['combos', 'idle'],
  sea_battle_v1: ['teams'],
  tic_tac_toe_v1: ['teams'],
  pachisi_v1: ['teams'],
};

export function supportedRules(gameId: GameId): RuleKey[] {
  return SUPPORTED_RULES[gameId] ?? [];
}

export function isGameId(raw: string | null | undefined): raw is GameId {
  return !!raw && (VISIBLE_GAMES as string[]).includes(raw);
}

export function parseInitialGameId(raw: string | null | undefined): GameId {
  return isGameId(raw) ? raw : VISIBLE_GAMES[0];
}

export function defaultThemeFor(gameId: GameId): string {
  const themes = themesFor(gameId);
  const preferred = themes.find(
    (t) => t.id === 'adventure' || t.id === 'classic',
  );
  return preferred?.id ?? themes[0]?.id ?? 'adventure';
}

/** Keeps the current theme when valid, otherwise falls back to the default. */
export function resolveTheme(
  gameId: GameId,
  wanted: string | null | undefined,
  equippedSkinId?: string | null,
): string {
  const themes = themesFor(gameId);
  if (wanted && themes.some((t) => t.id === wanted)) return wanted;
  const equipped = skinIdToThemeId(equippedSkinId ?? null);
  if (equipped && themes.some((t) => t.id === equipped)) return equipped;
  return defaultThemeFor(gameId);
}

export function initialForm(
  gameId: GameId,
  themeId: string | undefined,
  equippedSkinId: string | null,
): CreateRoomForm {
  return {
    gameId,
    themeId: resolveTheme(gameId, themeId, equippedSkinId),
    expansionPackIds: ['core'],
    maxPlayers: 'auto',
    visibility: 'public',
    roomName: '',
    notes: '',
    password: '',
    rules: { combos: false, idle: false, teams: false, spectators: true },
    preset: 'custom',
    ranked: false,
  };
}

/** Switching game keeps what still makes sense and resets the rest. */
export function switchGame(
  form: CreateRoomForm,
  gameId: GameId,
): CreateRoomForm {
  const { players } = GAMES[gameId];
  const maxPlayers =
    form.maxPlayers !== 'auto' &&
    form.maxPlayers >= players.min &&
    form.maxPlayers <= players.max
      ? form.maxPlayers
      : 'auto';
  return {
    ...form,
    gameId,
    themeId: resolveTheme(gameId, form.themeId),
    expansionPackIds: ['core'],
    maxPlayers,
    rules: { combos: false, idle: false, teams: false, spectators: true },
    preset: 'custom',
  };
}

/** Applies a preset, clamping it to what the selected game supports. */
export function applyGamePreset(
  form: CreateRoomForm,
  preset: Exclude<PresetId, 'custom'>,
): CreateRoomForm {
  const next = applyPreset(form, preset);
  const { players } = GAMES[form.gameId];
  const allowed = supportedRules(form.gameId);
  const rules = { ...next.rules };
  (['combos', 'idle', 'teams'] as const).forEach((key) => {
    if (!allowed.includes(key)) rules[key] = false;
  });
  const maxPlayers =
    next.maxPlayers !== 'auto' &&
    (next.maxPlayers < players.min || next.maxPlayers > players.max)
      ? 'auto'
      : next.maxPlayers;
  return applyTeamsConstraint(
    { ...next, rules: { ...rules, teams: false } },
    { ...next, rules, maxPlayers },
  );
}

/**
 * Pachisi teams are 2v2 and need exactly four players: turning teams on pins
 * the seat count to 4, and picking another explicit seat count turns teams
 * off again so the form can never describe an impossible room.
 */
export function applyTeamsConstraint(
  prev: CreateRoomForm,
  next: CreateRoomForm,
): CreateRoomForm {
  if (next.gameId !== 'pachisi_v1' || !next.rules.teams) return next;
  if (!prev.rules.teams) return { ...next, maxPlayers: 4 };
  if (next.maxPlayers !== 'auto' && next.maxPlayers !== 4) {
    return { ...next, rules: { ...next.rules, teams: false } };
  }
  return next;
}

export type RoomNameError = 'required' | 'tooLong' | null;

export function validateRoomName(name: string): RoomNameError {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'required';
  if (trimmed.length > ROOM_NAME_MAX) return 'tooLong';
  return null;
}

export function toApiVisibility(v: Visibility): 'public' | 'private' {
  return v === 'public' ? 'public' : 'private';
}

const STATIC_OPTIONS: Partial<Record<GameId, Record<string, unknown>>> = {
  chess_v1: { variant: 'standard' },
  sea_battle_v1: { variant: 'classic', gridSize: 10, shipCount: 10 },
  checkers_v1: { mode: 'american' },
  cat_dash_v1: { variant: 'standard' },
  backgammon_v1: { mode: 'standard' },
  hearts_v1: { passingEnabled: true, targetScore: 100 },
  spades_v1: { nilEnabled: true, targetScore: 500 },
  go_v1: { boardSize: 9 },
  pachisi_v1: { mode: 'standard' },
};

export function buildGameOptions(
  form: CreateRoomForm,
): Record<string, unknown> {
  const options: Record<string, unknown> = {
    ...(STATIC_OPTIONS[form.gameId] ?? {}),
  };
  const allowed = supportedRules(form.gameId);
  if (form.gameId === 'critical_v1') {
    // The server reads `expansions`, `allowActionCardCombos` and
    // `idleTimerEnabled` (same keys the in-lobby Critical config uses).
    options.expansions = form.expansionPackIds.filter((id) => id !== 'core');
    options.allowActionCardCombos = allowed.includes('combos')
      ? form.rules.combos
      : false;
    options.idleTimerEnabled = allowed.includes('idle')
      ? form.rules.idle
      : false;
  }
  if (allowed.includes('teams') && form.rules.teams) {
    // Pachisi reads `teams` (2v2); the other team games read `teamMode`.
    if (form.gameId === 'pachisi_v1') options.teams = true;
    else options.teamMode = true;
  }
  return {
    ...options,
    theme: form.themeId || 'adventure',
    ranked: form.ranked,
  };
}

export type StepId = 'game' | 'look' | 'room';

export interface FlowStep {
  id: StepId;
  anchor: string;
}

export const FLOW_STEPS: FlowStep[] = [
  { id: 'game', anchor: 'create-step-game' },
  { id: 'look', anchor: 'create-step-look' },
  { id: 'room', anchor: 'create-step-room' },
];
