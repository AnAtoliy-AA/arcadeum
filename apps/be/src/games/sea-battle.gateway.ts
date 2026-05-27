import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { SeaBattleService } from './sea-battle/sea-battle.service';
import {
  extractRoomAndUser,
  extractString,
  handleError,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { ChatScope } from './engines';
import { SeaBattleTeamConfigService } from './rooms/sea-battle-team-config.service';
import { GamesRealtimeService } from './games.realtime.service';
import { SeaBattleTeamConfigItemDto } from './dtos/set-team-config.dto';
import type { GameRoomSummary } from './rooms/game-rooms.types';

interface ShipOpPayload {
  roomId?: string;
  userId?: string;
  shipId?: string;
  cells?: { row: number; col: number }[];
  [key: string]: unknown;
}

interface ShipOp {
  svc: (
    userId: string,
    roomId: string,
    body: { shipId: string; cells: { row: number; col: number }[] },
  ) => Promise<unknown>;
  ackEvent: string;
  errorAction: string;
  errorMessage: string;
}

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class SeaBattleGateway {
  private readonly logger = new Logger(SeaBattleGateway.name);

  constructor(
    private readonly seaBattleService: SeaBattleService,
    private readonly teamConfigService: SeaBattleTeamConfigService,
    private readonly realtimeService: GamesRealtimeService,
  ) {}

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
    const withBots = !!payload?.withBots;

    try {
      const result = await this.seaBattleService.startSession(
        userId,
        roomId,
        withBots,
        payload?.botCount,
      );
      client.emit('seaBattle.session.started', maybeEncrypt(result));
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'start Sea Battle session',
          roomId,
          userId,
        },
        'Unable to start session.',
      );
    }
  }

  private async dispatchShipOp(
    client: Socket,
    payload: ShipOpPayload,
    op: ShipOp,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const shipId = extractString(payload, 'shipId');
    const cells = payload.cells;
    if (!shipId || !cells || !Array.isArray(cells)) {
      throw new WsException('shipId and cells are required');
    }
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
        maybeEncrypt({
          roomId,
          userId,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'confirm placement',
          roomId,
          userId,
        },
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
        maybeEncrypt({
          roomId,
          userId,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'reset placement',
          roomId,
          userId,
        },
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
        maybeEncrypt({
          roomId,
          userId,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'auto place ships',
          roomId,
          userId,
        },
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
    const row = payload.row;
    const col = payload.col;

    if (!targetPlayerId || row === undefined || col === undefined) {
      throw new WsException('targetPlayerId, row, and col are required');
    }

    try {
      await this.seaBattleService.attackByRoom(userId, roomId, {
        targetPlayerId,
        row,
        col,
      });
      client.emit(
        'seaBattle.session.attack_result',
        maybeEncrypt({
          roomId,
          userId,
          targetPlayerId,
          row,
          col,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'attack',
          roomId,
          userId,
        },
        'Unable to attack.',
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
        maybeEncrypt({
          roomId,
          userId,
          scope,
        }),
      );
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'post history note',
          roomId,
          userId,
        },
        'Unable to post history note.',
      );
    }
  }

  private async runTeamAction(
    client: Socket,
    context: { action: string; roomId: string; userId: string },
    failureMessage: string,
    operation: () => Promise<GameRoomSummary>,
  ): Promise<void> {
    try {
      const room = await operation();
      this.realtimeService.emitRoomUpdate(room);
      client.emit(
        'seaBattle.lobby.team_config_updated',
        maybeEncrypt({ room }),
      );
    } catch (error) {
      handleError(this.logger, error, context, failureMessage);
    }
  }

  @SubscribeMessage('seaBattle.lobby.set_team_mode')
  async handleSetTeamMode(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; enabled?: boolean },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (typeof payload?.enabled !== 'boolean') {
      throw new WsException('enabled is required (boolean).');
    }
    const enabled = payload.enabled;

    await this.runTeamAction(
      client,
      { action: 'set team mode', roomId, userId },
      'Unable to set team mode.',
      () =>
        enabled
          ? this.teamConfigService.enableTeamMode(roomId, userId)
          : this.teamConfigService.disableTeamMode(roomId, userId),
    );
  }

  @SubscribeMessage('seaBattle.lobby.set_team_config')
  async handleSetTeamConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      teams?: SeaBattleTeamConfigItemDto[];
      hideShipsFromTeammates?: boolean;
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (!Array.isArray(payload?.teams)) {
      throw new WsException('teams is required (array).');
    }
    const teams = payload.teams;
    const hideShipsFromTeammates = payload.hideShipsFromTeammates;

    await this.runTeamAction(
      client,
      { action: 'set team config', roomId, userId },
      'Unable to set team config.',
      () =>
        this.teamConfigService.setTeamConfig(userId, {
          roomId,
          teams,
          hideShipsFromTeammates,
        }),
    );
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
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetUserId =
      typeof payload.targetUserId === 'string' && payload.targetUserId.trim()
        ? payload.targetUserId.trim()
        : userId;
    if (typeof payload.teamId === 'undefined') {
      throw new WsException('teamId is required (string or null).');
    }
    const teamId = payload.teamId ?? null;

    await this.runTeamAction(
      client,
      { action: 'assign team', roomId, userId },
      'Unable to assign team.',
      () =>
        this.teamConfigService.assignPlayerToTeam(userId, {
          roomId,
          userId: targetUserId,
          teamId,
        }),
    );
  }

  @SubscribeMessage('seaBattle.lobby.add_bot_to_team')
  async handleAddBotToTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; teamId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const teamId = extractString(payload, 'teamId');

    await this.runTeamAction(
      client,
      { action: 'add bot to team', roomId, userId },
      'Unable to add bot to team.',
      () => this.teamConfigService.addBotToTeam(userId, roomId, teamId),
    );
  }

  @SubscribeMessage('seaBattle.lobby.remove_bot_from_team')
  async handleRemoveBotFromTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; targetUserId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetUserId = extractString(payload, 'targetUserId');

    await this.runTeamAction(
      client,
      { action: 'remove bot from team', roomId, userId },
      'Unable to remove bot from team.',
      () =>
        this.teamConfigService.removeBotFromTeam(userId, roomId, targetUserId),
    );
  }

  @SubscribeMessage('seaBattle.lobby.toggle_hide_ships')
  async handleToggleHideShips(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; enabled?: boolean },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    if (typeof payload?.enabled !== 'boolean') {
      throw new WsException('enabled is required (boolean).');
    }
    const enabled = payload.enabled;

    await this.runTeamAction(
      client,
      { action: 'toggle hide ships', roomId, userId },
      'Unable to toggle hide ships.',
      () => this.teamConfigService.toggleHideShips(userId, roomId, enabled),
    );
  }
}
