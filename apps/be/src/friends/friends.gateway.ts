import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { corsOriginMatcher } from '../common/utils/cors.util';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';
import { FriendsService } from './friends.service';

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
@WebSocketGateway({
  namespace: '/friends',
  cors: { origin: corsOriginMatcher },
})
export class FriendsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(FriendsGateway.name);
  private friendsService: FriendsService | null = null;

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly moduleRef: ModuleRef,
  ) {}

  private getFriendsService(): FriendsService {
    if (!this.friendsService) {
      this.friendsService = this.moduleRef.get<FriendsService>(FriendsService, {
        strict: false,
      });
    }
    return this.friendsService;
  }

  async handleConnection(client: Socket): Promise<void> {
    const token: unknown = client.handshake.auth['token'];

    if (typeof token !== 'string' || token.trim().length === 0) {
      this.logger.warn(`FriendsGateway: missing token for socket ${client.id}`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: resolveJwtSecret(this.config),
      });

      const userId = payload.sub;
      (client.data as Record<string, unknown>)['userId'] = userId;
      await client.join(userId);
      await client.join('presence');

      this.getFriendsService().setUserOnline(userId);
      this.broadcastPresence(userId, true);

      this.logger.debug(
        `FriendsGateway: socket ${client.id} connected as ${userId}`,
      );
    } catch (err) {
      this.logger.warn(
        `FriendsGateway: invalid token for socket ${client.id}: ${String(err)}`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = (client.data as Record<string, unknown>)?.['userId'] as
      | string
      | undefined;
    if (!userId) return;

    const hasOtherSockets = await this.server.in(userId).fetchSockets();
    if (hasOtherSockets.length === 0) {
      this.getFriendsService().setUserOffline(userId);
      this.broadcastPresence(userId, false);
    }

    this.logger.debug(
      `FriendsGateway: socket ${client.id} disconnected (${userId})`,
    );
  }

  emitFriendRequest(
    addresseeId: string,
    payload: {
      friendshipId: string;
      requesterId: string;
      username: string;
      displayName: string | null;
    },
  ): void {
    this.server.to(addresseeId).emit('friend:request', payload);
  }

  emitFriendAccepted(
    requesterId: string,
    payload: {
      friendshipId: string;
      userId: string;
      username: string;
      displayName: string | null;
    },
  ): void {
    this.server.to(requesterId).emit('friend:accepted', payload);
  }

  emitFriendRemoved(friendId: string, removedUserId: string): void {
    this.server.to(friendId).emit('friend:removed', { userId: removedUserId });
  }

  private broadcastPresence(userId: string, online: boolean): void {
    this.server.to('presence').emit('presence:update', { userId, online });
  }
}
