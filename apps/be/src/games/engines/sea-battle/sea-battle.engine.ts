import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  BOARD_SIZE,
  CELL_STATE,
  SHIPS,
  GAME_PHASE,
  ATTACK_RESULT,
  ROW_LABELS,
  COL_LABELS,
  type ShipConfig,
  type AttackResult,
} from './sea-battle.constants';
import {
  Ship,
  SeaBattlePlayer,
  SeaBattleState,
  PlaceShipPayload,
  AttackPayload,
  ChatPayload,
} from './sea-battle.types';
import {
  createEmptyBoard,
  sanitizeSeaBattleState,
  getSeaBattleAvailableActions,
  randomlyPlaceShips,
  markSurroundingCellsAsMiss,
} from './sea-battle.utils';
import {
  validatePlaceShip,
  validateAutoPlace,
  validateConfirmPlacement,
  validateResetPlacement,
  validateAttack,
} from './sea-battle.validators';

@Injectable()
export class SeaBattleEngine extends BaseGameEngine<SeaBattleState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'sea_battle_v1',
      name: 'Sea Battle',
      minPlayers: 2,
      maxPlayers: 4,
      version: '1.0.0',
      description: 'Classic naval combat game',
      category: 'Strategy',
    };
  }

  initializeState(playerIds: string[]): SeaBattleState {
    const players: SeaBattlePlayer[] = playerIds.map((id) => ({
      playerId: id,
      alive: true,
      board: createEmptyBoard(),
      ships: [],
      shipsRemaining: SHIPS.length,
      placementComplete: false,
    }));

    return {
      phase: GAME_PHASE.PLACEMENT,
      players,
      playerOrder: playerIds,
      currentTurnIndex: 0,
      logs: [this.createLogEntry('system', 'Game started! Place your ships.')],
    };
  }

  validateAction(
    state: SeaBattleState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const { userId } = context;
    const player = state.players.find((p) => p.playerId === userId);

    if (!player || !player.alive) {
      return false;
    }

    switch (action) {
      case 'placeShip':
        return validatePlaceShip(state, player, payload as PlaceShipPayload);
      case 'autoPlace':
        return validateAutoPlace(state);
      case 'confirmPlacement':
        return validateConfirmPlacement(state, player);
      case 'attack':
        return validateAttack(state, player, payload as AttackPayload);

      case 'resetPlacement':
        return validateResetPlacement(state, player);
      case 'chat':
        return true;
      default:
        return false;
    }
  }

  executeAction(
    state: SeaBattleState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<SeaBattleState> {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === context.userId);

    if (!player) {
      return this.errorResult('Player not found');
    }

    switch (action) {
      case 'placeShip':
        return this.executePlaceShip(
          newState,
          player,
          payload as PlaceShipPayload,
        );
      case 'autoPlace':
        return this.executeAutoPlace(newState, player);
      case 'confirmPlacement':
        return this.executeConfirmPlacement(newState, player);
      case 'attack':
        return this.executeAttack(newState, player, payload as AttackPayload);

      case 'resetPlacement':
        return this.executeResetPlacement(newState, player);
      case 'chat':
        return this.executeChat(newState, player, payload as ChatPayload);
      default:
        return this.errorResult('Unknown action');
    }
  }

  private executePlaceShip(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: PlaceShipPayload,
  ): GameActionResult<SeaBattleState> {
    const shipConfig = SHIPS.find((s) => s.id === payload.shipId) as ShipConfig;

    const ship: Ship = {
      id: payload.shipId,
      name: shipConfig.name,
      size: shipConfig.size,
      cells: payload.cells,
      hits: 0,
      sunk: false,
    };

    player.ships.push(ship);

    for (const cell of payload.cells) {
      player.board[cell.row][cell.col] = CELL_STATE.SHIP;
    }

    state.logs.push(
      this.createLogEntry('action', `Placed ${ship.name}`, {
        scope: 'private',
        senderId: player.playerId,
      }),
    );

    return this.successResult(state);
  }

  private executeAutoPlace(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): GameActionResult<SeaBattleState> {
    // 1. Reset board
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (player.board[r][c] === CELL_STATE.SHIP) {
          player.board[r][c] = CELL_STATE.EMPTY;
        }
      }
    }
    player.ships = [];
    player.placementComplete = false;

    // 2. Generate placements
    const placements = randomlyPlaceShips();
    if (Object.keys(placements).length === 0) {
      // Should not happen with standard board, but handle gracefully
      return this.errorResult('Failed to generate ship placement');
    }

    // 3. Place ships
    // We already have utilities but to keep it self-contained and reusing types:
    // We'll iterate the generated placements and apply them.
    for (const shipId of Object.keys(placements)) {
      const cells = placements[shipId];
      const shipConfig = SHIPS.find((s) => s.id === shipId);
      if (shipConfig) {
        const ship: Ship = {
          id: shipId,
          name: shipConfig.name,
          size: shipConfig.size,
          cells: cells,
          hits: 0,
          sunk: false,
        };
        player.ships.push(ship);

        for (const cell of cells) {
          player.board[cell.row][cell.col] = CELL_STATE.SHIP;
        }
      }
    }

    state.logs.push(
      this.createLogEntry('action', 'Auto-placed ships', {
        scope: 'private',
        senderId: player.playerId,
      }),
    );

    return this.successResult(state);
  }

  private executeConfirmPlacement(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): GameActionResult<SeaBattleState> {
    player.placementComplete = true;

    state.logs.push(
      this.createLogEntry('system', 'A player has finished placing ships'),
    );

    const allReady = state.players.every((p) => p.placementComplete);
    if (allReady) {
      state.phase = GAME_PHASE.BATTLE;
      state.logs.push(
        this.createLogEntry('system', 'All ships placed! Battle begins!'),
      );
    }

    return this.successResult(state);
  }

  private executeResetPlacement(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): GameActionResult<SeaBattleState> {
    // Clear board
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (player.board[r][c] === CELL_STATE.SHIP) {
          player.board[r][c] = CELL_STATE.EMPTY;
        }
      }
    }

    // Clear ships
    player.ships = [];
    player.placementComplete = false;

    state.logs.push(
      this.createLogEntry('action', 'Reset ship placement', {
        scope: 'private',
        senderId: player.playerId,
      }),
    );

    return this.successResult(state);
  }

  private executeAttack(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: AttackPayload,
  ): GameActionResult<SeaBattleState> {
    const target = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    ) as SeaBattlePlayer;

    const { row, col } = payload;
    const cellLabel = `${ROW_LABELS[row]}${COL_LABELS[col]}`;
    let result: AttackResult;
    let shipName: string | undefined;

    const cellState = target.board[row][col];

    if (cellState === CELL_STATE.SHIP) {
      target.board[row][col] = CELL_STATE.HIT;
      result = ATTACK_RESULT.HIT;

      const hitShip = target.ships.find((s) =>
        s.cells.some((c) => c.row === row && c.col === col),
      );

      if (hitShip) {
        hitShip.hits++;
        shipName = hitShip.name;

        if (hitShip.hits === hitShip.size) {
          hitShip.sunk = true;
          target.shipsRemaining--;
          result = ATTACK_RESULT.SUNK;

          // Mark surrounding cells as miss
          markSurroundingCellsAsMiss(target, hitShip);

          state.logs.push(
            this.createLogEntry('action', `sunk ${shipName}!`, {
              senderId: player.playerId,
            }),
          );
        }
      }

      if (target.shipsRemaining === 0) {
        target.alive = false;
        state.logs.push(
          this.createLogEntry('system', 'A player has been eliminated!'),
        );
      }
    } else {
      target.board[row][col] = CELL_STATE.MISS;
      result = ATTACK_RESULT.MISS;
    }

    state.lastAttack = {
      attackerId: player.playerId,
      targetId: target.playerId,
      row,
      col,
      result,
      shipName,
    };

    state.logs.push(
      this.createLogEntry(
        'action',
        `attacked ${cellLabel} - ${result.toUpperCase()}!`,
        {
          senderId: player.playerId,
        },
      ),
    );

    // Only advance turn on miss - hit gives another turn
    if (result === ATTACK_RESULT.MISS) {
      this.advanceToNextPlayer(state);
    }

    return this.successResult(state);
  }

  private advanceToNextPlayer(state: SeaBattleState): void {
    const alivePlayers = state.players.filter((p) => p.alive);
    if (alivePlayers.length <= 1) return;

    let nextIndex = state.currentTurnIndex;
    do {
      nextIndex = (nextIndex + 1) % state.playerOrder.length;
      const nextPlayer = state.players.find(
        (p) => p.playerId === state.playerOrder[nextIndex],
      );
      if (nextPlayer?.alive) {
        state.currentTurnIndex = nextIndex;
        return;
      }
    } while (nextIndex !== state.currentTurnIndex);
  }

  private executeChat(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: ChatPayload,
  ): GameActionResult<SeaBattleState> {
    state.logs.push(
      this.createLogEntry('message', payload.message, {
        scope: payload.scope || 'all',
        senderId: player.playerId,
      }),
    );

    return this.successResult(state);
  }

  isGameOver(state: SeaBattleState): boolean {
    if (state.phase !== GAME_PHASE.BATTLE) return false;
    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.length <= 1;
  }

  getWinners(state: SeaBattleState): string[] {
    const alivePlayers = state.players.filter((p) => p.alive);
    if (alivePlayers.length === 1) {
      state.winnerId = alivePlayers[0].playerId;
      return [alivePlayers[0].playerId];
    }
    return [];
  }

  sanitizeStateForPlayer(
    state: SeaBattleState,
    playerId: string,
  ): Partial<SeaBattleState> {
    return sanitizeSeaBattleState(state, playerId);
  }

  getAvailableActions(state: SeaBattleState, playerId: string): string[] {
    return getSeaBattleAvailableActions(state, playerId);
  }

  removePlayer(
    state: SeaBattleState,
    playerId: string,
  ): GameActionResult<SeaBattleState> {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === playerId);

    if (player) {
      player.alive = false;
      newState.logs.push(
        this.createLogEntry('system', 'A player has left the game'),
      );
    }

    return this.successResult(newState);
  }
}
