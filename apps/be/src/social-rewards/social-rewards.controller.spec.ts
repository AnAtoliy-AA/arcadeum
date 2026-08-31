import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SocialRewardsController } from './social-rewards.controller';
import { SocialRewardsService } from './social-rewards.service';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

describe('SocialRewardsController', () => {
  let controller: SocialRewardsController;
  let service: {
    getStatus: jest.Mock;
    claimReward: jest.Mock;
  };

  const user: AuthenticatedUser = {
    userId: 'user-123',
    username: 'alice',
    roles: ['player'],
  };

  beforeEach(async () => {
    service = {
      getStatus: jest.fn().mockResolvedValue({
        items: [],
        totalClaimed: 0,
        totalAvailable: 10,
        gemsPerSubscription: 1,
      }),
      claimReward: jest.fn().mockResolvedValue({
        success: true,
        platform: 'discord',
        gemsAwarded: 1,
        gemsBalanceAfter: 10,
        claimedAt: new Date(),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [SocialRewardsController],
      providers: [{ provide: SocialRewardsService, useValue: service }],
    }).compile();

    controller = moduleRef.get(SocialRewardsController);
  });

  describe('getStatus', () => {
    it('returns status for authenticated user', async () => {
      const req = { user } as unknown as Request;
      const res = await controller.getStatus(req);

      expect(service.getStatus).toHaveBeenCalledWith('user-123');
      expect(res.totalAvailable).toBe(10);
    });

    it('throws UnauthorizedException when user is missing', async () => {
      const req = {} as Request;
      await expect(controller.getStatus(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('claimReward', () => {
    it('claims reward for authenticated user', async () => {
      const req = { user } as unknown as Request;
      const res = await controller.claimReward(req, { platform: 'discord' });

      expect(service.claimReward).toHaveBeenCalledWith('user-123', 'discord');
      expect(res.success).toBe(true);
      expect(res.gemsAwarded).toBe(1);
    });

    it('throws UnauthorizedException when user is missing', async () => {
      const req = {} as Request;
      await expect(
        controller.claimReward(req, { platform: 'discord' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
