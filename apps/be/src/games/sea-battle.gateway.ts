import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type { GameMessageHandlerFn } from './game-message-handler.interface';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import {
  BaseGameGateway,
  extractRoomAndUser,
  extractString,
  handleError,
  maybeEncrypt,
  validatePayloadUserId,
} from './common/base-game.gateway';
import { ChatScope } from './engines';
import { SeaBattleTeamConfigService } from './rooms/sea-battle-team-config.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GamesService } from './games.service';
import {
  createRunTeamAction,
  handleSetTeamMode,
  handleSetTeamConfig,
  handleAssignTeam,
  handleAddBotToTeam,
  handleRemoveBotFromTeam,
  handleToggleHideShips,
} from './sea-battle.gateway.lobby';
import type { AiDifficulty } from './engines/sea-battle/sea-battle.types';

type ShipOpPayload = Record<string, unknown> & {
  shipId?: string;
  cells?: { row: number; col: number }[];
};

@Injectable()
export class SeaBattleGateway extends BaseGameGateway<Record<string, unknown>> {
  protected readonly logger = new Logger(SeaBattleGateway.name);
  protected readonly eventPrefix = 'seaBattle';

  constructor(
    protected readonly gameService: SeaBattleService,
    private readonly teamConfigService: SeaBattleTeamConfigService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly gamesService: GamesService,
  ) {
    super();
  }

  private get runTeamAction() {
    return createRunTeamAction(this.logger, this.realtimeService);
  }

  private async dispatchShipOp(
    client: Socket,
    payload: ShipOpPayload,
    op: {
      svc: (
        userId: string,
        roomId: string,
        body: { shipId: string; cells: { row: number; col: number }[] },
      ) => Promise<unknown>;
      ackEvent: string;
      errorAction: string;
      errorMessage: string;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const shipId = extractString(payload, 'shipId');
    const cells = payload.cells;
    if (!shipId || !cells || !Array.isArray(cells))
      throw new WsException('shipId and cells are required');
    validatePayloadUserId(client, userId);
    try {
      await op.svc(userId, roomId, { shipId, cells });
      client.emit(op.ackEvent, maybeEncrypt({ roomId, userId, shipId }));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: op.errorAction, roomId, userId },
        op.errorMessage,
      );
    }
  }

  private async dispatchAction(
    client: Socket,
    payload: Record<string, unknown>,
    action: string,
    ackEvent: string,
    emitExtra?: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    if (!targetPlayerId) throw new WsException('targetPlayerId is required');
    validatePayloadUserId(client, userId);
    try {
      await this.gameService.executeActionByRoom(userId, roomId, action, {
        targetPlayerId,
        row: payload.row,
        col: payload.col,
      });
      client.emit(
        ackEvent,
        maybeEncrypt({ roomId, userId, targetPlayerId, ...emitExtra }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action, roomId, userId },
        `Unable to ${action}.`,
      );
    }
  }

  protected override async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.gameService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
        {
          difficulty: payload?.difficulty as AiDifficulty | undefined,
          gridSize: payload?.gridSize as number | undefined,
          shipCount: payload?.shipCount as number | undefined,
          variant: payload?.variant as string | undefined,
        },
      );
      client.emit('seaBattle.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'start Sea Battle session', roomId, userId },
        'Unable to start session.',
      );
    }
  }

  protected getGameHandlers(): Record<string, GameMessageHandlerFn> {
    return {
      'seaBattle.session.place_ship': (client, payload) =>
        this.dispatchShipOp(client, payload, {
          svc: (u, r, b) => this.gameService.placeShipByRoom(u, r, b),
          ackEvent: 'seaBattle.session.ship_placed',
          errorAction: 'place ship',
          errorMessage: 'Unable to place ship.',
        }),
      'seaBattle.session.move_ship': (client, payload) =>
        this.dispatchShipOp(client, payload, {
          svc: (u, r, b) => this.gameService.moveShipByRoom(u, r, b),
          ackEvent: 'seaBattle.session.ship_moved',
          errorAction: 'move ship',
          errorMessage: 'Unable to move ship.',
        }),
      'seaBattle.session.confirm_placement': this.wrapHandler(
        'confirm placement',
        async (client, payload, roomId, userId) => {
          await this.gameService.confirmPlacementByRoom(
            userId,
            roomId,
            payload.ships as
              | Array<{ shipId: string; cells: { row: number; col: number }[] }>
              | undefined,
          );
          client.emit(
            'seaBattle.session.placement_confirmed',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'seaBattle.session.reset_placement': this.wrapHandler(
        'reset placement',
        async (client, _payload, roomId, userId) => {
          await this.gameService.resetPlacementByRoom(userId, roomId);
          client.emit(
            'seaBattle.session.placement_reset',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'seaBattle.session.auto_place': this.wrapHandler(
        'auto place ships',
        async (client, _payload, roomId, userId) => {
          await this.gameService.autoPlaceShipsByRoom(userId, roomId);
          client.emit(
            'seaBattle.session.ships_auto_placed',
            maybeEncrypt({ roomId, userId }),
          );
        },
      ),
      'seaBattle.session.attack': this.wrapHandler(
        'attack',
        async (client, payload, roomId, userId) => {
          const targetPlayerId = extractString(payload, 'targetPlayerId');
          const row = payload.row as number | undefined;
          const col = payload.col as number | undefined;
          if (!targetPlayerId || row === undefined || col === undefined)
            throw new WsException('targetPlayerId, row, and col are required');
          await this.gameService.attackByRoom(userId, roomId, {
            targetPlayerId,
            row,
            col,
          });
          client.emit(
            'seaBattle.session.attack_result',
            maybeEncrypt({ roomId, userId, targetPlayerId, row, col }),
          );
        },
      ),
      'seaBattle.session.use_sonar': (client, payload) =>
        this.dispatchAction(
          client,
          payload,
          'useSonar',
          'seaBattle.session.sonar_result',
        ),
      'seaBattle.session.use_radar': (client, payload) =>
        this.dispatchAction(
          client,
          payload,
          'useRadar',
          'seaBattle.session.radar_result',
          { row: payload.row, col: payload.col },
        ),
      'seaBattle.session.history_note': this.wrapHandler(
        'post history note',
        async (client, payload, roomId, userId) => {
          const message = extractString(payload, 'message');
          const raw =
            typeof payload?.scope === 'string'
              ? payload.scope.trim().toLowerCase()
              : 'all';
          const scope = (
            ['players', 'private', 'team'].includes(raw) ? raw : 'all'
          ) as ChatScope;
          await this.gamesService.postHistoryNote(
            roomId,
            userId,
            message,
            scope,
          );
          client.emit(
            'seaBattle.session.history_note.ack',
            maybeEncrypt({ roomId, userId, scope }),
          );
        },
      ),
      'seaBattle.lobby.set_team_mode': (client, payload) =>
        this.handleSetTeamMode(client, payload),
      'seaBattle.lobby.set_team_config': (client, payload) =>
        this.handleSetTeamConfig(client, payload),
      'seaBattle.lobby.assign_team': (client, payload) =>
        this.handleAssignTeam(client, payload),
      'seaBattle.lobby.add_bot_to_team': (client, payload) =>
        this.handleAddBotToTeam(client, payload),
      'seaBattle.lobby.remove_bot_from_team': (client, payload) =>
        this.handleRemoveBotFromTeam(client, payload),
      'seaBattle.lobby.toggle_hide_ships': (client, payload) =>
        this.handleToggleHideShips(client, payload),
    };
  }

  private async handleSetTeamMode(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await handleSetTeamMode(
      this.runTeamAction,
      client,
      payload,
      this.teamConfigService,
    );
  }

  private async handleSetTeamConfig(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await handleSetTeamConfig(
      this.runTeamAction,
      client,
      payload,
      this.teamConfigService,
    );
  }

  private async handleAssignTeam(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await handleAssignTeam(
      this.runTeamAction,
      client,
      payload,
      this.teamConfigService,
    );
  }

  private async handleAddBotToTeam(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await handleAddBotToTeam(
      this.runTeamAction,
      client,
      payload,
      this.teamConfigService,
    );
  }

  private async handleRemoveBotFromTeam(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await handleRemoveBotFromTeam(
      this.runTeamAction,
      client,
      payload,
      this.teamConfigService,
    );
  }

  private async handleToggleHideShips(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await handleToggleHideShips(
      this.runTeamAction,
      client,
      payload,
      this.teamConfigService,
    );
  }
}
