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
    grantPresent = jest.fn().mockResolvedValue('granted');
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
    expect(filter).toMatchObject({ revision: { $eq: 1 } });
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

  describe('send_gift delivery ordering', () => {
    const gift = {
      type: 'send_gift' as const,
      recipientUsername: 'bob',
      species: 'slime' as const,
      theme: 'retro',
      petName: 'Goo',
    };

    it('does not debit the sender when delivery throws', async () => {
      model.findOne.mockResolvedValue(doc());
      grantPresent.mockRejectedValue(new Error('db down'));
      await expect(service.perform(userId, gift)).rejects.toThrow('db down');
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('uses a deterministic gift id derived from sender and revision', async () => {
      model.findOne.mockResolvedValue(doc({ revision: 6 }));
      model.findOneAndUpdate.mockImplementation(
        (_f: unknown, u: { $set: object }) =>
          Promise.resolve({ ...doc(), revision: 7, ...u.$set }),
      );
      await service.perform(userId, gift);
      expect(grantPresent).toHaveBeenCalledWith(
        recipientId.toString(),
        expect.objectContaining({ id: `gift-${userId}-7` }),
      );
    });

    it('rejects with INBOX_FULL without debiting', async () => {
      model.findOne.mockResolvedValue(doc());
      grantPresent.mockResolvedValue('full');
      const res = await service.perform(userId, gift);
      expect(res).toMatchObject({ ok: false, error: 'INBOX_FULL' });
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('re-uses the delivered gift id when the debit loses a race', async () => {
      model.findOne
        .mockResolvedValueOnce(doc({ revision: 1 }))
        .mockResolvedValueOnce(doc({ revision: 2 }));
      model.findOneAndUpdate
        .mockResolvedValueOnce(null)
        .mockImplementationOnce((_f: unknown, u: { $set: object }) =>
          Promise.resolve({ ...doc(), revision: 3, ...u.$set }),
        );
      grantPresent
        .mockResolvedValueOnce('granted')
        .mockResolvedValueOnce('duplicate');
      const res = await service.perform(userId, gift);
      expect(res.ok).toBe(true);
      const calls = grantPresent.mock.calls as [string, { id: string }][];
      const ids = calls.map((c) => c[1].id);
      expect(new Set(ids).size).toBe(1);
    });
  });

  it('reports CONTENTION after exhausting every attempt', async () => {
    model.findOne.mockResolvedValue(doc());
    model.findOneAndUpdate.mockResolvedValue(null);
    const res = await service.perform(userId, {
      type: 'upgrade_home',
      currency: 'gems',
    });
    expect(res).toMatchObject({ ok: false, error: 'CONTENTION' });
    expect(model.findOneAndUpdate).toHaveBeenCalledTimes(3);
  });

  it('recovers when two first writes race on the unique index', async () => {
    model.findOne.mockResolvedValue(null);
    model.create
      .mockRejectedValueOnce({ code: 11000 })
      .mockImplementationOnce((d: object) => Promise.resolve({ ...d }));
    const res = await service.perform(userId, { type: 'claim_daily' });
    expect(res.ok).toBe(true);
    expect(model.create).toHaveBeenCalledTimes(2);
  });

  describe('idempotent actions', () => {
    const upgrade = {
      type: 'upgrade_home' as const,
      currency: 'coins' as const,
    };

    it('answers a replayed action id without writing again', async () => {
      model.findOne.mockResolvedValue(
        doc({ homeCapacity: 2, recentActionIds: ['act-1'] }),
      );
      const res = await service.perform(userId, upgrade, 'act-1');
      expect(res.ok).toBe(true);
      expect(res.collection.homeCapacity).toBe(2);
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
      expect(model.create).not.toHaveBeenCalled();
    });

    it('records the action id in the same atomic update', async () => {
      model.findOne.mockResolvedValue(doc());
      model.findOneAndUpdate.mockImplementation(
        (_f: unknown, u: { $set: object }) =>
          Promise.resolve({ ...doc(), revision: 2, ...u.$set }),
      );
      await service.perform(userId, upgrade, 'act-2');
      const [, update] = model.findOneAndUpdate.mock.calls[0] as [
        unknown,
        { $push: { recentActionIds: { $each: string[]; $slice: number } } },
      ];
      expect(update.$push.recentActionIds).toEqual({
        $each: ['act-2'],
        $slice: -50,
      });
    });

    it('treats a lost race for the same action id as already applied', async () => {
      model.findOne
        .mockResolvedValueOnce(doc())
        .mockResolvedValueOnce(
          doc({ revision: 2, homeCapacity: 2, recentActionIds: ['act-3'] }),
        );
      model.findOneAndUpdate.mockResolvedValueOnce(null);
      const res = await service.perform(userId, upgrade, 'act-3');
      expect(res.ok).toBe(true);
      expect(res.collection.homeCapacity).toBe(2);
      expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('stamps current schema version and applies without an id as before', async () => {
      model.findOne.mockResolvedValue(doc());
      model.findOneAndUpdate.mockImplementation(
        (_f: unknown, u: { $set: object }) =>
          Promise.resolve({ ...doc(), revision: 2, ...u.$set }),
      );
      await service.perform(userId, upgrade);
      const [, update] = model.findOneAndUpdate.mock.calls[0] as [
        unknown,
        { $set: { schemaVersion: number }; $push?: unknown },
      ];
      expect(update.$set.schemaVersion).toBe(2);
      expect(update.$push).toBeUndefined();
    });

    it('derives the gift id from the action id so retries match', async () => {
      model.findOne.mockResolvedValue(doc({ revision: 6 }));
      model.findOneAndUpdate.mockImplementation(
        (_f: unknown, u: { $set: object }) =>
          Promise.resolve({ ...doc(), revision: 7, ...u.$set }),
      );
      await service.perform(
        userId,
        {
          type: 'send_gift',
          recipientUsername: 'bob',
          species: 'slime',
          theme: 'retro',
          petName: 'Goo',
        },
        'act-4',
      );
      expect(grantPresent).toHaveBeenCalledWith(
        recipientId.toString(),
        expect.objectContaining({ id: `gift-${userId}-act-4` }),
      );
    });

    it('still debits when a retry finds the gift already delivered', async () => {
      model.findOne.mockResolvedValue(doc());
      model.findOneAndUpdate.mockImplementation(
        (_f: unknown, u: { $set: object }) =>
          Promise.resolve({ ...doc(), revision: 2, ...u.$set }),
      );
      grantPresent.mockResolvedValue('duplicate');
      const res = await service.perform(
        userId,
        {
          type: 'send_gift',
          recipientUsername: 'bob',
          species: 'slime',
          theme: 'retro',
          petName: 'Goo',
        },
        'act-5',
      );
      expect(res.ok).toBe(true);
      expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
