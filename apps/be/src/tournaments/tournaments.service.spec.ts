import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TournamentsService } from './tournaments.service';
import { Tournament, type TournamentStatus } from './schemas/tournament.schema';
import { WalletService } from '../wallet/wallet.service';

export const oid = () => new Types.ObjectId();

export const buildDoc = (
  overrides: Partial<{
    _id: Types.ObjectId;
    status: TournamentStatus;
    scheduledAt: Date;
    maxPlayers: number;
    name: string;
    entryFeeCoins: number;
    prizePoolCoins: number;
    winnerUserId: string | null;
    registrations: Array<{
      userId: Types.ObjectId;
      displayName: string | null;
      registeredAt: Date;
      waitlist: boolean;
    }>;
  }> = {},
) => ({
  _id: overrides._id ?? oid(),
  status: overrides.status ?? 'scheduled',
  gameType: 'critical_v1' as const,
  scheduledAt: overrides.scheduledAt ?? new Date('2026-06-01T18:00:00Z'),
  registrationOpensAt: new Date('2026-05-25T18:00:00Z'),
  registrationClosesAt: new Date('2026-06-01T17:00:00Z'),
  maxPlayers: overrides.maxPlayers ?? 16,
  prizeDescription: null,
  resultText: null,
  entryFeeCoins: overrides.entryFeeCoins ?? 0,
  prizePoolCoins: overrides.prizePoolCoins ?? 0,
  winnerUserId: overrides.winnerUserId ?? null,
  content: { en: { name: overrides.name ?? 'Cup' } },
  registrations: overrides.registrations ?? [],
  createdBy: { _id: oid(), displayName: 'Admin' },
  createdAt: new Date('2026-04-01T00:00:00Z'),
  updatedAt: new Date('2026-04-02T00:00:00Z'),
});

export const buildFindChain = (returnDocs: unknown[]) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDocs),
});

export const buildFindByIdChain = (returnDoc: unknown) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDoc),
});

/** Build a minimal mock Mongo session with withTransaction support. */
export const buildMockSession = () => ({
  withTransaction: jest
    .fn()
    .mockImplementation(async (fn: () => Promise<void>) => {
      await fn();
    }),
  endSession: jest.fn().mockResolvedValue(undefined),
});

export const buildModel = () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  updateOne: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
});

export const buildWalletService = () => ({
  debit: jest.fn(),
  credit: jest.fn(),
  getBalance: jest.fn().mockResolvedValue({ coins: 50, gems: 0 }),
  emitAfterCommit: jest.fn(),
  findByIdempotencyKey: jest.fn().mockResolvedValue(null),
});

export const buildConnection = () => ({
  startSession: jest.fn().mockResolvedValue(buildMockSession()),
});

export const buildServiceModule = async (
  model: ReturnType<typeof buildModel>,
  walletService: ReturnType<typeof buildWalletService>,
  connection: ReturnType<typeof buildConnection>,
) => {
  const moduleRef = await Test.createTestingModule({
    providers: [
      TournamentsService,
      { provide: getModelToken(Tournament.name), useValue: model },
      { provide: WalletService, useValue: walletService },
      { provide: getConnectionToken(), useValue: connection },
    ],
  }).compile();
  return moduleRef.get(TournamentsService);
};

describe('TournamentsService — core', () => {
  let service: TournamentsService;
  let model: ReturnType<typeof buildModel>;
  let walletService: ReturnType<typeof buildWalletService>;
  let connection: ReturnType<typeof buildConnection>;

  beforeEach(async () => {
    model = buildModel();
    walletService = buildWalletService();
    connection = buildConnection();
    service = await buildServiceModule(model, walletService, connection);
  });

  describe('listForAdmin', () => {
    it('paginates and populates createdBy', async () => {
      const docs = [buildDoc()];
      const chain = buildFindChain(docs);
      model.find.mockReturnValue(chain);
      model.countDocuments.mockResolvedValue(1);

      const result = await service.listForAdmin({ page: 1, pageSize: 25 });

      expect(model.find).toHaveBeenCalledWith({});
      expect(chain.populate).toHaveBeenCalledWith(
        'createdBy',
        '_id displayName',
      );
      expect(chain.sort).toHaveBeenCalledWith({ scheduledAt: -1, _id: -1 });
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(25);
      expect(result.total).toBe(1);
      expect(result.items[0]?.id).toBe(docs[0]._id.toString());
    });

    it('applies status, gameType, q filters with escapeRegExp', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);
      await service.listForAdmin({
        status: 'scheduled',
        gameType: 'sea_battle_v1',
        q: 'a.b',
      });
      expect(model.find).toHaveBeenCalledWith({
        status: 'scheduled',
        gameType: 'sea_battle_v1',
        'content.en.name': { $regex: 'a\\.b', $options: 'i' },
      });
    });
  });

  describe('listPublic', () => {
    it('excludes cancelled and resolves locale with EN fallback', async () => {
      const enOnly = buildDoc();
      const withRu = {
        ...buildDoc(),
        content: { en: { name: 'Cup' }, ru: { name: 'Кубок' } },
      };
      model.find.mockReturnValue(buildFindChain([enOnly, withRu]));

      const result = await service.listPublic('ru', false);

      expect(model.find).toHaveBeenCalledWith({ status: { $ne: 'cancelled' } });
      expect(result.items[0]?.name).toBe('Cup');
      expect(result.items[1]?.name).toBe('Кубок');
    });

    it('marks isRegistered when authenticated caller in registrations', async () => {
      const userOid = oid();
      const doc = buildDoc({
        registrations: [
          {
            userId: userOid,
            displayName: 'me',
            registeredAt: new Date(),
            waitlist: false,
          },
        ],
      });
      model.find.mockReturnValue(buildFindChain([doc]));
      const result = await service.listPublic('en', true, userOid.toString());
      expect(result.items[0]?.isRegistered).toBe(true);
    });
  });

  describe('create', () => {
    it('writes scheduled status and derives registration window when omitted', async () => {
      const id = oid();
      model.create.mockResolvedValue({ _id: id });
      model.findById.mockReturnValue(buildFindByIdChain(buildDoc({ _id: id })));

      await service.create(
        {
          gameType: 'critical_v1',
          scheduledAt: new Date('2026-06-01T18:00:00Z'),
          maxPlayers: 16,
          content: { en: { name: 'X' } },
        } as never,
        oid().toString(),
      );

      const call = model.create.mock.calls[0] as [Record<string, unknown>];
      expect(call[0].status).toBe('scheduled');
      expect(call[0].registrationOpensAt).toEqual(
        new Date('2026-05-25T18:00:00Z'),
      );
      expect(call[0].registrationClosesAt).toEqual(
        new Date('2026-06-01T17:00:00Z'),
      );
    });

    it('rejects invalid requester id', async () => {
      await expect(
        service.create(
          {
            gameType: 'critical_v1',
            scheduledAt: new Date(),
            maxPlayers: 16,
            content: { en: { name: 'X' } },
          } as never,
          'not-an-oid',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('transition', () => {
    it('allows scheduled → registration_open', async () => {
      const id = oid();
      model.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(buildDoc({ _id: id })),
        })
        .mockReturnValue(
          buildFindByIdChain(
            buildDoc({ _id: id, status: 'registration_open' }),
          ),
        );
      model.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.transition(
        id.toString(),
        'registration_open',
      );
      expect(result.status).toBe('registration_open');
    });

    it('rejects forbidden transition with 409', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(buildDoc({ _id: id })),
      });
      await expect(
        service.transition(id.toString(), 'completed'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('persists resultText on completed', async () => {
      const id = oid();
      model.findById
        .mockReturnValueOnce({
          lean: jest
            .fn()
            .mockResolvedValue(buildDoc({ _id: id, status: 'live' })),
        })
        .mockReturnValue(
          buildFindByIdChain(buildDoc({ _id: id, status: 'completed' })),
        );
      model.findByIdAndUpdate.mockResolvedValue({});

      await service.transition(id.toString(), 'completed', 'Alice won');

      const call = model.findByIdAndUpdate.mock.calls[0] as [
        string,
        { $set: Record<string, unknown> },
      ];
      expect(call[1].$set).toEqual({
        status: 'completed',
        resultText: 'Alice won',
      });
    });
  });

  describe('remove', () => {
    it('refuses to delete non-cancelled', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValue(buildDoc({ _id: id, status: 'live' })),
      });
      await expect(service.remove(id.toString())).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('deletes scheduled', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(buildDoc({ _id: id })),
      });
      model.findByIdAndDelete.mockResolvedValue({});
      await expect(service.remove(id.toString())).resolves.toBeUndefined();
    });
  });

  describe('findAdminItem', () => {
    it('throws 404 when missing', async () => {
      model.findById.mockReturnValue(buildFindByIdChain(null));
      await expect(
        service.findAdminItem(oid().toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
