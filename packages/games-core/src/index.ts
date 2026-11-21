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
export * from './lib/interpolate';
export * from './lib/logger';
export * from './lib/random';
export * from './lib/shared-theme-id';
export * from './games/arcade-pet/arcade-pet.types';
export * from './games/arcade-pet/arcade-pet-collection.types';
export * from './games/arcade-pet/arcade-pet-theme-roster';
export * from './games/arcade-pet/arcade-pet-name';
export * from './games/arcade-pet/arcade-pet-daily-bonus';
export * from './games/arcade-pet/arcade-pet-milestones';
export * from './games/arcade-pet/arcade-pet-economy';
export * from './games/arcade-pet/arcade-pet-economy-reducer';
export * from './games/arcade-pet/arcade-pet.constants';
export * from './games/arcade-pet/arcade-pet.utils';
