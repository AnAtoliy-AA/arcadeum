import type {
  GameActionResult,
  GameLogEntry,
} from '../../base/game-engine.interface';
import type { CatDashState, CatDashPlayer } from './cat-dash.types';
import { CAT_ABILITIES } from './cat-dash.constants';
import { checkWinCondition } from './cat-dash.utils';

export function executeUseAbilityHelper(
  state: CatDashState,
  player: CatDashPlayer,
  abilityId: string,
  createLog: (
    type: 'action' | 'system',
    message: string,
    options?: { senderId?: string },
  ) => GameLogEntry,
): { state: CatDashState; logs: GameLogEntry[] } {
  const catAbilities = CAT_ABILITIES[player.catId] ?? [];
  let resolvedId = abilityId;
  if (abilityId === 'ability_1' && catAbilities[0]) {
    resolvedId = catAbilities[0].id;
  } else if (abilityId === 'ability_2' && catAbilities[1]) {
    resolvedId = catAbilities[1].id;
  }

  const ability = catAbilities.find(
    (a) => a.id === resolvedId || a.id === abilityId,
  );
  const cost = ability?.cost ?? 1;

  player.abilitiesUsed.push(resolvedId);
  if (abilityId !== resolvedId) {
    player.abilitiesUsed.push(abilityId);
  }
  player.powerTokens = Math.max(0, player.powerTokens - cost);

  const logs: GameLogEntry[] = [];

  switch (resolvedId) {
    case 'neon_boost':
    case 'felix_boost':
    case 'luna_boost':
      player.speedBoostPending = (player.speedBoostPending ?? 0) + 3;
      logs.push(
        createLog(
          'action',
          `${player.catId} engaged Speed Boost (+3 to next roll)!`,
          { senderId: player.playerId },
        ),
      );
      break;

    case 'neon_shield':
    case 'stardust_shield':
    case 'luna_ward':
      player.shielded = true;
      logs.push(
        createLog(
          'action',
          `${player.catId} activated Energy Shield (immune to hazards & bumps)!`,
          { senderId: player.playerId },
        ),
      );
      break;

    case 'whiskers_slingshot':
    case 'shadow_leap': {
      const forwardPlayers = state.players.filter(
        (p) =>
          p.playerId !== player.playerId &&
          p.isReady &&
          p.position > player.position,
      );
      forwardPlayers.sort((a, b) => a.position - b.position);
      const target = forwardPlayers[0];
      const targetPos = target ? target.position + 2 : player.position + 2;
      player.position = Math.min(targetPos, state.track.length - 1);
      logs.push(
        createLog(
          'action',
          `${player.catId} executed a Slingshot Leap to space ${player.position}!`,
          { senderId: player.playerId },
        ),
      );
      if (checkWinCondition(player.position, state.trackLength)) {
        state.winner = player.playerId;
        state.gameOver = true;
        logs.push(
          createLog('system', 'Crossed the finish line! Game over!', {
            senderId: player.playerId,
          }),
        );
        state.gameResult = { winnerIds: [player.playerId], isDraw: false };
      }
      break;
    }

    case 'whiskers_reroll':
      player.extraRollPending = true;
      logs.push(
        createLog(
          'action',
          `${player.catId} primed Lucky Paws for an extra roll!`,
          { senderId: player.playerId },
        ),
      );
      break;

    case 'stardust_warp': {
      const nextBonus = state.track.find(
        (s) => s.id > player.position && s.type === 'bonus',
      );
      player.position = nextBonus
        ? nextBonus.id
        : Math.min(player.position + 3, state.track.length - 1);
      logs.push(
        createLog(
          'action',
          `${player.catId} warped through space to tile ${player.position}!`,
          { senderId: player.playerId },
        ),
      );
      if (checkWinCondition(player.position, state.trackLength)) {
        state.winner = player.playerId;
        state.gameOver = true;
        logs.push(
          createLog('system', 'Crossed the finish line! Game over!', {
            senderId: player.playerId,
          }),
        );
        state.gameResult = { winnerIds: [player.playerId], isDraw: false };
      }
      break;
    }

    case 'felix_precision':
      player.speedBoostPending = 999;
      logs.push(
        createLog(
          'action',
          `${player.catId} locked in Apex Precision (guaranteed roll of 4)!`,
          { senderId: player.playerId },
        ),
      );
      break;

    case 'shadow_snare':
      state.traps = state.traps ?? [];
      state.traps.push({
        spaceId: player.position,
        ownerId: player.playerId,
      });
      logs.push(
        createLog(
          'action',
          `${player.catId} planted a Shadow Snare on space ${player.position}!`,
          { senderId: player.playerId },
        ),
      );
      break;

    default:
      logs.push(
        createLog('action', `Used ability ${abilityId}`, {
          senderId: player.playerId,
        }),
      );
      break;
  }

  return { state, logs };
}
