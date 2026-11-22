import { Injectable, NotFoundException } from '@nestjs/common';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';

/** Catalog id whose visibility doubles as the ArcadePet feature flag. */
export const ARCADE_PET_GAME_ID = 'arcade_pet_v1';

/**
 * ArcadePet is gated by the same flag as its catalog entry (game visibility,
 * default off in production), so REST, sockets and the catalog always agree.
 */
@Injectable()
export class ArcadePetFeatureService {
  constructor(
    private readonly visibility: GameVisibilityService,
    private readonly roles: UserRoleResolver,
  ) {}

  async isEnabledFor(userId: string | null | undefined): Promise<boolean> {
    const role = await this.roles.resolveRole(userId);
    return this.visibility.canSee(role, ARCADE_PET_GAME_ID);
  }

  /** Disabled features look like they do not exist: 404, not 403. */
  async assertEnabledFor(userId: string | null | undefined): Promise<void> {
    if (!(await this.isEnabledFor(userId))) throw new NotFoundException();
  }
}
