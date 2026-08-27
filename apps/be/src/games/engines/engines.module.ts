import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { GameEngineRegistry } from './registry/game-engine.registry';
import { CriticalEngine } from './critical/critical.engine';

import { SeaBattleEngine } from './sea-battle/sea-battle.engine';
import { TicTacToeEngine } from './tic-tac-toe/tic-tac-toe.engine';
import { CascadeEngine } from './cascade/cascade.engine';
import { ChessEngine } from './chess/chess.engine';
import { CheckersEngine } from './checkers/checkers.engine';
import { CatDashEngine } from './cat-dash/cat-dash.engine';
import { BackgammonEngine } from './backgammon/backgammon.engine';
import { HeartsEngine } from './hearts/hearts.engine';
import { SpadesEngine } from './spades/spades.engine';
import { GoEngine } from './go/go.engine';
import { PachisiEngine } from './pachisi/pachisi.engine';

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
    ChessEngine,
    CheckersEngine,
    CatDashEngine,
    BackgammonEngine,
    HeartsEngine,
    SpadesEngine,
    GoEngine,
    PachisiEngine,
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
    private readonly chessEngine: ChessEngine,
    private readonly checkersEngine: CheckersEngine,
    private readonly catDashEngine: CatDashEngine,
    private readonly backgammonEngine: BackgammonEngine,
    private readonly heartsEngine: HeartsEngine,
    private readonly spadesEngine: SpadesEngine,
    private readonly goEngine: GoEngine,
    private readonly pachisiEngine: PachisiEngine,
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
    this.registry.register(this.chessEngine);
    this.registry.register(this.checkersEngine);
    this.registry.register(this.catDashEngine);
    this.registry.register(this.backgammonEngine);
    this.registry.register(this.heartsEngine);
    this.registry.register(this.spadesEngine);
    this.registry.register(this.goEngine);
    this.registry.register(this.pachisiEngine);

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
