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
import { ChatScope } from './engines';

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: '*' },
})
@Injectable()
export class SeaBattleGateway {
  private readonly logger = new Logger(SeaBattleGateway.name);

  constructor(private readonly seaBattleService: SeaBattleService) {}

  @SubscribeMessage('seaBattle.session.start')
  async handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId?: string; userId?: string; withBots?: boolean },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const withBots = !!payload?.withBots;

    try {
      const result = await this.seaBattleService.startSession(
        userId,
        roomId,
        withBots,
      );
      client.emit('seaBattle.session.started', result);
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

  @SubscribeMessage('seaBattle.session.place_ship')
  async handlePlaceShip(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId?: string;
      userId?: string;
      shipId?: string;
      cells?: { row: number; col: number }[];
    },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const shipId = extractString(payload, 'shipId');
    const cells = payload.cells;

    if (!shipId || !cells || !Array.isArray(cells)) {
      throw new WsException('shipId and cells are required');
    }

    try {
      await this.seaBattleService.placeShipByRoom(userId, roomId, {
        shipId,
        cells,
      });
      client.emit('seaBattle.session.ship_placed', {
        roomId,
        userId,
        shipId,
      });
    } catch (error) {
      handleError(
        this.logger,
        error,
        {
          action: 'place ship',
          roomId,
          userId,
        },
        'Unable to place ship.',
      );
    }
  }

  @SubscribeMessage('seaBattle.session.confirm_placement')
  async handleConfirmPlacement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId?: string; userId?: string },
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);

    try {
      await this.seaBattleService.confirmPlacementByRoom(userId, roomId);
      client.emit('seaBattle.session.placement_confirmed', {
        roomId,
        userId,
      });
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
      client.emit('seaBattle.session.placement_reset', {
        roomId,
        userId,
      });
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
      client.emit('seaBattle.session.ships_auto_placed', {
        roomId,
        userId,
      });
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
      client.emit('seaBattle.session.attack_result', {
        roomId,
        userId,
        targetPlayerId,
        row,
        col,
      });
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

    const scope = ['players', 'private'].includes(scopeRaw) ? scopeRaw : 'all';

    try {
      await this.seaBattleService.postHistoryNote(
        userId,
        roomId,
        message,
        scope as ChatScope,
      );
      client.emit('seaBattle.session.history_note.ack', {
        roomId,
        userId,
        scope,
      });
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
}
