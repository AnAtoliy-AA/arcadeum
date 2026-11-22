import { HttpException } from '@nestjs/common';
import {
  ARCADE_PET_ERROR_HTTP_STATUS,
  type ArcadePetCollectionResponse,
  type ArcadePetEconomyError,
} from '@arcadeum/games-core';

/**
 * Domain rejection as a real HTTP error (400/402/404/409). The body keeps the
 * authoritative collection (under `details` after the global exception
 * filter) so the client can roll back its optimistic update.
 */
export class ArcadePetEconomyException extends HttpException {
  constructor(
    readonly code: ArcadePetEconomyError,
    readonly collection: ArcadePetCollectionResponse,
  ) {
    super(
      { message: code, error: code, collection },
      ARCADE_PET_ERROR_HTTP_STATUS[code],
    );
  }
}
