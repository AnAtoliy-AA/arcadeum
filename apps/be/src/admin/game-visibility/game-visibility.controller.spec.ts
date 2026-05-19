import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import { GameVisibilityController } from './game-visibility.controller';
import { GameVisibilityService } from './game-visibility.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

function reqWithUser(userId: string): Request {
  return { user: { userId } } as unknown as Request;
}

describe('GameVisibilityController', () => {
  let controller: GameVisibilityController;
  let service: {
    listForAdmin: jest.Mock;
    setGameTier: jest.Mock;
    setVariantTier: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      listForAdmin: jest.fn().mockResolvedValue([]),
      setGameTier: jest.fn().mockResolvedValue(undefined),
      setVariantTier: jest.fn().mockResolvedValue(undefined),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [GameVisibilityController],
      providers: [{ provide: GameVisibilityService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = moduleRef.get(GameVisibilityController);
  });

  it('GET visibility returns the joined catalog', async () => {
    service.listForAdmin.mockResolvedValueOnce([
      { gameId: 'critical_v1', tier: 'all', variants: [] },
    ]);
    await expect(controller.list()).resolves.toEqual([
      { gameId: 'critical_v1', tier: 'all', variants: [] },
    ]);
  });

  it('PUT game visibility passes through to service', async () => {
    await controller.setGameTier(reqWithUser('admin-1'), 'glimworm_v1', {
      tier: 'vip_plus',
    });
    expect(service.setGameTier).toHaveBeenCalledWith(
      'glimworm_v1',
      'vip_plus',
      'admin-1',
    );
  });

  it('PUT variant visibility passes through to service', async () => {
    await controller.setVariantTier(
      reqWithUser('admin-1'),
      'glimworm_v1',
      'time_attack',
      { tier: 'premium_plus' },
    );
    expect(service.setVariantTier).toHaveBeenCalledWith(
      'glimworm_v1',
      'time_attack',
      'premium_plus',
      'admin-1',
    );
  });
});
