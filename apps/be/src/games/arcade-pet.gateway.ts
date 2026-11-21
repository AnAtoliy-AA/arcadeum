import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';
import { ArcadePetCollectionService } from '../arcade-pet/arcade-pet-collection.service';

/**
 * Socket entry point for the ArcadePet game. All mutations go through the
 * authenticated REST economy endpoints; the socket only delivers the
 * collection of the connection's authenticated user.
 */
@Injectable()
export class ArcadePetGateway implements GameMessageHandler {
  constructor(private readonly collections: ArcadePetCollectionService) {}

  get handlers(): Record<string, GameMessageHandlerFn> {
    return {
      'arcadePet.session.start': async (client: Socket) => {
        const data = client.data as Record<string, unknown>;
        const userId = typeof data?.userId === 'string' ? data.userId : '';
        if (!userId || data.authenticated !== true) return;
        const collection = await this.collections.getCollection(userId);
        client.emit('arcadePet.session.started', collection);
      },
    };
  }
}
