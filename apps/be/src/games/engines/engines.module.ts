import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { GameEngineRegistry } from './registry/game-engine.registry';
import { ExplodingCatsEngine } from './exploding-cats/exploding-cats.engine';
import { TexasHoldemEngine } from './texas-holdem/texas-holdem.engine';

/**
 * Game Engines Module
 * Registers and provides all game engines
 */
@Module({
  providers: [
    GameEngineRegistry,
    ExplodingCatsEngine,
    TexasHoldemEngine,
    // Add more game engines here as they're implemented
  ],
  exports: [GameEngineRegistry],
})
export class GameEnginesModule implements OnModuleInit {
  private readonly logger = new Logger(GameEnginesModule.name);

  constructor(
    private readonly registry: GameEngineRegistry,
    private readonly explodingCatsEngine: ExplodingCatsEngine,
    private readonly texasHoldemEngine: TexasHoldemEngine,
    // Inject more engines here
  ) {}

  /**
   * Register all game engines when module initializes
   */
  onModuleInit() {
    this.logger.log('Initializing game engines...');

    // Register all engines
    this.registry.register(this.explodingCatsEngine);
    this.registry.register(this.texasHoldemEngine);
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
