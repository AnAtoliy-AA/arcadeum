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
  areCellsValid,
  areCellsConnected,
  markSurroundingCellsAsMiss,
  sanitizeSeaBattleState,
  getSeaBattleAvailableActions,
} from './sea-battle.utils';

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
        return this.validatePlaceShip(
          state,
          player,
          payload as PlaceShipPayload,
        );
      case 'confirmPlacement':
        return this.validateConfirmPlacement(state, player);
      case 'attack':
        return this.validateAttack(state, player, payload as AttackPayload);

      case 'resetPlacement':
        return this.validateResetPlacement(state, player);
      case 'chat':
        return true;
      default:
        return false;
    }
  }

  private validatePlaceShip(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: PlaceShipPayload,
  ): boolean {
    if (state.phase !== GAME_PHASE.PLACEMENT) return false;
    if (player.placementComplete) return false;
    if (!payload?.shipId || !payload?.cells) return false;

    const shipConfig = SHIPS.find((s) => s.id === payload.shipId);
    if (!shipConfig) return false;
    if (payload.cells.length !== shipConfig.size) return false;

    // Check if ship already placed
    if (player.ships.some((s) => s.id === payload.shipId)) return false;

    // Check cells are valid and connected
    if (!areCellsValid(payload.cells)) return false;
    if (!areCellsConnected(payload.cells)) return false;

    // Check cells don't overlap with existing ships AND are not adjacent
    for (const cell of payload.cells) {
      if (player.board[cell.row][cell.col] !== CELL_STATE.EMPTY) {
        return false;
      }

      // Check surrounding cells
      const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      for (const [dr, dc] of directions) {
        const r = cell.row + dr;
        const c = cell.col + dc;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          if (player.board[r][c] === CELL_STATE.SHIP) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private validateConfirmPlacement(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): boolean {
    if (state.phase !== GAME_PHASE.PLACEMENT) return false;
    if (player.placementComplete) return false;
    return player.ships.length === SHIPS.length;
  }

  private validateResetPlacement(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): boolean {
    if (state.phase !== GAME_PHASE.PLACEMENT) return false;
    if (player.placementComplete) return false;
    return true;
  }

  private validateAttack(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: AttackPayload,
  ): boolean {
    if (state.phase !== GAME_PHASE.BATTLE) return false;

    const currentPlayerId = state.playerOrder[state.currentTurnIndex];
    if (player.playerId !== currentPlayerId) return false;

    if (
      !payload?.targetPlayerId ||
      payload.row === undefined ||
      payload.col === undefined
    ) {
      return false;
    }

    if (payload.targetPlayerId === player.playerId) return false;

    const target = state.players.find(
      (p) => p.playerId === payload.targetPlayerId,
    );
    if (!target || !target.alive) return false;

    if (
      payload.row < 0 ||
      payload.row >= BOARD_SIZE ||
      payload.col < 0 ||
      payload.col >= BOARD_SIZE
    ) {
      return false;
    }

    const cellState = target.board[payload.row][payload.col];
    if (cellState === CELL_STATE.HIT || cellState === CELL_STATE.MISS) {
      return false;
    }

    return true;
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
