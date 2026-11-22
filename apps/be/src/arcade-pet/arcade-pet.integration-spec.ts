import { Types, createConnection, type Connection, type Model } from 'mongoose';
import {
  MAX_TREAT_STOCK,
  createInitialPet,
  type ArcadePetEconomyAction,
  type PetGiftPresentPayload,
} from '@arcadeum/games-core';
import { getSharedMongoUri } from '../../test/integration-helpers';
import type { UserDocument } from '../auth/schemas/user.schema';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import { ArcadePetEconomyService } from './arcade-pet-economy.service';
import {
  ArcadePetCollection,
  ArcadePetCollectionSchema,
  type ArcadePetCollectionDocument,
} from './schemas/arcade-pet-collection.schema';

// Real Mongo: proves the atomic updates (grantPresent, awardTreat, revisioned
// commits) behave under genuine concurrency, which mocks cannot show.
describe('ArcadePet persistence (integration)', () => {
  let connection: Connection;
  let model: Model<ArcadePetCollectionDocument>;
  let collections: ArcadePetCollectionService;
  let economy: ArcadePetEconomyService;
  const recipients = new Map<string, Types.ObjectId>();

  const userModel = {
    findById: () => ({
      select: () => ({
        lean: () => Promise.resolve({ username: 'sender', role: 'free' }),
      }),
    }),
    findOne: (q: { usernameNormalized: string }) => ({
      select: () => ({
        lean: () =>
          Promise.resolve(
            recipients.has(q.usernameNormalized)
              ? { _id: recipients.get(q.usernameNormalized) }
              : null,
          ),
      }),
    }),
  } as unknown as Model<UserDocument>;

  beforeAll(async () => {
    connection = await createConnection(getSharedMongoUri(), {
      dbName: 'arcade-pet-integration',
    }).asPromise();
    model = connection.model<ArcadePetCollectionDocument>(
      ArcadePetCollection.name,
      ArcadePetCollectionSchema,
    );
    await model.syncIndexes();
    collections = new ArcadePetCollectionService(model);
    economy = new ArcadePetEconomyService(model, userModel, collections);
  }, 60_000);

  afterAll(async () => {
    await connection.close();
  }, 30_000);

  afterEach(async () => {
    recipients.clear();
    await model.deleteMany({});
  });

  const newId = () => new Types.ObjectId();
  const gift = (id: string): PetGiftPresentPayload => ({
    id,
    senderId: 'other',
    senderName: 'Other',
    species: 'slime',
    theme: 'retro',
    petName: 'Goo',
    createdAt: 1,
    isOpened: false,
  });

  async function seed(
    userId: Types.ObjectId,
    over: Partial<ArcadePetCollectionDocument> = {},
  ) {
    const pet = createInitialPet({ id: 'p1', name: 'Rex' });
    await model.create({
      userId,
      revision: 1,
      pets: [pet],
      activePetId: 'p1',
      gemBalance: 500,
      coinBalance: 500,
      homeCapacity: 1,
      adoptionCount: 1,
      presents: [],
      hasConfirmedCare: true,
      ...over,
    });
  }

  describe('grantPresent racing perform on the same document', () => {
    it('keeps both the delivered gift and the action, in either order', async () => {
      for (let round = 0; round < 15; round++) {
        const user = newId();
        await seed(user, { presents: [] });
        const start = (await model.findOne({ userId: user }))!.revision;

        const [granted, result] = await Promise.all([
          collections.grantPresent(user.toHexString(), gift(`g-${round}`)),
          economy.perform(user.toHexString(), { type: 'claim_daily' }),
        ]);

        expect(granted).toBe('granted');
        expect(result.ok).toBe(true);
        const after = (await model.findOne({ userId: user }))!;
        expect(after.presents.map((p) => p.id)).toEqual([`g-${round}`]);
        expect(after.dailyStreak).toBe(1);
        // Both writes were applied exactly once.
        expect(after.revision).toBe(start + 2);
      }
    });

    it('delivers many gifts concurrently to a user without a document', async () => {
      const user = newId().toHexString();
      const results = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          collections.grantPresent(user, gift(`g-${i}`)),
        ),
      );
      expect(results.every((r) => r === 'granted')).toBe(true);
      const doc = (await model.findOne({ userId: new Types.ObjectId(user) }))!;
      const ids = doc.presents.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toEqual(
        expect.arrayContaining(Array.from({ length: 8 }, (_, i) => `g-${i}`)),
      );
    });

    it('never double-delivers the same present id', async () => {
      const user = newId();
      await seed(user);
      const results = await Promise.all(
        Array.from({ length: 6 }, () =>
          collections.grantPresent(user.toHexString(), gift('same')),
        ),
      );
      expect(results.filter((r) => r === 'granted')).toHaveLength(1);
      expect(results.filter((r) => r === 'duplicate')).toHaveLength(5);
    });
  });

  describe('idempotent actions', () => {
    const upgrade: ArcadePetEconomyAction = {
      type: 'upgrade_home',
      currency: 'coins',
    };

    it('applies a retried action id only once, even when concurrent', async () => {
      const user = newId();
      await seed(user, { coinBalance: 10_000 });
      const id = user.toHexString();
      const results = await Promise.all([
        economy.perform(id, upgrade, 'act-1'),
        economy.perform(id, upgrade, 'act-1'),
        economy.perform(id, upgrade, 'act-1'),
      ]);
      expect(results.every((r) => r.ok)).toBe(true);
      const after = (await model.findOne({ userId: user }))!;
      expect(after.homeCapacity).toBe(2);
      expect(after.recentActionIds).toEqual(['act-1']);
    });

    it('applies distinct action ids separately', async () => {
      const user = newId();
      await seed(user, { coinBalance: 10_000 });
      await economy.perform(user.toHexString(), upgrade, 'act-1');
      await economy.perform(user.toHexString(), upgrade, 'act-2');
      expect((await model.findOne({ userId: user }))!.homeCapacity).toBe(3);
    });

    it('bounds the stored action id list', async () => {
      const user = newId();
      await seed(user);
      await model.updateOne(
        { userId: user },
        {
          $set: {
            recentActionIds: Array.from({ length: 200 }, (_, i) => `old-${i}`),
          },
        },
      );
      await economy.perform(user.toHexString(), { type: 'claim_daily' }, 'new');
      const ids = (await model.findOne({ userId: user }))!.recentActionIds;
      expect(ids).toHaveLength(200);
      expect(ids.at(-1)).toBe('new');
      expect(ids[0]).toBe('old-1');
    });

    it('debits once and gifts once when a gift is retried', async () => {
      const sender = newId();
      const recipient = newId();
      recipients.set('bob', recipient);
      await seed(sender, { gemBalance: 1000 });
      const send: ArcadePetEconomyAction = {
        type: 'send_gift',
        recipientUsername: 'bob',
        species: 'slime',
        theme: 'retro',
        petName: 'Goo',
      };
      const results = await Promise.all([
        economy.perform(sender.toHexString(), send, 'gift-act'),
        economy.perform(sender.toHexString(), send, 'gift-act'),
      ]);
      expect(results.every((r) => r.ok)).toBe(true);
      const after = (await model.findOne({ userId: sender }))!;
      const inbox = (await model.findOne({ userId: recipient }))!.presents;
      expect(
        inbox.filter((p) => p.senderId === sender.toHexString()),
      ).toHaveLength(1);
      const debit = 1000 - after.gemBalance;
      expect(debit).toBeGreaterThan(0);
      const second = await economy.perform(
        sender.toHexString(),
        send,
        'gift-act',
      );
      expect(second.ok).toBe(true);
      expect(1000 - (await model.findOne({ userId: sender }))!.gemBalance).toBe(
        debit,
      );
    });
  });

  describe('awardTreat', () => {
    it('awards once per key even under concurrency', async () => {
      const user = newId();
      await seed(user);
      const before = (await model.findOne({ userId: user }))!.pets[0].inventory
        .chess_cookie;
      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          collections.awardTreat(
            user.toHexString(),
            'chess_cookie',
            'treat:s1',
          ),
        ),
      );
      expect(results.filter((r) => r === 'awarded')).toHaveLength(1);
      const after = (await model.findOne({ userId: user }))!;
      expect(after.pets[0].inventory.chess_cookie).toBe(before + 1);
      expect(after.recentActionIds).toEqual(['treat:s1']);
    });

    it('awards distinct sessions separately and stops at the stock cap', async () => {
      const user = newId();
      await seed(user);
      await model.updateOne(
        { userId: user },
        { $set: { 'pets.0.inventory.hearts_candy': MAX_TREAT_STOCK - 1 } },
      );
      const id = user.toHexString();
      expect(await collections.awardTreat(id, 'hearts_candy', 'treat:a')).toBe(
        'awarded',
      );
      expect(await collections.awardTreat(id, 'hearts_candy', 'treat:b')).toBe(
        'stock_full',
      );
      expect(
        (await model.findOne({ userId: user }))!.pets[0].inventory.hearts_candy,
      ).toBe(MAX_TREAT_STOCK);
    });

    it('does not burn the key when the stock is full at write time', async () => {
      const user = newId();
      await seed(user);
      await model.updateOne(
        { userId: user },
        { $set: { 'pets.0.inventory.chess_cookie': MAX_TREAT_STOCK } },
      );
      // Simulates a concurrent award filling the stock after the pre-read.
      jest
        .spyOn(model, 'findOne')
        .mockResolvedValueOnce(
          (await model.findOne({ userId: user }))!.set(
            'pets.0.inventory.chess_cookie',
            MAX_TREAT_STOCK - 1,
          ),
        );
      const result = await collections.awardTreat(
        user.toHexString(),
        'chess_cookie',
        'treat:race',
      );
      expect(result).toBe('duplicate');
      const after = (await model.findOne({ userId: user }))!;
      expect(after.recentActionIds).not.toContain('treat:race');
      jest.restoreAllMocks();
    });

    it('gives nothing to users without a document or active pet', async () => {
      expect(
        await collections.awardTreat(
          newId().toHexString(),
          'chess_cookie',
          'k',
        ),
      ).toBe('no_pet');
      const user = newId();
      await seed(user, { activePetId: null });
      expect(
        await collections.awardTreat(user.toHexString(), 'chess_cookie', 'k'),
      ).toBe('no_pet');
    });

    it('bumps the revision so a stale sync conflicts instead of erasing it', async () => {
      const user = newId();
      await seed(user);
      const stale = (await model.findOne({ userId: user }))!.revision;
      await collections.awardTreat(user.toHexString(), 'chess_cookie', 'k');
      const res = await collections.syncCollection(user.toHexString(), {
        baseRevision: stale,
        pets: [],
        activePetId: 'p1',
        isAtHome: false,
      });
      expect(res.status).toBe('conflict');
    });
  });

  describe('schema migration', () => {
    it('reads a v1 document and rewrites it at the current version', async () => {
      const user = newId();
      await seed(user);
      await model.updateOne(
        { userId: user },
        { $set: { schemaVersion: 1 }, $unset: { recentActionIds: '' } },
      );
      const res = await economy.perform(user.toHexString(), {
        type: 'claim_daily',
      });
      expect(res.ok).toBe(true);
      const doc = (await model.findOne({ userId: user }))!;
      expect(doc.schemaVersion).toBe(2);
    });
  });
});
