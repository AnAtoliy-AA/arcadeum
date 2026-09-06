import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface Broadcast {
  id: string;
  gameId: string;
  commentary: string[];
  viewerCount: number;
  startedAt: Date;
  isActive: boolean;
}

@Injectable()
export class ChessBroadcastService {
  private readonly logger = new Logger(ChessBroadcastService.name);
  private readonly broadcasts = new Map<string, Broadcast>();

  createBroadcast(gameId: string, commentary?: string): Broadcast {
    const id = `broadcast-${Date.now()}`;
    const broadcast: Broadcast = {
      id,
      gameId,
      commentary: commentary ? [commentary] : [],
      viewerCount: 0,
      startedAt: new Date(),
      isActive: true,
    };
    this.broadcasts.set(id, broadcast);
    return broadcast;
  }

  addCommentary(broadcastId: string, commentary: string): Broadcast {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) throw new NotFoundException('Broadcast not found');
    broadcast.commentary.push(commentary);
    return broadcast;
  }

  getBroadcast(broadcastId: string): Broadcast {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) throw new NotFoundException('Broadcast not found');
    return broadcast;
  }

  getActiveBroadcasts(): Broadcast[] {
    return Array.from(this.broadcasts.values()).filter((b) => b.isActive);
  }

  incrementViewerCount(broadcastId: string): void {
    const broadcast = this.broadcasts.get(broadcastId);
    if (broadcast) broadcast.viewerCount++;
  }

  decrementViewerCount(broadcastId: string): void {
    const broadcast = this.broadcasts.get(broadcastId);
    if (broadcast && broadcast.viewerCount > 0) {
      broadcast.viewerCount--;
    }
  }

  endBroadcast(broadcastId: string): void {
    const broadcast = this.broadcasts.get(broadcastId);
    if (broadcast) {
      broadcast.isActive = false;
    }
  }
}
