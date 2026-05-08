import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayInit,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { corsOriginMatcher } from '../common/utils/cors.util';
import type { CaptureResult } from './leaderboards.capture.service';

export type LeaderboardEntryUpdate = {
  userId: string;
  mode: string;
  season: string;
  rating?: number;
  isInMatch?: boolean;
};

@WebSocketGateway({
  namespace: 'leaderboards',
  cors: { origin: corsOriginMatcher },
})
@Injectable()
export class LeaderboardsGateway implements OnGatewayInit {
  private readonly logger = new Logger(LeaderboardsGateway.name);

  @WebSocketServer()
  private server!: Server;

  afterInit(): void {
    this.logger.debug('Leaderboards gateway initialized.');
  }

  emitCaptured(results: CaptureResult[]): void {
    if (!this.server) return;
    this.server.emit('leaderboards.captured', {
      capturedAt: new Date().toISOString(),
      results,
    });
  }

  emitEntryUpdated(update: LeaderboardEntryUpdate): void {
    if (!this.server) return;
    this.server.emit('leaderboards.entry.updated', update);
  }
}
