import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { GameEngineRegistry } from './registry/game-engine.registry';
import { CriticalEngine } from './critical/critical.engine';

import { SeaBattleEngine } from './sea-battle/sea-battle.engine';
import { TicTacToeEngine } from './tic-tac-toe/tic-tac-toe.engine';
import { CascadeEngine } from './cascade/cascade.engine';

/**
 * Game Engines Module
 * Registers and provides all game engines
 */
@Module({
  providers: [
    GameEngineRegistry,
    CriticalEngine,

    SeaBattleEngine,
    TicTacToeEngine,
    CascadeEngine,
    // Add more game engines here as they're implemented
  ],
  exports: [GameEngineRegistry],
})
export class GameEnginesModule implements OnModuleInit {
  private readonly logger = new Logger(GameEnginesModule.name);

  constructor(
    private readonly registry: GameEngineRegistry,
    private readonly criticalEngine: CriticalEngine,

    private readonly seaBattleEngine: SeaBattleEngine,
    private readonly ticTacToeEngine: TicTacToeEngine,
    private readonly cascadeEngine: CascadeEngine,
    // Inject more engines here
  ) {}

  /**
   * Register all game engines when module initializes
   */
  onModuleInit() {
    this.logger.log('Initializing game engines...');

    // Register all engines
    this.registry.register(this.criticalEngine);

    this.registry.register(this.seaBattleEngine);
    this.registry.register(this.ticTacToeEngine);
    this.registry.register(this.cascadeEngine);
    // Register more engines here

    // Log registration summary
    const stats = this.registry.getStats();
    this.logger.log(
      `Successfully registered ${stats.totalGames} game engines:`,
    );
    stats.games.forEach((game) => {
      this.logger.log(`  - ${game.name} (${game.gameId}) v${game.version}`);
    });
  }
}
