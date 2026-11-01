import { Injectable, Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import type {
  GameMessageHandler,
  GameMessageHandlerFn,
} from './game-message-handler.interface';
import { ArcadePetService } from '../arcade-pet/arcade-pet.service';
import type { GameTreatId, PetActionType } from '@arcadeum/games-core';

@Injectable()
export class ArcadePetGateway implements GameMessageHandler {
  private readonly logger = new Logger(ArcadePetGateway.name);

  constructor(private readonly petService: ArcadePetService) {}

  get handlers(): Record<string, GameMessageHandlerFn> {
    return {
      'arcadePet.session.start': async (
        client: Socket,
        payload: Record<string, unknown>,
      ) => {
        const userId =
          typeof payload?.userId === 'string' ? payload.userId : '';
        if (!userId) return;
        const pet = await this.petService.getOrCreatePet(userId);
        client.emit('arcadePet.session.started', pet);
      },
      'arcadePet.session.action': async (
        client: Socket,
        payload: Record<string, unknown>,
      ) => {
        const userId =
          typeof payload?.userId === 'string' ? payload.userId : '';
        if (!userId) return;
        const action = payload?.action as PetActionType;
        const treatId = payload?.treatId as GameTreatId | undefined;
        const result = await this.petService.executeAction(userId, {
          action,
          treatId,
        });
        client.emit('arcadePet.session.action_result', result);
      },
    };
  }
}
