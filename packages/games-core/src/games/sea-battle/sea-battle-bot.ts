import type {
  AiDifficulty,
  RadarPayload,
  SeaBattlePlayer,
  SeaBattleState,
  Ship,
  SonarPayload,
} from './sea-battle.types';
import { CELL_STATE } from './sea-battle.constants';
import { getActiveShooterId, getTeamForPlayer } from './team-rotation.utils';
import { getSmartTarget, getProbabilisticTarget } from './bot-targeting';

/**
 * A special-weapon action the bot wants to take (free action — does not
 * advance the turn). The host application is responsible for executing it.
 */
export type SeaBattleSpecialWeaponAction =
  | { action: 'useSonar'; payload: SonarPayload }
  | { action: 'useRadar'; payload: RadarPayload };

/**
 * Framework-agnostic Sea Battle bot decision logic.
 *
 * Difficulty-based targeting:
 * - easy → mostly random, occasionally locks onto damaged ships
 * - medium → hunt mode around existing hits
 * - hard → probabilistic density map, falling back to hunt mode
 * - expert → finish damaged ships first, then probabilistic hunting
 */
export class SeaBattleBot {
  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  /**
   * The player whose turn it is to shoot. In team modes this resolves the
   * active team's current shooter; otherwise the plain turn-order player.
   */
  getCurrentPlayerId(state: SeaBattleState): string | undefined {
    return state.teams
      ? getActiveShooterId(state)
      : state.playerOrder[state.currentTurnIndex];
  }

  /**
   * Pick which opponent to attack: prioritize opponents with damaged ships
   * (Locked-on strategy), otherwise a random eligible one. Teammates are
   * excluded when the bot belongs to a team. Returns null when there is no
   * one to attack.
   */
  pickTargetOpponent(
    state: SeaBattleState,
    botId: string,
  ): SeaBattlePlayer | null {
    const activeOpponents = state.players.filter(
      (p: SeaBattlePlayer) => p.playerId !== botId && p.alive,
    );
    const botTeam = getTeamForPlayer(state, botId);
    const eligibleOpponents = botTeam
      ? activeOpponents.filter(
          (p) => !botTeam.playerIds.includes(p.playerId),
        )
      : activeOpponents;

    if (eligibleOpponents.length === 0) return null;

    const damagedOpponent = eligibleOpponents.find((p) =>
      p.ships.some((s: Ship) => s.hits > 0 && !s.sunk),
    );
    return (
      damagedOpponent ||
      eligibleOpponents[
        Math.floor(Math.random() * eligibleOpponents.length)
      ]
    );
  }

  /**
   * Decide whether to fire sonar (board centre) or radar (random row) before
   * attacking. Both are free actions and usable once per game.
   */
  pickSpecialWeaponAction(
    state: SeaBattleState,
    botId: string,
    target: SeaBattlePlayer,
    gridSize: number,
  ): SeaBattleSpecialWeaponAction | null {
    const myUsage = state.specialWeaponUsage?.[botId];
    const hasSonar = !!state.specialWeapons?.sonar && !myUsage?.sonarUsed;
    const hasRadar = !!state.specialWeapons?.radar && !myUsage?.radarUsed;

    if (hasSonar) {
      const centerRow = Math.floor(gridSize / 2);
      const centerCol = Math.floor(gridSize / 2);
      return {
        action: 'useSonar',
        payload: { targetPlayerId: target.playerId, row: centerRow, col: centerCol },
      };
    }
    if (hasRadar) {
      const row = Math.floor(Math.random() * gridSize);
      return {
        action: 'useRadar',
        payload: { targetPlayerId: target.playerId, row },
      };
    }
    return null;
  }

  /**
   * Difficulty-based attack cell choice against `target`, with a random
   * valid-cell fallback. Returns null when no cell is left to attack.
   */
  pickAttackCell(
    state: SeaBattleState,
    target: SeaBattlePlayer,
    gridSize: number,
  ): { r: number; c: number } | null {
    const difficulty: AiDifficulty = state.aiDifficulty ?? 'medium';
    const hasDamagedShip = target.ships.some(
      (s: Ship) => s.hits > 0 && !s.sunk,
    );
    let choice: { r: number; c: number } | null = null;
    if (difficulty === 'easy') {
      if (Math.random() < 0.3) choice = getSmartTarget(target, gridSize);
    } else if (difficulty === 'expert') {
      // Finish damaged ships first, then statistically hunt for new ones.
      choice = hasDamagedShip
        ? getSmartTarget(target, gridSize)
        : getProbabilisticTarget(target, gridSize) ||
          getSmartTarget(target, gridSize);
    } else if (difficulty === 'hard') {
      choice =
        getProbabilisticTarget(target, gridSize) ||
        getSmartTarget(target, gridSize);
    } else {
      choice = getSmartTarget(target, gridSize);
    }

    if (!choice) {
      const validCells: { r: number; c: number }[] = [];
      for (let r = 0; r < gridSize; r++)
        for (let c = 0; c < gridSize; c++)
          if (
            target.board[r][c] !== CELL_STATE.HIT &&
            target.board[r][c] !== CELL_STATE.MISS
          )
            validCells.push({ r, c });
      if (validCells.length === 0) return null;
      choice = validCells[Math.floor(Math.random() * validCells.length)];
    }

    return choice;
  }
}
