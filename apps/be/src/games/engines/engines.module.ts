import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { GameEngineRegistry } from './registry/game-engine.registry';
import { CriticalEngine } from './critical/critical.engine';
import { TexasHoldemEngine } from './texas-holdem/texas-holdem.engine';
import { SeaBattleEngine } from './sea-battle/sea-battle.engine';

/**
 * Game Engines Module
 * Registers and provides all game engines
 */
@Module({
  providers: [
    GameEngineRegistry,
    CriticalEngine,
    TexasHoldemEngine,
    SeaBattleEngine,
    // Add more game engines here as they're implemented
  ],
  exports: [GameEngineRegistry],
})
export class GameEnginesModule implements OnModuleInit {
  private readonly logger = new Logger(GameEnginesModule.name);

  constructor(
    private readonly registry: GameEngineRegistry,
    private readonly criticalEngine: CriticalEngine,
    private readonly texasHoldemEngine: TexasHoldemEngine,
    private readonly seaBattleEngine: SeaBattleEngine,
    // Inject more engines here
  ) {}

  /**
   * Register all game engines when module initializes
   */
  onModuleInit() {
    this.logger.log('Initializing game engines...');

    // Register all engines
    this.registry.register(this.criticalEngine);
    this.registry.register(this.texasHoldemEngine);
    this.registry.register(this.seaBattleEngine);
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
