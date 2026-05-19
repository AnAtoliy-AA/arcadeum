import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';

import { extractRoomAndUser, handleError } from './games.gateway.utils';
import { maybeEncrypt } from '../common/utils/socket-encryption.util';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { GlimwormService } from './glimworm/glimworm.service';
import type { GlimwormVariant } from './glimworm/glimworm.types';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

const GLIMWORM_GAME_ID = 'glimworm_v1';

interface GlimwormInputBody {
  roomId: string;
  userId: string;
  angle: unknown;
  usePowerup?: unknown;
}

interface GlimwormStartBody {
  roomId: string;
  userId: string;
  variant: unknown;
  powerupsEnabled?: unknown;
  fillWithBots?: unknown;
  botCount?: unknown;
}

interface GlimwormColorPickBody {
  roomId: string;
  userId: string;
  color: unknown;
}

interface GlimwormJoinBody {
  roomId: string;
  userId: string;
  color?: unknown;
}

interface GlimwormReadyBody {
  roomId: string;
  userId: string;
  ready: unknown;
}

interface GlimwormRestartBody {
  roomId: string;
  userId: string;
}

const VALID_VARIANTS: ReadonlySet<GlimwormVariant> = new Set([
  'battle_royale',
  'time_attack',
  'lives_heats',
]);

@WebSocketGateway({
  namespace: 'games',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class GlimwormGateway {
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

  @SubscribeMessage('glimworm.join')
  handleJoin(
    @MessageBody() payload: GlimwormJoinBody,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
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

  @SubscribeMessage('glimworm.ready')
  handleReady(
    @MessageBody() payload: GlimwormReadyBody,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
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

  @SubscribeMessage('glimworm.input')
  handleInput(
    @MessageBody() payload: GlimwormInputBody,
    @ConnectedSocket() client: Socket,
  ): void {
    void client;
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
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

  @SubscribeMessage('glimworm.start')
  async handleStart(
    @MessageBody() payload: GlimwormStartBody,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
    try {
      const variantRaw =
        typeof payload.variant === 'string' ? payload.variant : '';
      if (!VALID_VARIANTS.has(variantRaw as GlimwormVariant)) {
        throw new Error(`Invalid variant: ${variantRaw}`);
      }
      const variant = variantRaw as GlimwormVariant;
      await this.assertCanSee(userId, variant);
      const powerupsEnabled = payload.powerupsEnabled === true;
      const fillWithBots = payload.fillWithBots === true;
      const botCount =
        typeof payload.botCount === 'number' &&
        Number.isFinite(payload.botCount)
          ? payload.botCount
          : undefined;
      this.glimwormService.start(roomId, userId, {
        variant,
        powerupsEnabled,
        fillWithBots,
        botCount,
      });
      client.emit(
        'glimworm.start.ack',
        maybeEncrypt({ roomId, userId, variant, powerupsEnabled }),
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

  @SubscribeMessage('glimworm.restart')
  handleRestart(
    @MessageBody() payload: GlimwormRestartBody,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
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

  @SubscribeMessage('glimworm.rematch')
  handleRematch(
    @MessageBody() payload: GlimwormRestartBody,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
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

  @SubscribeMessage('glimworm.color.pick')
  handleColorPick(
    @MessageBody() payload: GlimwormColorPickBody,
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, userId } = extractRoomAndUser(
      payload as unknown as Record<string, unknown>,
    );
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
