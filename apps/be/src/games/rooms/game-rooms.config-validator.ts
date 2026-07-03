import { BadRequestException } from '@nestjs/common';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';

export function validateGameOptions(
  engineRegistry: GameEngineRegistry,
  gameId: string,
  gameOptions?: Record<string, unknown>,
): void {
  if (!gameOptions || Object.keys(gameOptions).length === 0) {
    return;
  }

  try {
    const engine = engineRegistry.getEngine(gameId);
    if (engine.validateConfig && !engine.validateConfig(gameOptions)) {
      throw new BadRequestException('Invalid game configuration');
    }
  } catch (e) {
    if (e instanceof BadRequestException) throw e;
  }
}
