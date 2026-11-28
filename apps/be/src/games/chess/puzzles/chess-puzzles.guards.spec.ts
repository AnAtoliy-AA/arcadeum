import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../../../auth/guards/roles.constants';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../../auth/jwt/jwt.guard';
import { ChessPuzzlesController } from './chess-puzzles.controller';
import { ChessOpeningsController } from '../openings/chess-openings.controller';

/** Bulk import endpoints used to be reachable without authentication. */
describe('chess data import endpoints', () => {
  it.each([
    ['puzzles', ChessPuzzlesController.prototype.importPuzzles],
    ['openings', ChessOpeningsController.prototype.importOpenings],
  ])('%s import requires an authenticated admin', (_name, handler) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, handler) as unknown[];
    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual(['admin']);
  });
});
