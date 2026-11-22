import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { ArcadePetController } from './arcade-pet.controller';
import type { ArcadePetCollectionService } from './arcade-pet-collection.service';
import type { ArcadePetEconomyService } from './arcade-pet-economy.service';
import type { SyncCollectionDto } from './dto/arcade-pet-collection.dto';

describe('ArcadePetController', () => {
  const collections = {
    getCollection: jest.fn(),
    syncCollection: jest.fn(),
  };
  const economy = { perform: jest.fn() };
  const controller = new ArcadePetController(
    collections as unknown as ArcadePetCollectionService,
    economy as unknown as ArcadePetEconomyService,
  );
  const req = (user?: { userId: string }) => ({ user }) as unknown as Request;

  beforeEach(() => jest.resetAllMocks());

  it('protects every route with the JWT guard', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ArcadePetController)).toContain(
      JwtAuthGuard,
    );
  });

  it('reads the collection of the authenticated user only', async () => {
    collections.getCollection.mockResolvedValue({ revision: 1 });
    await expect(
      controller.getCollection(req({ userId: 'u1' })),
    ).resolves.toEqual({ revision: 1 });
    expect(collections.getCollection).toHaveBeenCalledWith('u1');
  });

  it('rejects requests without a user', () => {
    expect(() => controller.getCollection(req())).toThrow(
      UnauthorizedException,
    );
  });

  it('syncs under the authenticated user id', async () => {
    const dto = { baseRevision: 1 } as SyncCollectionDto;
    await controller.syncCollection(req({ userId: 'u1' }), dto);
    expect(collections.syncCollection).toHaveBeenCalledWith('u1', dto);
  });

  it('maps a valid action DTO and performs it for the user', async () => {
    economy.perform.mockResolvedValue({ ok: true });
    await controller.performAction(req({ userId: 'u1' }), {
      type: 'claim_daily',
    });
    expect(economy.perform).toHaveBeenCalledWith('u1', { type: 'claim_daily' });
  });

  it('answers 400 when the action cannot be mapped', () => {
    expect(() =>
      controller.performAction(req({ userId: 'u1' }), {
        type: 'upgrade_home',
      }),
    ).toThrow(BadRequestException);
    expect(economy.perform).not.toHaveBeenCalled();
  });
});
