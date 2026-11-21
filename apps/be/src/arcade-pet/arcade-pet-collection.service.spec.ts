import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { createInitialPet } from '@arcadeum/games-core';
import type { PetGiftPresentPayload } from '@arcadeum/games-core';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetCollection } from './schemas/arcade-pet-collection.schema';
import type { SyncCollectionDto } from './dto/arcade-pet-collection.dto';

const present = (id: string): PetGiftPresentPayload => ({
  id,
  senderId: 'admin',
  senderName: 'Admin',
  species: 'dragon',
  theme: 'retro',
  petName: 'Dragon',
  createdAt: 1,
  isOpened: false,
});

describe('ArcadePetCollectionService', () => {
  const userId = new Types.ObjectId().toHexString();
  const serverPet = createInitialPet({ id: 'p1', name: 'Rex' });
  let service: ArcadePetCollectionService;
  let model: { findOne: jest.Mock; findOneAndUpdate: jest.Mock };

  const dto = (over: Partial<SyncCollectionDto> = {}): SyncCollectionDto => ({
    baseRevision: 2,
    pets: [{ ...serverPet, name: 'Renamed' }] as never,
    activePetId: 'p1',
    isAtHome: true,
    ...over,
  });

  const stored = (over: object = {}) => ({
    revision: 2,
    pets: [serverPet],
    activePetId: 'p1',
    gemBalance: 40,
    coinBalance: 7,
    adoptionCount: 1,
    homeCapacity: 1,
    presents: [present('admin-gift')],
    isAtHome: false,
    ...over,
  });

  beforeEach(async () => {
    model = { findOne: jest.fn(), findOneAndUpdate: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        ArcadePetCollectionService,
        {
          provide: getModelToken(ArcadePetCollection.name, OCI_CONNECTION),
          useValue: model,
        },
      ],
    }).compile();
    service = module.get(ArcadePetCollectionService);
  });

  it('returns an empty revision 0 collection when none is stored', async () => {
    model.findOne.mockResolvedValue(null);
    const res = await service.getCollection(userId);
    expect(res).toMatchObject({ revision: 0, pets: [], dailyStreak: 0 });
    expect(res.presents.map((p) => p.id)).toEqual(['present-welcome-gift']);
  });

  it('returns conflict when baseRevision is stale', async () => {
    model.findOne.mockResolvedValue(stored({ revision: 3 }));
    const res = await service.syncCollection(userId, dto());
    expect(res.status).toBe('conflict');
    expect(res.collection.revision).toBe(3);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('returns conflict when nothing is stored yet', async () => {
    model.findOne.mockResolvedValue(null);
    const res = await service.syncCollection(userId, dto({ baseRevision: 0 }));
    expect(res.status).toBe('conflict');
  });

  it('returns conflict when a concurrent write wins the update', async () => {
    model.findOne
      .mockResolvedValueOnce(stored())
      .mockResolvedValueOnce(stored({ revision: 3 }));
    model.findOneAndUpdate.mockResolvedValue(null);
    const res = await service.syncCollection(userId, dto());
    expect(res.status).toBe('conflict');
    expect(res.collection.revision).toBe(3);
  });

  it('updates known pets and flags but never touches server-owned fields', async () => {
    model.findOne.mockResolvedValue(stored());
    model.findOneAndUpdate.mockImplementation(
      (_f: unknown, update: { $set: Record<string, unknown> }) =>
        Promise.resolve({ ...stored(), revision: 3, ...update.$set }),
    );
    const res = await service.syncCollection(userId, dto());
    const [, update] = model.findOneAndUpdate.mock.calls[0] as [
      unknown,
      { $set: Record<string, unknown> },
    ];
    expect(Object.keys(update.$set).sort()).toEqual([
      'activePetId',
      'isAtHome',
      'pets',
    ]);
    expect(res.status).toBe('ok');
    expect(res.collection.pets[0].name).toBe('Renamed');
    expect(res.collection.isAtHome).toBe(true);
    expect(res.collection.gemBalance).toBe(40);
    expect(res.collection.presents.map((p) => p.id)).toEqual(['admin-gift']);
  });

  it('ignores pets the server does not know about and unknown active ids', async () => {
    model.findOne.mockResolvedValue(stored());
    model.findOneAndUpdate.mockImplementation(
      (_f: unknown, update: { $set: Record<string, unknown> }) =>
        Promise.resolve({ ...stored(), revision: 3, ...update.$set }),
    );
    const forged = createInitialPet({ id: 'forged', name: 'Forged' });
    const res = await service.syncCollection(
      userId,
      dto({
        pets: [{ ...serverPet }, forged] as never,
        activePetId: 'forged',
      }),
    );
    expect(res.collection.pets.map((p) => p.id)).toEqual(['p1']);
    expect(res.collection.activePetId).toBe('p1');
  });

  it('grantPresent returns false when the present already exists', async () => {
    model.findOneAndUpdate.mockRejectedValue({ code: 11000 });
    await expect(service.grantPresent(userId, present('x'))).resolves.toBe(
      false,
    );
  });

  it('grantPresent returns true when delivered', async () => {
    model.findOneAndUpdate.mockResolvedValue({ revision: 1 });
    await expect(service.grantPresent(userId, present('x'))).resolves.toBe(
      true,
    );
  });
});
