import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import type {
  GameActionContext,
  GameActionResult,
  GameMetadata,
} from '../../base/game-engine.interface';
import {
  DEFAULT_OPTIONS,
  GAME_PHASE,
  INFINITY_MAX_BOARD_SIZE,
  PLAYER_SYMBOLS,
  TEAM_PRESETS,
  WIN_LENGTH,
} from './tic-tac-toe.constants';
import type {
  InitializeConfig,
  PlaceMarkPayload,
  TicTacToePlayer,
  TicTacToeState,
  TicTacToeTeam,
} from './tic-tac-toe.types';
import {
  createEmptyBoard,
  expandBoard,
  findWinningLine,
  indexToCentered,
  isBoardFull,
  nextTurnIndex,
} from './tic-tac-toe.utils';
import { validateForfeit, validatePlaceMark } from './tic-tac-toe.validators';
import { validateTicTacToeConfig } from './tic-tac-toe.config';

const ACTION = {
  PLACE_MARK: 'place_mark',
  FORFEIT: 'forfeit',
} as const;
export class TicTacToeEngine extends BaseGameEngine<TicTacToeState> {
  private readonly logger = createLogger('TicTacToeEngine');

  getMetadata(): GameMetadata {
    return {
      gameId: 'tic_tac_toe_v1',
      name: 'Tic-Tac-Toe',
      minPlayers: 2,
      maxPlayers: 5,
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
    const isInfinity = boardSize === 'infinity';
    const initialSize = isInfinity ? 9 : boardSize;
    const winLength = isInfinity
      ? options.infinityWinLength
      : WIN_LENGTH[boardSize];

    const teamMode = options.teamMode === true;
    const teams: TicTacToeTeam[] = teamMode
      ? this.buildTeams(playerIds, config?.teams)
      : [];

    const shouldRandomize =
      (config as Record<string, unknown>)?.firstPlayer === 'random';

    const orderedPlayerIds = shouldRandomize
      ? [...playerIds].sort(() => Math.random() - 0.5)
      : [...playerIds];

    const players: TicTacToePlayer[] = orderedPlayerIds.map((id, idx) => ({
      playerId: id,
      symbol: PLAYER_SYMBOLS[idx % PLAYER_SYMBOLS.length],
      alive: true,
      teamId: teamMode
        ? teams.find((t) => t.playerIds.includes(id))?.id
        : undefined,
    }));

    const playerOrder = teamMode
      ? shouldRandomize
        ? [...teams].sort(() => Math.random() - 0.5).map((t) => t.id)
        : teams.map((t) => t.id)
      : orderedPlayerIds;

    return {
      phase: GAME_PHASE.PLAYING,
      options: { ...options, boardSize },
      board: createEmptyBoard(initialSize),
      winLength,
      origin: {
        row: Math.floor(initialSize / 2),
        col: Math.floor(initialSize / 2),
      },
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

  validateConfig(config: Record<string, unknown>): boolean {
    return validateTicTacToeConfig(config);
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
    let result: GameActionResult<TicTacToeState>;
    if (action === ACTION.PLACE_MARK) {
      result = this.executePlaceMark(
        state,
        context,
        payload as PlaceMarkPayload,
      );
    } else if (action === ACTION.FORFEIT) {
      result = this.executeForfeit(state, context);
    } else {
      return this.errorResult(`Unknown action: ${action}`);
    }

    if (result.success && result.state) {
      const history =
        ((state as Record<string, unknown>).stateHistory as unknown[]) ?? [];
      // Strip stateHistory and logs from the snapshot to prevent unbounded
      // BSON document growth (especially on infinity boards).
      const src = state as Record<string, unknown>;
      const stateSnapshot: Record<string, unknown> = {};
      for (const key of Object.keys(src)) {
        if (key !== 'stateHistory' && key !== 'logs')
          stateSnapshot[key] = src[key];
      }
      result.state = {
        ...result.state,
        stateHistory: [...history.slice(-3), structuredClone(stateSnapshot)],
      };
    }

    // Trim logs to prevent unbounded BSON document growth
    if (result.state && result.state.logs.length > 100) {
      result.state = {
        ...result.state,
        logs: result.state.logs.slice(-100),
      };
    }

    return result;
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

  getResult(
    state: TicTacToeState,
  ): import('../../base/game-engine.interface').GameResult {
    if (!this.isGameOver(state)) {
      return { winnerIds: [], isDraw: false };
    }
    return {
      winnerIds: this.getWinners(state),
      isDraw: state.isDraw,
    };
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

    newState.board[payload.row][payload.col] = ownerId;

    let originDelta = { row: 0, col: 0 };
    const isInfinity = newState.options.boardSize === 'infinity';
    if (isInfinity && newState.board.length < INFINITY_MAX_BOARD_SIZE) {
      const expanded = expandBoard(
        newState.board,
        payload.row,
        payload.col,
        newState.options.expansionMargin,
      );
      newState.board = expanded.board;
      originDelta = expanded.originDelta;
      newState.origin = {
        row: newState.origin.row + originDelta.row,
        col: newState.origin.col + originDelta.col,
      };
    }

    const centered = indexToCentered(
      {
        row: payload.row + originDelta.row,
        col: payload.col + originDelta.col,
      },
      newState.origin,
    );
    const placedLog = this.createLogEntry(
      'action',
      `Mark placed at (${centered.row}, ${centered.col})`,
      { senderId: context.userId },
    );
    newState.logs.push(placedLog);

    const boardSize = newState.board.length;
    const winLine = findWinningLine(
      newState.board,
      boardSize,
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

    if (!isInfinity && isBoardFull(newState.board)) {
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
