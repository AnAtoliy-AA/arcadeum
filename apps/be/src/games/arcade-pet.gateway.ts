import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';
import { ArcadePetCollectionService } from '../arcade-pet/arcade-pet-collection.service';
import { ArcadePetFeatureService } from '../arcade-pet/arcade-pet-feature.service';

/**
 * Socket entry point for the ArcadePet game. All mutations go through the
 * authenticated REST economy endpoints; the socket only delivers the
 * collection of the connection's authenticated user. Gated by the same
 * feature flag as the REST routes (404-style error event while off).
 */
@Injectable()
export class ArcadePetGateway implements GameMessageHandler {
  constructor(
    private readonly collections: ArcadePetCollectionService,
    private readonly feature: ArcadePetFeatureService,
  ) {}

  get handlers(): Record<string, GameMessageHandlerFn> {
    return {
      'arcadePet.session.start': async (client: Socket) => {
        const data = client.data as Record<string, unknown>;
        const userId = typeof data?.userId === 'string' ? data.userId : '';
        if (!userId || data.authenticated !== true) return;
        if (!(await this.feature.isEnabledFor(userId))) {
          // Same answer as REST: a disabled feature does not exist.
          client.emit('arcadePet.session.error', {
            statusCode: 404,
            message: 'Not Found',
          });
          return;
        }
        const collection = await this.collections.getCollection(userId);
        client.emit('arcadePet.session.started', collection);
      },
    };
  }
}
