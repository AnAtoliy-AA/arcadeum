import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { User } from '../auth/schemas/user.schema';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import {
  ArcadePetEconomyService,
  toEconomyAction,
} from './arcade-pet-economy.service';
import { ArcadePetCollection } from './schemas/arcade-pet-collection.schema';

const chain = <T>(value: T) => ({
  select: () => ({ lean: () => Promise.resolve(value) }),
});

describe('toEconomyAction', () => {
  it('maps flat dto fields into the discriminated union', () => {
    expect(
      toEconomyAction({
        type: 'upgrade_home',
        currency: 'gems',
      }),
    ).toEqual({ type: 'upgrade_home', currency: 'gems' });
    expect(toEconomyAction({ type: 'claim_daily' })).toEqual({
      type: 'claim_daily',
    });
  });

  it('returns null when a required field is missing', () => {
    expect(toEconomyAction({ type: 'upgrade_home' })).toBeNull();
    expect(toEconomyAction({ type: 'adopt_random', petId: 'p' })).toBeNull();
  });
});

describe('ArcadePetEconomyService', () => {
  const userId = new Types.ObjectId().toHexString();
  const recipientId = new Types.ObjectId();
  let service: ArcadePetEconomyService;
  let model: {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    create: jest.Mock;
  };
  let users: { findById: jest.Mock; findOne: jest.Mock };
  let collections: ArcadePetCollectionService;
  let grantPresent: jest.Mock;

  const doc = (over: object = {}) => ({
    revision: 1,
    pets: [],
    activePetId: null,
    gemBalance: 300,
    coinBalance: 50,
    adoptionCount: 0,
    homeCapacity: 1,
    queuedThemeForNextPet: null,
    presents: [],
    hasConfirmedCare: false,
    isAtHome: false,
    dailyStreak: 0,
    lastDailyClaimDay: null,
    claimedMilestones: [],
    ...over,
  });

  beforeEach(async () => {
    model = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
    };
    users = {
      findById: jest
        .fn()
        .mockReturnValue(chain({ username: 'alice', role: 'free' })),
      findOne: jest.fn().mockReturnValue(chain({ _id: recipientId })),
    };
    grantPresent = jest.fn().mockResolvedValue(true);
    const module = await Test.createTestingModule({
      providers: [
        ArcadePetEconomyService,
        ArcadePetCollectionService,
        {
          provide: getModelToken(ArcadePetCollection.name, OCI_CONNECTION),
          useValue: model,
        },
        { provide: getModelToken(User.name), useValue: users },
      ],
    }).compile();
    service = module.get(ArcadePetEconomyService);
    collections = module.get(ArcadePetCollectionService);
    jest.spyOn(collections, 'grantPresent').mockImplementation(grantPresent);
  });

  it('applies an upgrade and persists it with a revision check', async () => {
    model.findOne.mockResolvedValue(doc());
    model.findOneAndUpdate.mockImplementation(
      (_f: unknown, u: { $set: object }) =>
        Promise.resolve({ ...doc(), revision: 2, ...u.$set }),
    );
    const res = await service.perform(userId, {
      type: 'upgrade_home',
      currency: 'coins',
    });
    expect(res.ok).toBe(true);
    expect(res.collection.homeCapacity).toBe(2);
    expect(res.collection.coinBalance).toBe(0);
    expect(res.collection.revision).toBe(2);
    const [filter] = model.findOneAndUpdate.mock.calls[0] as [object];
    expect(filter).toMatchObject({ revision: 1 });
  });

  it('creates the record on the first action', async () => {
    model.findOne.mockResolvedValue(null);
    model.create.mockImplementation((d: object) => Promise.resolve({ ...d }));
    const res = await service.perform(userId, { type: 'claim_daily' });
    expect(res.ok).toBe(true);
    expect(res.collection.dailyStreak).toBe(1);
    expect(res.collection.revision).toBe(1);
  });

  it('rejects without writing when the rules refuse', async () => {
    model.findOne.mockResolvedValue(doc({ coinBalance: 1 }));
    const res = await service.perform(userId, {
      type: 'upgrade_home',
      currency: 'coins',
    });
    expect(res).toMatchObject({ ok: false, error: 'INSUFFICIENT_COINS' });
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.collection.coinBalance).toBe(1);
  });

  it('retries after losing a concurrent write', async () => {
    model.findOne.mockResolvedValue(doc());
    model.findOneAndUpdate
      .mockResolvedValueOnce(null)
      .mockImplementationOnce((_f: unknown, u: { $set: object }) =>
        Promise.resolve({ ...doc(), revision: 3, ...u.$set }),
      );
    const res = await service.perform(userId, {
      type: 'upgrade_home',
      currency: 'gems',
    });
    expect(res.ok).toBe(true);
    expect(model.findOneAndUpdate).toHaveBeenCalledTimes(2);
  });

  it('charges the sender and delivers the gift to the recipient', async () => {
    model.findOne.mockResolvedValue(doc());
    model.findOneAndUpdate.mockImplementation(
      (_f: unknown, u: { $set: object }) =>
        Promise.resolve({ ...doc(), revision: 2, ...u.$set }),
    );
    const res = await service.perform(userId, {
      type: 'send_gift',
      recipientUsername: 'Bob',
      species: 'slime',
      theme: 'retro',
      petName: 'Goo',
    });
    expect(res.ok).toBe(true);
    expect(res.collection.gemBalance).toBe(250);
    expect(grantPresent).toHaveBeenCalledWith(
      recipientId.toString(),
      expect.objectContaining({ senderId: userId, petName: 'Goo' }),
    );
    const [query] = users.findOne.mock.calls[0] as [object];
    expect(query).toMatchObject({ usernameNormalized: 'bob' });
  });

  it('makes admin gifts free based on the server-side role', async () => {
    users.findById.mockReturnValue(chain({ username: 'root', role: 'admin' }));
    model.findOne.mockResolvedValue(doc());
    model.findOneAndUpdate.mockImplementation(
      (_f: unknown, u: { $set: object }) =>
        Promise.resolve({ ...doc(), revision: 2, ...u.$set }),
    );
    const res = await service.perform(userId, {
      type: 'send_gift',
      recipientUsername: 'bob',
      species: 'slime',
      theme: 'retro',
      petName: 'Goo',
    });
    expect(res.collection.gemBalance).toBe(300);
  });

  it('rejects gifts to unknown users and to yourself', async () => {
    model.findOne.mockResolvedValue(doc());
    users.findOne.mockReturnValue(chain(null));
    const gift = {
      type: 'send_gift' as const,
      recipientUsername: 'ghost',
      species: 'slime' as const,
      theme: 'retro',
      petName: 'Goo',
    };
    expect(await service.perform(userId, gift)).toMatchObject({
      ok: false,
      error: 'RECIPIENT_NOT_FOUND',
    });
    users.findOne.mockReturnValue(chain({ _id: new Types.ObjectId(userId) }));
    expect(await service.perform(userId, gift)).toMatchObject({
      ok: false,
      error: 'SELF_GIFT',
    });
    expect(grantPresent).not.toHaveBeenCalled();
  });
});
