import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { PetGiftPresentPayload } from '@arcadeum/games-core';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import {
  ArcadePetCollectionService,
  mergePresents,
} from './arcade-pet-collection.service';
import { ArcadePetCollection } from './schemas/arcade-pet-collection.schema';
import type { SyncCollectionDto } from './dto/arcade-pet-collection.dto';

const present = (id: string, isOpened = false): PetGiftPresentPayload => ({
  id,
  senderId: 'admin',
  senderName: 'Admin',
  species: 'dragon',
  theme: 'retro',
  petName: 'Dragon',
  createdAt: 1,
  isOpened,
});

const baseDto = (over: Partial<SyncCollectionDto> = {}): SyncCollectionDto => ({
  baseRevision: 0,
  pets: [],
  activePetId: null,
  gemBalance: 10,
  coinBalance: 5,
  adoptionCount: 0,
  homeCapacity: 1,
  queuedThemeForNextPet: null,
  presents: [],
  hasConfirmedCare: true,
  isAtHome: false,
  ...over,
});

describe('mergePresents', () => {
  it('keeps server-only presents and ORs opened state', () => {
    const merged = mergePresents(
      [present('a', true), present('b')],
      [present('a', false), present('c')],
    );
    expect(merged.map((p) => p.id)).toEqual(['a', 'c', 'b']);
    expect(merged.find((p) => p.id === 'a')?.isOpened).toBe(true);
  });
});

describe('ArcadePetCollectionService', () => {
  const userId = new Types.ObjectId().toHexString();
  let service: ArcadePetCollectionService;
  let model: {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async () => {
    model = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
    };
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
    expect(res.revision).toBe(0);
    expect(res.pets).toEqual([]);
  });

  it('creates the collection at revision 1 when baseRevision is 0', async () => {
    model.findOne.mockResolvedValue(null);
    model.create.mockImplementation((d: object) => Promise.resolve({ ...d }));
    const res = await service.syncCollection(userId, baseDto());
    expect(res.status).toBe('ok');
    expect(res.collection.revision).toBe(1);
    expect(res.collection.gemBalance).toBe(10);
  });

  it('returns conflict when baseRevision is stale', async () => {
    model.findOne.mockResolvedValue({ revision: 3, presents: [], pets: [] });
    const res = await service.syncCollection(userId, baseDto());
    expect(res.status).toBe('conflict');
    expect(res.collection.revision).toBe(3);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('returns conflict when a concurrent write wins the update', async () => {
    model.findOne
      .mockResolvedValueOnce({ revision: 2, presents: [], pets: [] })
      .mockResolvedValueOnce({ revision: 3, presents: [], pets: [] });
    model.findOneAndUpdate.mockResolvedValue(null);
    const res = await service.syncCollection(
      userId,
      baseDto({ baseRevision: 2 }),
    );
    expect(res.status).toBe('conflict');
    expect(res.collection.revision).toBe(3);
  });

  it('preserves server-only presents on a successful sync', async () => {
    model.findOne.mockResolvedValue({
      revision: 1,
      presents: [present('admin-gift')],
      pets: [],
    });
    model.findOneAndUpdate.mockImplementation(
      (_f: unknown, update: { $set: Record<string, unknown> }) =>
        Promise.resolve({ revision: 2, ...update.$set }),
    );
    const res = await service.syncCollection(
      userId,
      baseDto({ baseRevision: 1, presents: [present('welcome')] }),
    );
    expect(res.status).toBe('ok');
    expect(res.collection.presents.map((p) => p.id)).toEqual([
      'welcome',
      'admin-gift',
    ]);
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
