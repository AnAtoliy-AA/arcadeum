import type { GameLogEntry } from '../../base/game-engine.interface';
import type { CatDashState, CatDashPlayer } from './cat-dash.types';
import { POWER_TOKENS_PER_GAME } from './cat-dash.constants';
import { checkWinCondition, applySpaceEffect } from './cat-dash.utils';

export function executeCatnapHelper(
  state: CatDashState,
  player: CatDashPlayer,
  createLog: (
    type: 'action' | 'system',
    message: string,
    options?: { senderId?: string },
  ) => GameLogEntry,
): { state: CatDashState; logs: GameLogEntry[] } {
  player.powerTokens = Math.min(POWER_TOKENS_PER_GAME, player.powerTokens + 1);
  player.shielded = true;

  const logs = [
    createLog(
      'action',
      `${player.catId} took a strategic Catnap (+1 Power Token and Shield active)!`,
      { senderId: player.playerId },
    ),
  ];

  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;
  state.turnNumber = (state.turnNumber || 0) + 1;

  return { state, logs };
}

export function executePounceHelper(
  state: CatDashState,
  player: CatDashPlayer,
  createLog: (
    type: 'action' | 'system',
    message: string,
    options?: { senderId?: string },
  ) => GameLogEntry,
): { state: CatDashState; logs: GameLogEntry[] } {
  player.powerTokens = Math.max(0, player.powerTokens - 1);

  let newPos = Math.min(player.position + 2, state.track.length - 1);

  const logs = [
    createLog(
      'action',
      `${player.catId} pounced forward 2 spaces with feline agility!`,
      { senderId: player.playerId },
    ),
  ];

  const trapIndex = state.traps?.findIndex(
    (t) => t.spaceId === newPos && t.ownerId !== player.playerId,
  );
  if (trapIndex !== undefined && trapIndex >= 0) {
    state.traps?.splice(trapIndex, 1);
    if (player.shielded) {
      player.shielded = false;
      logs.push(createLog('system', 'Energy Shield absorbed the snare!'));
    } else {
      newPos = Math.max(0, newPos - 2);
      logs.push(
        createLog('system', 'Triggered a Shadow Snare and lost 2 spaces!'),
      );
    }
  }

  const space = state.track[newPos];
  if (space?.effect) {
    const effects = applySpaceEffect(space.effect);
    if (effects.skipTurn) {
      if (player.shielded) {
        player.shielded = false;
        logs.push(createLog('system', 'Energy Shield absorbed the obstacle!'));
      } else {
        logs.push(
          createLog('system', 'Hit an obstacle, skipping next turn', {
            senderId: player.playerId,
          }),
        );
      }
    }
    if (effects.extraRoll) {
      player.hasBonus = true;
      logs.push(
        createLog('system', 'Found a bonus turbo boost (+1 on next roll)', {
          senderId: player.playerId,
        }),
      );
    }
  }

  const rivalAhead = state.players.find(
    (p) =>
      p.playerId !== player.playerId && p.isReady && p.position === newPos + 1,
  );
  if (rivalAhead && newPos < state.track.length - 1) {
    newPos += 1;
    logs.push(
      createLog('system', 'Caught the slipstream drafting boost (+1 space)!'),
    );
  }

  const rivalAtTile = state.players.find(
    (p) => p.playerId !== player.playerId && p.isReady && p.position === newPos,
  );
  if (rivalAtTile) {
    if (rivalAtTile.shielded) {
      rivalAtTile.shielded = false;
      logs.push(
        createLog('system', `${rivalAtTile.catId}'s shield absorbed the bump!`),
      );
    } else {
      rivalAtTile.position = Math.max(0, rivalAtTile.position - 1);
      logs.push(
        createLog('system', `Bumped ${rivalAtTile.catId} back 1 space!`),
      );
    }
  }

  player.position = newPos;

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

  if (player.extraRollPending) {
    player.extraRollPending = false;
    logs.push(
      createLog('system', `${player.catId} earned an immediate extra roll!`),
    );
  } else if (!state.gameOver) {
    state.currentPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
  }
  state.turnNumber = (state.turnNumber || 0) + 1;

  return { state, logs };
}

export function executeDeployTrapHelper(
  state: CatDashState,
  player: CatDashPlayer,
  spaceId: number | undefined,
  createLog: (
    type: 'action' | 'system',
    message: string,
    options?: { senderId?: string },
  ) => GameLogEntry,
): { state: CatDashState; logs: GameLogEntry[] } {
  player.powerTokens = Math.max(0, player.powerTokens - 1);

  const targetSpace =
    typeof spaceId === 'number'
      ? Math.max(0, Math.min(spaceId, state.track.length - 1))
      : Math.min(player.position + 2, state.track.length - 1);

  state.traps = state.traps ?? [];
  state.traps.push({
    spaceId: targetSpace,
    ownerId: player.playerId,
  });

  const logs = [
    createLog(
      'action',
      `${player.catId} placed a Catnip Snare on space ${targetSpace}!`,
      { senderId: player.playerId },
    ),
  ];

  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;
  state.turnNumber = (state.turnNumber || 0) + 1;

  return { state, logs };
}
