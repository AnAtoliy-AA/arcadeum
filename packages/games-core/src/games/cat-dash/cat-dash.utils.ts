import type { TrackSpace, SpaceEffect } from './cat-dash.types';
import { CAT_ABILITIES, THEME_BONUSES } from './cat-dash.constants';
import type { TrackType } from './cat-dash.constants';

export function generateTrack(
  trackType: TrackType,
  trackLength: number = 60,
): TrackSpace[] {
  const track: TrackSpace[] = [];

  const maxIndex = trackLength - 1;

  for (let i = 0; i <= maxIndex; i++) {
    const space: TrackSpace = { id: i, type: 'normal' };

    if (i === 0) {
      space.type = 'normal';
    } else if (i === maxIndex) {
      space.type = 'normal';
    } else if (trackType === 'linear') {
      if (i % 10 === 4) {
        space.type = 'obstacle';
        space.effect = { type: 'skip_turn' };
      } else if (i % 10 === 2) {
        space.type = 'bonus';
        space.effect = { type: 'extra_roll' };
      }
    } else if (trackType === 'circular' && i % 7 === 0) {
      space.type = 'fork';
    } else if (i % 5 === 0) {
      space.type = 'obstacle';
      space.effect = { type: 'skip_turn' };
    } else if (i % 3 === 0) {
      space.type = 'bonus';
      space.effect = { type: 'extra_roll' };
    } else if (i % 4 === 0 && trackType === 'multiple') {
      space.type = 'fork';
    }

    track.push(space);
  }

  return track;
}

export function calculateMovement(
  baseRoll: number,
  hasBonus: boolean,
  abilityModifier: number,
): number {
  let movement = baseRoll;
  if (hasBonus) movement += 1;
  movement += abilityModifier;
  return Math.max(1, movement);
}

export function checkWinCondition(
  position: number,
  trackLength: number = 60,
): boolean {
  return position >= trackLength - 1;
}

export function getAvailableAbilities(
  _catId: string,
  abilitiesUsed: string[],
): string[] {
  const abilities = CAT_ABILITIES[_catId as keyof typeof CAT_ABILITIES];
  if (!abilities) return [];
  return abilities
    .map((_, index) => `ability_${index + 1}`)
    .filter((ability) => !abilitiesUsed.includes(ability));
}

export function applySpaceEffect(effect: SpaceEffect): {
  skipTurn: boolean;
  extraRoll: boolean;
  powerRecharge: boolean;
} {
  return {
    skipTurn: effect.type === 'skip_turn',
    extraRoll: effect.type === 'extra_roll',
    powerRecharge: effect.type === 'power_recharge',
  };
}

export function hasThemeBonus(catId: string, theme: string): boolean {
  const bonusTheme = THEME_BONUSES[catId as keyof typeof THEME_BONUSES];
  return bonusTheme === theme;
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function sanitizeCatDashState(
  state: import('./cat-dash.types').CatDashState,
  playerId: string,
): Partial<import('./cat-dash.types').CatDashState> {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      abilitiesUsed: p.playerId === playerId ? p.abilitiesUsed : [],
    })),
  };
}

export function getAvailableActions(
  state: import('./cat-dash.types').CatDashState,
  playerId: string,
): string[] {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.playerId !== playerId || state.gameOver) {
    return [];
  }

  const actions: string[] = ['rollDice'];

  if (currentPlayer.powerTokens > 0) {
    const availableAbilities = getAvailableAbilities(
      currentPlayer.catId,
      currentPlayer.abilitiesUsed,
    );
    if (availableAbilities.length > 0) {
      actions.push('useAbility');
    }
  }

  return actions;
}
