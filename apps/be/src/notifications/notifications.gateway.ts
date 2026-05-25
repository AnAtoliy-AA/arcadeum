import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
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

export type InboxNotificationDto = {
  id: string;
  category: string;
  titleKey: string;
  bodyKey: string;
  i18nParams: Record<string, unknown>;
  url: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: corsOriginMatcher },
})
export class NotificationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token: unknown = client.handshake.auth['token'];

    if (typeof token !== 'string' || token.trim().length === 0) {
      this.logger.warn(
        `NotificationsGateway: missing token for socket ${client.id}`,
      );
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: resolveJwtSecret(this.config),
      });

      const userId = payload.sub;
      (client.data as Record<string, unknown>)['userId'] = userId;
      await client.join(`user:${userId}`);
      this.logger.debug(
        `NotificationsGateway: socket ${client.id} joined room user:${userId}`,
      );
    } catch (err) {
      this.logger.warn(
        `NotificationsGateway: invalid token for socket ${client.id}: ${String(err)}`,
      );
      client.disconnect(true);
    }
  }

  emitNew(userId: string, notification: InboxNotificationDto): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  emitUnreadCount(userId: string, count: number): void {
    this.server
      .to(`user:${userId}`)
      .emit('notification:unread-count', { count });
  }
}
