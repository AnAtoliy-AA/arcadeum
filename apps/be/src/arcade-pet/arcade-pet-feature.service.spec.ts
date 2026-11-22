import { NotFoundException } from '@nestjs/common';
import type { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import type { UserRoleResolver } from '../auth/lib/user-role-resolver.service';
import {
  ARCADE_PET_GAME_ID,
  ArcadePetFeatureService,
} from './arcade-pet-feature.service';

describe('ArcadePetFeatureService', () => {
  const canSee = jest.fn();
  const resolveRole = jest.fn();
  const service = new ArcadePetFeatureService(
    { canSee } as unknown as GameVisibilityService,
    { resolveRole } as unknown as UserRoleResolver,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    resolveRole.mockResolvedValue('free');
  });

  it('uses the catalog entry visibility as the flag', async () => {
    canSee.mockResolvedValue(true);
    await expect(service.isEnabledFor('u1')).resolves.toBe(true);
    expect(canSee).toHaveBeenCalledWith('free', ARCADE_PET_GAME_ID);
    expect(ARCADE_PET_GAME_ID).toBe('arcade_pet_v1');
  });

  it('throws 404 when the flag is off', async () => {
    canSee.mockResolvedValue(false);
    await expect(service.assertEnabledFor('u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('passes when the flag is on', async () => {
    canSee.mockResolvedValue(true);
    await expect(service.assertEnabledFor('u1')).resolves.toBeUndefined();
  });
});
