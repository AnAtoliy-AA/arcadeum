import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  WEEKLY_CUP_GAMES,
  isWeeklyCupGame,
  type WeeklyCupGame,
} from './weekly-cups.config';

@Injectable()
export class ParseWeeklyCupGamePipe implements PipeTransform<
  string,
  WeeklyCupGame
> {
  transform(value: string): WeeklyCupGame {
    if (!isWeeklyCupGame(value)) {
      throw new BadRequestException(
        `game must be one of: ${WEEKLY_CUP_GAMES.join(', ')}`,
      );
    }
    return value;
  }
}
