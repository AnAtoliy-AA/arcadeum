import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AnnouncementsService } from './announcements.service';
import {
  Announcement,
  SEVERITY_RANK,
  type AnnouncementSeverity,
} from './schemas/announcement.schema';

const oid = () => new Types.ObjectId();

const buildDoc = (
  overrides: Partial<{
    _id: Types.ObjectId;
    severity: AnnouncementSeverity;
    en: { title: string; body?: string; ctaLabel?: string; ctaHref?: string };
    ru?: { title: string; body?: string; ctaLabel?: string; ctaHref?: string };
    updatedAt: Date;
  }> = {},
) => {
  const _id = overrides._id ?? oid();
  const severity = overrides.severity ?? 'info';
  return {
    _id,
    severity,
    severityRank: SEVERITY_RANK[severity],
    audience: 'all' as const,
    startsAt: null,
    endsAt: null,
    content: {
      en: overrides.en ?? { title: 'Hello' },
      ...(overrides.ru ? { ru: overrides.ru } : {}),
    },
    createdBy: oid(),
    createdAt: new Date('2026-04-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-04-02T00:00:00Z'),
  };
};

const buildFindOneChain = (returnDoc: unknown) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDoc),
});

describe('AnnouncementsService (public)', () => {
  let service: AnnouncementsService;
  let model: { findOne: jest.Mock };

  beforeEach(async () => {
    model = { findOne: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: getModelToken(Announcement.name), useValue: model },
      ],
    }).compile();
    service = moduleRef.get(AnnouncementsService);
  });

  it('returns null when no doc matches', async () => {
    model.findOne.mockReturnValue(buildFindOneChain(null));
    const result = await service.getActiveForCaller(false, 'en');
    expect(result).toBeNull();
  });

  it('anonymous → audience filter is { $in: [all, anonymous] }', async () => {
    model.findOne.mockReturnValue(buildFindOneChain(null));

    await service.getActiveForCaller(false, 'en');

    const call = model.findOne.mock.calls[0] as [Record<string, unknown>];
    expect(call[0]).toMatchObject({
      audience: { $in: ['all', 'anonymous'] },
    });
  });

  it('authenticated → audience filter is { $in: [all, authenticated] }', async () => {
    model.findOne.mockReturnValue(buildFindOneChain(null));

    await service.getActiveForCaller(true, 'en');

    const call = model.findOne.mock.calls[0] as [Record<string, unknown>];
    expect(call[0]).toMatchObject({
      audience: { $in: ['all', 'authenticated'] },
    });
  });

  it('sorts by severityRank desc, startsAt desc, _id desc; limit 1', async () => {
    const chain = buildFindOneChain(null);
    model.findOne.mockReturnValue(chain);

    await service.getActiveForCaller(true, 'en');

    expect(chain.sort).toHaveBeenCalledWith({
      severityRank: -1,
      startsAt: -1,
      _id: -1,
    });
  });

  it('returns RU content when locale=ru and RU translation present', async () => {
    const doc = buildDoc({
      en: { title: 'EN' },
      ru: { title: 'RU', body: 'BodyRU' },
    });
    model.findOne.mockReturnValue(buildFindOneChain(doc));

    const result = await service.getActiveForCaller(true, 'ru');

    expect(result?.title).toBe('RU');
    expect(result?.body).toBe('BodyRU');
  });

  it('falls back to EN when RU translation missing', async () => {
    const doc = buildDoc({ en: { title: 'EN', body: 'BodyEN' } });
    model.findOne.mockReturnValue(buildFindOneChain(doc));

    const result = await service.getActiveForCaller(true, 'ru');

    expect(result?.title).toBe('EN');
    expect(result?.body).toBe('BodyEN');
  });

  it('strips admin-only fields (no audience, no createdBy, no full content map)', async () => {
    const doc = buildDoc();
    model.findOne.mockReturnValue(buildFindOneChain(doc));

    const result = await service.getActiveForCaller(true, 'en');

    expect(result).not.toHaveProperty('audience');
    expect(result).not.toHaveProperty('createdBy');
    expect(result).not.toHaveProperty('content');
  });

  it('omits body/ctaLabel/ctaHref when not present', async () => {
    const doc = buildDoc({ en: { title: 'Just a title' } });
    model.findOne.mockReturnValue(buildFindOneChain(doc));

    const result = await service.getActiveForCaller(false, 'en');

    expect(result?.title).toBe('Just a title');
    expect(result?.body).toBeUndefined();
    expect(result?.ctaLabel).toBeUndefined();
    expect(result?.ctaHref).toBeUndefined();
  });
});
