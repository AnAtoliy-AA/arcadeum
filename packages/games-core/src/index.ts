/**
 * @arcadeum/games-core
 *
 * Framework-agnostic game engines, bot cores and shared types used by both
 * the NestJS backend (`apps/be`) and the web offline mode (`apps/web`).
 *
 * Import games via deep subpaths to avoid cross-game name collisions:
 *   import { ChessEngine } from '@arcadeum/games-core/games/chess/chess.engine';
 */
export * from './base/game-engine.interface';
export * from './lib/logger';
export * from './lib/random';
