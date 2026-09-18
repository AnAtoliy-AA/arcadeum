import type { GameLogEntry } from '../../base/game-engine.interface';
import type { CatDashState, CatDashPlayer } from './cat-dash.types';
import {
  calculateMovement,
  checkWinCondition,
  applySpaceEffect,
  rollDice,
} from './cat-dash.utils';

export function executeRollDiceHelper(
  state: CatDashState,
  player: CatDashPlayer,
  createLog: (
    type: 'action' | 'system',
    message: string,
    options?: { senderId?: string },
  ) => GameLogEntry,
): { state: CatDashState; logs: GameLogEntry[] } {
  let roll = rollDice();
  let abilityMod = 0;

  if (player.speedBoostPending === 999) {
    roll = 4;
    player.speedBoostPending = 0;
  } else if (player.speedBoostPending) {
    abilityMod = player.speedBoostPending;
    player.speedBoostPending = 0;
  }

  const movement = calculateMovement(roll, player.hasBonus, abilityMod);
  player.hasBonus = false;

  const logs = [
    createLog('action', `Rolled ${roll}, moving ${movement} spaces`, {
      senderId: player.playerId,
    }),
  ];

  let newPos = Math.min(player.position + movement, state.track.length - 1);

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
      player.extraRollPending = true;
      logs.push(
        createLog('system', 'Found a bonus turbo boost', {
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

  return { state, logs };
}
