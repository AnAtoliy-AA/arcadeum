import { Injectable, Logger } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../base/game-engine.interface';
import {
  DEFAULT_OPTIONS,
  GAME_PHASE,
  PLAYER_SYMBOLS,
  TEAM_PRESETS,
  WIN_LENGTH,
} from './tic-tac-toe.constants';
import type {
  CellValue,
  InitializeConfig,
  PlaceMarkPayload,
  TicTacToePlayer,
  TicTacToeState,
  TicTacToeTeam,
} from './tic-tac-toe.types';
import {
  createEmptyBoard,
  findWinningLine,
  isBoardFull,
  nextTurnIndex,
} from './tic-tac-toe.utils';
import { validateForfeit, validatePlaceMark } from './tic-tac-toe.validators';

const ACTION = {
  PLACE_MARK: 'place_mark',
  FORFEIT: 'forfeit',
} as const;

@Injectable()
export class TicTacToeEngine extends BaseGameEngine<TicTacToeState> {
  private readonly logger = new Logger(TicTacToeEngine.name);

  getMetadata(): GameMetadata {
    return {
      gameId: 'tic_tac_toe_v1',
      name: 'Tic-Tac-Toe',
      minPlayers: 2,
      maxPlayers: 4,
      version: '1.0.0',
      description:
        'Classic 3-in-a-row with themed variants and 3×3 – 9×9 boards',
      category: 'Board Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: InitializeConfig,
  ): TicTacToeState {
    const options = { ...DEFAULT_OPTIONS, ...(config?.options ?? {}) };
    const boardSize = options.boardSize;
    const winLength = WIN_LENGTH[boardSize];

    const teamMode = options.teamMode === true;
    const teams: TicTacToeTeam[] = teamMode
      ? this.buildTeams(playerIds, config?.teams)
      : [];

    const players: TicTacToePlayer[] = playerIds.map((id, idx) => ({
      playerId: id,
      symbol: PLAYER_SYMBOLS[idx % PLAYER_SYMBOLS.length],
      alive: true,
      teamId: teamMode
        ? teams.find((t) => t.playerIds.includes(id))?.id
        : undefined,
    }));

    const playerOrder = teamMode ? teams.map((t) => t.id) : [...playerIds];

    return {
      phase: GAME_PHASE.PLAYING,
      options: { ...options, boardSize },
      board: createEmptyBoard(boardSize),
      winLength,
      playerOrder,
      currentTurnIndex: 0,
      players,
      teams,
      winLine: null,
      winnerId: null,
      isDraw: false,
      logs: [this.createLogEntry('system', 'Game started.')],
    };
  }

  validateAction(
    state: TicTacToeState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    if (action === ACTION.PLACE_MARK) {
      return validatePlaceMark(
        state,
        payload as PlaceMarkPayload,
        context.userId,
      ).ok;
    }
    if (action === ACTION.FORFEIT) {
      return validateForfeit(state, context.userId).ok;
    }
    return false;
  }

  executeAction(
    state: TicTacToeState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<TicTacToeState> {
    if (action === ACTION.PLACE_MARK) {
      return this.executePlaceMark(state, context, payload as PlaceMarkPayload);
    }
    if (action === ACTION.FORFEIT) {
      return this.executeForfeit(state, context);
    }
    return this.errorResult(`Unknown action: ${action}`);
  }

  isGameOver(state: TicTacToeState): boolean {
    return state.phase === GAME_PHASE.GAME_OVER;
  }

  getWinners(state: TicTacToeState): string[] {
    if (!state.winnerId) return [];
    if (state.options.teamMode) {
      const team = state.teams.find((t) => t.id === state.winnerId);
      return team ? [...team.playerIds] : [];
    }
    return [state.winnerId];
  }

  sanitizeStateForPlayer(state: TicTacToeState): Partial<TicTacToeState> {
    return state;
  }

  getAvailableActions(state: TicTacToeState, playerId: string): string[] {
    if (state.phase !== GAME_PHASE.PLAYING) return [];
    const player = state.players.find((p) => p.playerId === playerId);
    if (!player?.alive) return [];

    const isCurrent = this.isCurrentShooter(state, playerId);
    return isCurrent ? [ACTION.PLACE_MARK, ACTION.FORFEIT] : [ACTION.FORFEIT];
  }

  private executePlaceMark(
    state: TicTacToeState,
    context: GameActionContext,
    payload: PlaceMarkPayload,
  ): GameActionResult<TicTacToeState> {
    const validation = validatePlaceMark(state, payload, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const ownerId = newState.options.teamMode
      ? newState.players.find((p) => p.playerId === context.userId)?.teamId
      : context.userId;
    if (!ownerId) return this.errorResult('Owner not found');

    newState.board[payload.row][payload.col] = ownerId as CellValue;

    const placedLog = this.createLogEntry(
      'action',
      `Mark placed at (${payload.row + 1}, ${payload.col + 1})`,
      { senderId: context.userId },
    );
    newState.logs.push(placedLog);

    const winLine = findWinningLine(
      newState.board,
      newState.options.boardSize,
      newState.winLength,
      ownerId,
    );

    if (winLine) {
      newState.winLine = winLine;
      newState.winnerId = ownerId;
      newState.phase = GAME_PHASE.GAME_OVER;
      newState.logs.push(
        this.createLogEntry(
          'system',
          `${this.entryLabel(newState, ownerId)} wins!`,
        ),
      );
      return this.successResult(newState);
    }

    if (isBoardFull(newState.board)) {
      newState.isDraw = true;
      newState.phase = GAME_PHASE.GAME_OVER;
      newState.logs.push(this.createLogEntry('system', 'Draw.'));
      return this.successResult(newState);
    }

    this.advanceTicTacToeTurn(newState);
    return this.successResult(newState);
  }

  private executeForfeit(
    state: TicTacToeState,
    context: GameActionContext,
  ): GameActionResult<TicTacToeState> {
    const validation = validateForfeit(state, context.userId);
    if (!validation.ok) return this.errorResult(validation.error);

    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');
    player.alive = false;

    newState.logs.push(
      this.createLogEntry('system', 'A player forfeited.', {
        senderId: context.userId,
      }),
    );

    if (newState.options.teamMode) {
      const team = newState.teams.find((t) => t.id === player.teamId);
      if (team) {
        const stillAlive = team.playerIds.some(
          (pid) => newState.players.find((p) => p.playerId === pid)?.alive,
        );
        if (!stillAlive) {
          const aliveTeams = newState.teams.filter((t) =>
            t.playerIds.some(
              (pid) => newState.players.find((p) => p.playerId === pid)?.alive,
            ),
          );
          if (aliveTeams.length === 1) {
            newState.winnerId = aliveTeams[0].id;
            newState.phase = GAME_PHASE.GAME_OVER;
            return this.successResult(newState);
          }
        }
      }
    } else {
      const alivePlayers = newState.players.filter((p) => p.alive);
      if (alivePlayers.length === 1) {
        newState.winnerId = alivePlayers[0].playerId;
        newState.phase = GAME_PHASE.GAME_OVER;
        return this.successResult(newState);
      }
    }

    this.advanceTicTacToeTurn(newState);
    return this.successResult(newState);
  }

  private isCurrentShooter(state: TicTacToeState, userId: string): boolean {
    const currentEntryId = state.playerOrder[state.currentTurnIndex];
    if (!state.options.teamMode) return currentEntryId === userId;
    const team = state.teams.find((t) => t.id === currentEntryId);
    if (!team) return false;
    return team.playerIds[team.currentShooterIndex] === userId;
  }

  private advanceTicTacToeTurn(state: TicTacToeState): void {
    if (state.options.teamMode) {
      const currentTeam = state.teams.find(
        (t) => t.id === state.playerOrder[state.currentTurnIndex],
      );
      if (currentTeam) {
        currentTeam.currentShooterIndex =
          (currentTeam.currentShooterIndex + 1) % currentTeam.playerIds.length;
      }
      state.currentTurnIndex = nextTurnIndex(
        state.currentTurnIndex,
        state.playerOrder,
        (teamId) => {
          const team = state.teams.find((t) => t.id === teamId);
          if (!team) return false;
          return team.playerIds.some(
            (pid) => state.players.find((p) => p.playerId === pid)?.alive,
          );
        },
      );
    } else {
      state.currentTurnIndex = nextTurnIndex(
        state.currentTurnIndex,
        state.playerOrder,
        (playerId) =>
          state.players.find((p) => p.playerId === playerId)?.alive === true,
      );
    }
  }

  private buildTeams(
    playerIds: string[],
    overrides?: InitializeConfig['teams'],
  ): TicTacToeTeam[] {
    if (overrides && overrides.length > 0) {
      return overrides.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        playerIds: [...t.playerIds],
        currentShooterIndex: 0,
      }));
    }
    const half = Math.ceil(playerIds.length / 2);
    return [
      {
        ...TEAM_PRESETS[0],
        playerIds: playerIds.slice(0, half),
        currentShooterIndex: 0,
      },
      {
        ...TEAM_PRESETS[1],
        playerIds: playerIds.slice(half),
        currentShooterIndex: 0,
      },
    ];
  }

  private entryLabel(state: TicTacToeState, entryId: string): string {
    if (state.options.teamMode) {
      const team = state.teams.find((t) => t.id === entryId);
      return team?.name ?? 'Team';
    }
    return entryId;
  }
}
