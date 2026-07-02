import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import {
  extractRoomAndUser,
  extractString,
  handleError,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { verifySocketJwt } from '../common/utils/socket-jwt.util';
import { ChatScope } from './engines';
import { SeaBattleTeamConfigService } from './rooms/sea-battle-team-config.service';
import { GamesRealtimeService } from './games.realtime.service';
import {
  createRunTeamAction,
  handleSetTeamMode,
  handleSetTeamConfig,
  handleAssignTeam,
  handleAddBotToTeam,
  handleRemoveBotFromTeam,
  handleToggleHideShips,
} from './sea-battle.gateway.lobby';

interface ShipOpPayload {
  roomId?: string;
  userId?: string;
  shipId?: string;
  cells?: { row: number; col: number }[];
  [key: string]: unknown;
}

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class SeaBattleGateway {
  private readonly logger = new Logger(SeaBattleGateway.name);

  @WebSocketServer() server: Server;

  constructor(
    private readonly seaBattleService: SeaBattleService,
    private readonly teamConfigService: SeaBattleTeamConfigService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.verbose(`Client connected ${client.id}`);

    const authUserId = await verifySocketJwt(
      client,
      this.jwt,
      this.config,
      this.logger,
      'SeaBattleGateway',
    );

    if (authUserId) {
      this.logger.debug(
        `Authenticated user ${authUserId} connected to SeaBattle namespace`,
      );
    } else {
      this.logger.verbose(
        `Anonymous client connected to SeaBattle namespace: ${client.id}`,
      );
    }
  }

  @SubscribeMessage('seaBattle.session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      withBots?: boolean;
      botCount?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      const result = await this.seaBattleService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount,
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

  @SubscribeMessage('seaBattle.session.place_ship')
  handlePlaceShip(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ShipOpPayload,
  ): Promise<void> {
    return this.dispatchShipOp(client, payload, {
      svc: (u, r, b) => this.seaBattleService.placeShipByRoom(u, r, b),
      ackEvent: 'seaBattle.session.ship_placed',
      errorAction: 'place ship',
      errorMessage: 'Unable to place ship.',
    });
  }

  @SubscribeMessage('seaBattle.session.move_ship')
  handleMoveShip(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ShipOpPayload,
  ): Promise<void> {
    return this.dispatchShipOp(client, payload, {
      svc: (u, r, b) => this.seaBattleService.moveShipByRoom(u, r, b),
      ackEvent: 'seaBattle.session.ship_moved',
      errorAction: 'move ship',
      errorMessage: 'Unable to move ship.',
    });
  }

  @SubscribeMessage('seaBattle.session.confirm_placement')
  async handleConfirmPlacement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.seaBattleService.confirmPlacementByRoom(userId, roomId);
      client.emit(
        'seaBattle.session.placement_confirmed',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'confirm placement', roomId, userId },
        'Unable to confirm placement.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.reset_placement')
  async handleResetPlacement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.seaBattleService.resetPlacementByRoom(userId, roomId);
      client.emit(
        'seaBattle.session.placement_reset',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'reset placement', roomId, userId },
        'Unable to reset placement.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.auto_place')
  async handleAutoPlace(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    try {
      await this.seaBattleService.autoPlaceShipsByRoom(userId, roomId);
      client.emit(
        'seaBattle.session.ships_auto_placed',
        maybeEncrypt({ roomId, userId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'auto place ships', roomId, userId },
        'Unable to auto place ships.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.attack')
  async handleAttack(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      targetPlayerId?: string;
      row?: number;
      col?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    const { row, col } = payload;
    if (!targetPlayerId || row === undefined || col === undefined)
      throw new WsException('targetPlayerId, row, and col are required');
    try {
      await this.seaBattleService.attackByRoom(userId, roomId, {
        targetPlayerId,
        row,
        col,
      });
      client.emit(
        'seaBattle.session.attack_result',
        maybeEncrypt({ roomId, userId, targetPlayerId, row, col }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'attack', roomId, userId },
        'Unable to attack.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.use_sonar')
  async handleUseSonar(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; targetPlayerId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    if (!targetPlayerId) throw new WsException('targetPlayerId is required');
    try {
      await this.seaBattleService.executeActionByRoom(
        userId,
        roomId,
        'useSonar',
        { targetPlayerId },
      );
      client.emit(
        'seaBattle.session.sonar_result',
        maybeEncrypt({ roomId, userId, targetPlayerId }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'useSonar', roomId, userId },
        'Unable to use sonar.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.use_radar')
  async handleUseRadar(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      targetPlayerId?: string;
      row?: number;
      col?: number;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    if (!targetPlayerId) throw new WsException('targetPlayerId is required');
    try {
      await this.seaBattleService.executeActionByRoom(
        userId,
        roomId,
        'useRadar',
        { targetPlayerId, row: payload.row, col: payload.col },
      );
      client.emit(
        'seaBattle.session.radar_result',
        maybeEncrypt({
          roomId,
          userId,
          targetPlayerId,
          row: payload.row,
          col: payload.col,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'useRadar', roomId, userId },
        'Unable to use radar.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.history_note')
  async handleHistoryNote(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      message?: string;
      scope?: ChatScope;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const message = extractString(payload, 'message');
    const scopeRaw =
      typeof payload?.scope === 'string'
        ? payload.scope.trim().toLowerCase()
        : 'all';
    const scope = (
      ['players', 'private', 'team'].includes(scopeRaw) ? scopeRaw : 'all'
    ) as ChatScope;
    try {
      await this.seaBattleService.postHistoryNote(
        userId,
        roomId,
        message,
        scope,
      );
      client.emit(
        'seaBattle.session.history_note.ack',
        maybeEncrypt({ roomId, userId, scope }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'post history note', roomId, userId },
        'Unable to post history note.',
      );
    }
  }

  private get runTeamAction() {
    return createRunTeamAction(this.logger, this.realtimeService);
  }

  @SubscribeMessage('seaBattle.lobby.set_team_mode')
  async handleSetTeamMode(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; enabled?: boolean },
  ): Promise<void> {
    await handleSetTeamMode(this.runTeamAction, client, payload, this.teamConfigService);
  }

  @SubscribeMessage('seaBattle.lobby.set_team_config')
  async handleSetTeamConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      teams?: import('./dtos/set-team-config.dto').SeaBattleTeamConfigItemDto[];
      hideShipsFromTeammates?: boolean;
    },
  ): Promise<void> {
    await handleSetTeamConfig(this.runTeamAction, client, payload, this.teamConfigService);
  }

  @SubscribeMessage('seaBattle.lobby.assign_team')
  async handleAssignTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      targetUserId?: string;
      teamId?: string | null;
    },
  ): Promise<void> {
    await handleAssignTeam(this.runTeamAction, client, payload, this.teamConfigService);
  }

  @SubscribeMessage('seaBattle.lobby.add_bot_to_team')
  async handleAddBotToTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; teamId?: string },
  ): Promise<void> {
    await handleAddBotToTeam(this.runTeamAction, client, payload, this.teamConfigService);
  }

  @SubscribeMessage('seaBattle.lobby.remove_bot_from_team')
  async handleRemoveBotFromTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; targetUserId?: string },
  ): Promise<void> {
    await handleRemoveBotFromTeam(this.runTeamAction, client, payload, this.teamConfigService);
  }

  @SubscribeMessage('seaBattle.lobby.toggle_hide_ships')
  async handleToggleHideShips(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; enabled?: boolean },
  ): Promise<void> {
    await handleToggleHideShips(this.runTeamAction, client, payload, this.teamConfigService);
  }
}
