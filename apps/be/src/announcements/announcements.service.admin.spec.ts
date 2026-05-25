import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AnnouncementsService } from './announcements.service';
import { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Announcement,
  SEVERITY_RANK,
  type AnnouncementAudience,
  type AnnouncementSeverity,
} from './schemas/announcement.schema';

const oid = () => new Types.ObjectId();

const buildDoc = (
  overrides: Partial<{
    _id: Types.ObjectId;
    severity: AnnouncementSeverity;
    severityRank: number;
    audience: AnnouncementAudience;
    startsAt: Date | null;
    endsAt: Date | null;
    title: string;
    createdBy: { _id: Types.ObjectId; displayName?: string | null };
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => {
  const _id = overrides._id ?? oid();
  const severity = overrides.severity ?? 'info';
  return {
    _id,
    severity,
    severityRank: overrides.severityRank ?? SEVERITY_RANK[severity],
    audience: overrides.audience ?? 'all',
    startsAt: overrides.startsAt ?? null,
    endsAt: overrides.endsAt ?? null,
    content: { en: { title: overrides.title ?? 'Hello' } },
    createdBy: overrides.createdBy ?? { _id: oid(), displayName: 'Admin Bob' },
    createdAt: overrides.createdAt ?? new Date('2026-04-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-04-02T00:00:00Z'),
  };
};

const buildFindChain = (returnDocs: unknown[]) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDocs),
});

const buildFindByIdChain = (returnDoc: unknown) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDoc),
});

describe('AnnouncementsService (admin)', () => {
  let service: AnnouncementsService;
  let model: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
    countDocuments: jest.Mock;
    create: jest.Mock;
  };
  let dispatcherMock: { dispatchMany: jest.Mock; dispatch: jest.Mock };
  let notificationsMock: { listUserIdsWithCategoryEnabled: jest.Mock };

  beforeEach(async () => {
    model = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
    };
    dispatcherMock = {
      dispatchMany: jest.fn().mockResolvedValue(undefined),
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    notificationsMock = {
      listUserIdsWithCategoryEnabled: jest.fn().mockResolvedValue([]),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: getModelToken(Announcement.name), useValue: model },
        { provide: NotificationDispatcher, useValue: dispatcherMock },
        { provide: NotificationsService, useValue: notificationsMock },
      ],
    }).compile();
    service = moduleRef.get(AnnouncementsService);
    jest.useFakeTimers().setSystemTime(new Date('2026-05-09T12:00:00Z'));
  });

  afterEach(() => jest.useRealTimers());

  describe('listForAdmin', () => {
    it('paginates with sort + populate', async () => {
      const docs = [buildDoc({ title: 'A' })];
      const chain = buildFindChain(docs);
      model.find.mockReturnValue(chain);
      model.countDocuments.mockResolvedValue(1);

      const result = await service.listForAdmin({ page: 1, pageSize: 25 });

      expect(model.find).toHaveBeenCalledWith({});
      expect(chain.populate).toHaveBeenCalledWith(
        'createdBy',
        '_id displayName',
      );
      expect(chain.sort).toHaveBeenCalledWith({
        severityRank: -1,
        startsAt: -1,
        _id: -1,
      });
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(25);
      expect(result.total).toBe(1);
      expect(result.items[0]?.id).toBe(docs[0]._id.toString());
    });

    it('skips correctly for higher pages', async () => {
      const chain = buildFindChain([]);
      model.find.mockReturnValue(chain);
      model.countDocuments.mockResolvedValue(0);

      await service.listForAdmin({ page: 3, pageSize: 25 });

      expect(chain.skip).toHaveBeenCalledWith(50);
    });

    it('applies q filter to content.en.title with escapeRegExp', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);

      await service.listForAdmin({ q: 'a.b' });

      expect(model.find).toHaveBeenCalledWith({
        'content.en.title': { $regex: 'a\\.b', $options: 'i' },
      });
    });

    it('applies severity filter', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);

      await service.listForAdmin({ severity: 'critical' });

      expect(model.find).toHaveBeenCalledWith({ severity: 'critical' });
    });

    it('status=active applies active-now predicate', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);

      await service.listForAdmin({ status: 'active' });

      const filter = (model.find.mock.calls[0] as [Record<string, unknown>])[0];
      expect(filter).toHaveProperty('$and');
    });

    it('status=scheduled filters by startsAt > now', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);

      await service.listForAdmin({ status: 'scheduled' });

      const filter = (
        model.find.mock.calls[0] as [Record<string, { $gt?: Date }>]
      )[0];
      expect(filter.startsAt?.$gt).toBeInstanceOf(Date);
    });

    it('status=expired filters by endsAt non-null and <= now', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);

      await service.listForAdmin({ status: 'expired' });

      const filter = (
        model.find.mock.calls[0] as [
          Record<string, { $ne?: null; $lte?: Date }>,
        ]
      )[0];
      expect(filter.endsAt?.$ne).toBeNull();
      expect(filter.endsAt?.$lte).toBeInstanceOf(Date);
    });

    it('returns derived status on each item', async () => {
      const past = new Date('2026-01-01T00:00:00Z');
      const future = new Date('2027-01-01T00:00:00Z');
      const docs = [
        buildDoc({ startsAt: past, endsAt: future }),
        buildDoc({ startsAt: future, endsAt: null }),
      ];
      model.find.mockReturnValue(buildFindChain(docs));
      model.countDocuments.mockResolvedValue(2);

      const result = await service.listForAdmin({});

      expect(result.items[0]?.status).toBe('active');
      expect(result.items[1]?.status).toBe('scheduled');
    });
  });

  describe('create', () => {
    it('writes severityRank and createdBy', async () => {
      const id = oid();
      model.create.mockResolvedValue({ _id: id });
      model.findById.mockReturnValue(buildFindByIdChain(buildDoc({ _id: id })));

      const requesterId = oid().toString();
      const result = await service.create(
        {
          severity: 'critical',
          content: { en: { title: 'X' } },
        } as never,
        requesterId,
      );

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical',
          severityRank: 3,
          audience: 'all',
          startsAt: null,
          endsAt: null,
        }),
      );
      expect(result.id).toBe(id.toString());
    });

    it('rejects invalid requester id', async () => {
      await expect(
        service.create(
          { severity: 'info', content: { en: { title: 'X' } } } as never,
          'not-an-oid',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('fans out announcement_new to opted-in users on public create', async () => {
      const id = oid();
      const u1 = oid();
      const u2 = oid();
      model.create.mockResolvedValue({ _id: id });
      model.findById.mockReturnValue(buildFindByIdChain(buildDoc({ _id: id })));
      notificationsMock.listUserIdsWithCategoryEnabled.mockResolvedValue([
        u1,
        u2,
      ]);

      await service.create(
        {
          severity: 'info',
          content: { en: { title: 'Patch', body: 'Big release' } },
          audience: 'all',
        } as never,
        oid().toString(),
      );

      expect(dispatcherMock.dispatchMany).toHaveBeenCalledTimes(1);
      const call = dispatcherMock.dispatchMany.mock.calls[0] as [
        string[],
        { category: string; i18nParams: Record<string, unknown> },
      ];
      expect(call[0]).toEqual([u1.toHexString(), u2.toHexString()]);
      expect(call[1].category).toBe('announcement_new');
      expect(call[1].i18nParams.title).toBe('Patch');
      expect(call[1].i18nParams.excerpt).toBe('Big release');
    });

    it('does NOT dispatch when audience is anonymous-only', async () => {
      const id = oid();
      model.create.mockResolvedValue({ _id: id });
      model.findById.mockReturnValue(buildFindByIdChain(buildDoc({ _id: id })));

      await service.create(
        {
          severity: 'info',
          content: { en: { title: 'X' } },
          audience: 'anonymous',
        } as never,
        oid().toString(),
      );

      expect(dispatcherMock.dispatchMany).not.toHaveBeenCalled();
    });

    it('does NOT dispatch when startsAt is in the future', async () => {
      const id = oid();
      model.create.mockResolvedValue({ _id: id });
      model.findById.mockReturnValue(buildFindByIdChain(buildDoc({ _id: id })));

      await service.create(
        {
          severity: 'info',
          content: { en: { title: 'X' } },
          audience: 'all',
          startsAt: new Date(Date.now() + 60_000),
        } as never,
        oid().toString(),
      );

      expect(dispatcherMock.dispatchMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws NotFound when id missing', async () => {
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(oid().toString(), { severity: 'warning' } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates severityRank when severity changes', async () => {
      const id = oid().toString();
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(buildDoc({ severity: 'warning' })),
      });
      model.findById.mockReturnValue(
        buildFindByIdChain(buildDoc({ severity: 'warning' })),
      );

      await service.update(id, { severity: 'warning' } as never);

      const call = model.findByIdAndUpdate.mock.calls[0] as [
        string,
        { $set: Record<string, unknown> },
      ];
      expect(call[1].$set).toEqual(
        expect.objectContaining({ severity: 'warning', severityRank: 2 }),
      );
    });

    it('rejects invalid id', async () => {
      await expect(
        service.update('bad', { severity: 'info' } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('throws NotFound when id missing', async () => {
      model.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(oid().toString())).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects invalid id', async () => {
      await expect(service.remove('bad')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns void on success', async () => {
      model.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(buildDoc()),
      });
      await expect(service.remove(oid().toString())).resolves.toBeUndefined();
    });
  });
});
