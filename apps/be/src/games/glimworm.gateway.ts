import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';

import {
  extractRoomAndUser,
  handleError,
  validatePayloadUserId,
} from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { GlimwormService } from './glimworm/glimworm.service';
import type { GlimwormMode } from './glimworm/glimworm.types';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

const GLIMWORM_GAME_ID = 'glimworm_v1';

const VALID_MODES: ReadonlySet<GlimwormMode> = new Set([
  'battle_royale',
  'time_attack',
  'lives_heats',
]);

@Injectable()
export class GlimwormGateway implements GameMessageHandler {
  private readonly logger = new Logger(GlimwormGateway.name);

  constructor(
    private readonly glimwormService: GlimwormService,
    private readonly visibility: GameVisibilityService,
    private readonly roleResolver: UserRoleResolver,
  ) {}

  private async assertCanSee(
    userId: string | undefined,
    variant?: string,
  ): Promise<void> {
    const role = await this.roleResolver.resolveRole(userId);
    await this.visibility.assertVisible(role, GLIMWORM_GAME_ID, variant);
  }

  private handleException(params: {
    error: unknown;
    action: string;
    roomId?: string;
    userId?: string;
    userMessage: string;
  }): void {
    const { error, action, roomId, userId, userMessage } = params;
    handleError(
      this.logger,
      error,
      { action, roomId: roomId ?? '', userId: userId ?? '' },
      userMessage,
    );
  }

  readonly handlers: Record<string, GameMessageHandlerFn> = {
    'glimworm.join': (client, payload) => this.handleJoin(client, payload),
    'glimworm.ready': (client, payload) => this.handleReady(client, payload),
    'glimworm.input': (client, payload) => this.handleInput(client, payload),
    'glimworm.start': (client, payload) => this.handleStart(client, payload),
    'glimworm.restart': (client, payload) =>
      this.handleRestart(client, payload),
    'glimworm.rematch': (client, payload) =>
      this.handleRematch(client, payload),
    'glimworm.color.pick': (client, payload) =>
      this.handleColorPick(client, payload),
  };

  private handleJoin(client: Socket, payload: Record<string, unknown>): void {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const color =
        typeof payload.color === 'string' ? payload.color : undefined;
      const worm = this.glimwormService.joinRoom(roomId, userId, color);
      client.emit(
        'glimworm.join.ack',
        maybeEncrypt({ roomId, userId, color: worm.color }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm join',
        roomId,
        userId,
        userMessage: 'Unable to join Glimworm room.',
      });
    }
  }

  private handleReady(client: Socket, payload: Record<string, unknown>): void {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const ready = payload.ready === true;
      this.glimwormService.markReady(roomId, userId, ready);
      client.emit(
        'glimworm.ready.ack',
        maybeEncrypt({ roomId, userId, ready }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm ready',
        roomId,
        userId,
        userMessage: 'Unable to update ready state.',
      });
    }
  }

  private handleInput(client: Socket, payload: Record<string, unknown>): void {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const angle =
        typeof payload.angle === 'number' ? payload.angle : Number.NaN;
      const usePowerup = payload.usePowerup === true;
      this.glimwormService.submitInput(roomId, userId, { angle, usePowerup });
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm input',
        roomId,
        userId,
        userMessage: 'Unable to submit input.',
      });
    }
  }

  private async handleStart(
    client: Socket,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const modeRaw =
        typeof payload.variant === 'string' ? payload.variant : '';
      if (!VALID_MODES.has(modeRaw as GlimwormMode)) {
        throw new Error(`Invalid mode: ${modeRaw}`);
      }
      const mode = modeRaw as GlimwormMode;
      await this.assertCanSee(userId, mode);
      const powerupsEnabled = payload.powerupsEnabled === true;
      const fillWithBots = payload.fillWithBots === true;
      const botCount =
        typeof payload.botCount === 'number' &&
        Number.isFinite(payload.botCount)
          ? payload.botCount
          : undefined;
      this.glimwormService.start(roomId, userId, {
        mode,
        powerupsEnabled,
        fillWithBots,
        botCount,
      });
      client.emit(
        'glimworm.start.ack',
        maybeEncrypt({ roomId, userId, variant: mode, powerupsEnabled }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm start',
        roomId,
        userId,
        userMessage: 'Unable to start round.',
      });
    }
  }

  private handleRestart(
    client: Socket,
    payload: Record<string, unknown>,
  ): void {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      this.glimwormService.restart(roomId, userId);
      client.emit('glimworm.restart.ack', maybeEncrypt({ roomId, userId }));
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm restart',
        roomId,
        userId,
        userMessage: 'Unable to restart round.',
      });
    }
  }

  private handleRematch(
    client: Socket,
    payload: Record<string, unknown>,
  ): void {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      this.glimwormService.rematch(roomId, userId);
      client.emit('glimworm.rematch.ack', maybeEncrypt({ roomId, userId }));
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm rematch',
        roomId,
        userId,
        userMessage: 'Unable to rematch.',
      });
    }
  }

  private handleColorPick(
    client: Socket,
    payload: Record<string, unknown>,
  ): void {
    const { roomId, userId } = extractRoomAndUser(payload);
    validatePayloadUserId(client, userId);
    try {
      const color = typeof payload.color === 'string' ? payload.color : '';
      const picked = this.glimwormService.setColor(roomId, userId, color);
      client.emit(
        'glimworm.color.pick.ack',
        maybeEncrypt({ roomId, userId, color: picked }),
      );
    } catch (error) {
      this.handleException({
        error,
        action: 'glimworm color pick',
        roomId,
        userId,
        userMessage: 'Unable to pick color.',
      });
    }
  }
}
