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
import type { WalletBalance } from './interfaces/wallet-balance.interface';

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

@Injectable()
@WebSocketGateway({ namespace: '/wallet', cors: { origin: corsOriginMatcher } })
export class WalletGateway implements OnGatewayConnection {
  private readonly logger = new Logger(WalletGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token: unknown = client.handshake.auth['token'];

    if (typeof token !== 'string' || token.trim().length === 0) {
      this.logger.warn(`WalletGateway: missing token for socket ${client.id}`);
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
      this.logger.debug(
        `WalletGateway: socket ${client.id} joined room ${userId}`,
      );
    } catch (err) {
      this.logger.warn(
        `WalletGateway: invalid token for socket ${client.id}: ${String(err)}`,
      );
      client.disconnect(true);
    }
  }

  emitBalance(userId: string, balance: WalletBalance): void {
    this.server.to(userId).emit('wallet:updated', balance);
  }
}
