import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import {
  extractRoomAndUser,
  extractString,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
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
import type { SeaBattleTeamConfigItemDto } from './dtos/set-team-config.dto';

type ShipOpPayload = Record<string, unknown> & {
  shipId?: string;
  cells?: { row: number; col: number }[];
};

@Injectable()
export class SeaBattleGateway implements GameMessageHandler {
  private readonly logger = new Logger(SeaBattleGateway.name);

  constructor(
    private readonly seaBattleService: SeaBattleService,
    private readonly teamConfigService: SeaBattleTeamConfigService,
    private readonly realtimeService: GamesRealtimeService,
  ) {}

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
      await this.seaBattleService.executeActionByRoom(userId, roomId, action, {
        targetPlayerId,
        row: payload.row as number | undefined,
        col: payload.col as number | undefined,
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

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'seaBattle.session.start': (client, payload) =>
      this.handleSessionStart(client, payload),
    'seaBattle.session.place_ship': (client, payload) =>
      this.handlePlaceShip(client, payload),
    'seaBattle.session.move_ship': (client, payload) =>
      this.handleMoveShip(client, payload),
    'seaBattle.session.confirm_placement': (client, payload) =>
      this.handleConfirmPlacement(client, payload),
    'seaBattle.session.reset_placement': (client, payload) =>
      this.handleResetPlacement(client, payload),
    'seaBattle.session.auto_place': (client, payload) =>
      this.handleAutoPlace(client, payload),
    'seaBattle.session.attack': (client, payload) =>
      this.handleAttack(client, payload),
    'seaBattle.session.use_sonar': (client, payload) =>
      this.handleUseSonar(client, payload),
    'seaBattle.session.use_radar': (client, payload) =>
      this.handleUseRadar(client, payload),
    'seaBattle.session.history_note': (client, payload) =>
      this.handleHistoryNote(client, payload),
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

  private async handleSessionStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const result = await this.seaBattleService.startSession(
        userId,
        roomId,
        !!payload?.withBots,
        payload?.botCount as number | undefined,
        payload?.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        payload?.gridSize as number | undefined,
        payload?.shipCount as number | undefined,
        payload?.variant as string | undefined,
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

  private handlePlaceShip(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    return this.dispatchShipOp(client, payload as ShipOpPayload, {
      svc: (u, r, b) => this.seaBattleService.placeShipByRoom(u, r, b),
      ackEvent: 'seaBattle.session.ship_placed',
      errorAction: 'place ship',
      errorMessage: 'Unable to place ship.',
    });
  }

  private handleMoveShip(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    return this.dispatchShipOp(client, payload as ShipOpPayload, {
      svc: (u, r, b) => this.seaBattleService.moveShipByRoom(u, r, b),
      ackEvent: 'seaBattle.session.ship_moved',
      errorAction: 'move ship',
      errorMessage: 'Unable to move ship.',
    });
  }

  private async handleConfirmPlacement(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      await this.seaBattleService.confirmPlacementByRoom(
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
    } catch (error) {
      handleError(
        this.logger,
        error,
        { action: 'confirm placement', roomId, userId },
        'Unable to confirm placement.',
      );
    }
  }

  private async handleResetPlacement(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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

  private async handleAutoPlace(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
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

  private async handleAttack(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const targetPlayerId = extractString(payload, 'targetPlayerId');
    const row = payload.row as number | undefined;
    const col = payload.col as number | undefined;
    if (!targetPlayerId || row === undefined || col === undefined)
      throw new WsException('targetPlayerId, row, and col are required');
    validatePayloadUserId(client, userId);
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

  private handleUseSonar(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    return this.dispatchAction(
      client,
      payload,
      'useSonar',
      'seaBattle.session.sonar_result',
    );
  }

  private handleUseRadar(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    return this.dispatchAction(
      client,
      payload,
      'useRadar',
      'seaBattle.session.radar_result',
      { row: payload.row, col: payload.col },
    );
  }

  private async handleHistoryNote(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    const message = extractString(payload, 'message');
    const raw =
      typeof payload?.scope === 'string'
        ? payload.scope.trim().toLowerCase()
        : 'all';
    const scope = (
      ['players', 'private', 'team'].includes(raw) ? raw : 'all'
    ) as ChatScope;
    validatePayloadUserId(client, userId);
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
      payload as {
        roomId?: string;
        userId?: string;
        teams?: SeaBattleTeamConfigItemDto[];
        hideShipsFromTeammates?: boolean;
      },
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
