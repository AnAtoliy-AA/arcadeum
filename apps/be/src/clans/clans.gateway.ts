import { Injectable, Logger } from '@nestjs/common';
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

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
@WebSocketGateway({
  namespace: '/clans',
  cors: { origin: corsOriginMatcher },
})
export class ClansGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ClansGateway.name);
  private readonly onlineUsers = new Set<string>();

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token: unknown = client.handshake.auth['token'];

    if (typeof token !== 'string' || token.trim().length === 0) {
      this.logger.warn(`ClansGateway: missing token for socket ${client.id}`);
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

      this.onlineUsers.add(userId);

      this.logger.debug(
        `ClansGateway: socket ${client.id} connected as ${userId}`,
      );
    } catch (err) {
      this.logger.warn(
        `ClansGateway: invalid token for socket ${client.id}: ${String(err)}`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = (client.data as Record<string, unknown>)?.['userId'] as
      string | undefined;
    if (!userId) return;

    const hasOtherSockets = await this.server.in(userId).fetchSockets();
    if (hasOtherSockets.length === 0) {
      this.onlineUsers.delete(userId);
    }

    this.logger.debug(
      `ClansGateway: socket ${client.id} disconnected (${userId})`,
    );
  }

  async joinClanRoom(client: Socket, clanId: string): Promise<void> {
    await client.join(`clan:${clanId}`);
  }

  async leaveClanRoom(client: Socket, clanId: string): Promise<void> {
    await client.leave(`clan:${clanId}`);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  emitClanMemberJoined(
    clanId: string,
    payload: {
      userId: string;
      username: string;
      displayName: string | null;
      equippedAvatarId: string | null;
    },
  ): void {
    this.server.to(`clan:${clanId}`).emit('clan:member-joined', payload);
  }

  emitClanMemberLeft(clanId: string, payload: { userId: string }): void {
    this.server.to(`clan:${clanId}`).emit('clan:member-left', payload);
  }

  emitClanMemberRemoved(clanId: string, payload: { userId: string }): void {
    this.server.to(`clan:${clanId}`).emit('clan:member-removed', payload);
  }

  emitClanUpdated(
    clanId: string,
    payload: { name: string; tag: string; description: string },
  ): void {
    this.server.to(`clan:${clanId}`).emit('clan:updated', payload);
  }

  emitClanInvite(
    targetUserId: string,
    payload: {
      clanId: string;
      clanName: string;
      clanTag: string;
      inviterUsername: string;
    },
  ): void {
    this.server.to(targetUserId).emit('clan:invite', payload);
  }
}
