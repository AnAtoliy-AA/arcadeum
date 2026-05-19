import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SupportService } from './support.service';
import { SupportContact } from './schemas/support-contact.schema';
import { DiscordNotifierService } from './lib/discord-notifier.service';
import { MailerService } from './lib/mailer.service';
import type { SubmitContactDto } from './dto/submit-contact.dto';

type SavedDoc = {
  _id: Types.ObjectId;
  status: { discord: string; email: string };
  error?: { discord?: string; email?: string };
  save: jest.Mock;
};

type FindOneChain = {
  lean: () => { exec: () => Promise<unknown> };
};

const FIXED_NOW = new Date('2026-05-20T12:00:00.000Z');

function buildDto(overrides: Partial<SubmitContactDto> = {}): SubmitContactDto {
  return {
    name: 'Alice',
    email: 'alice@example.com',
    subject: 'Help',
    message: 'I have a question that is long enough.',
    // Default: form mounted 5s before submission — passes time-to-fill.
    submittedAt: FIXED_NOW.getTime() - 5000,
    ...overrides,
  };
}

describe('SupportService', () => {
  let service: SupportService;
  let model: { create: jest.Mock; findOne: jest.Mock };
  let discord: { notify: jest.Mock };
  let mailer: { send: jest.Mock };
  let lastDoc: SavedDoc;

  const mockFindOneResult = (result: unknown) => {
    model.findOne.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(result) }),
    } as FindOneChain);
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(FIXED_NOW);

    lastDoc = {
      _id: new Types.ObjectId(),
      status: { discord: 'pending', email: 'pending' },
      save: jest.fn().mockImplementation(function (this: SavedDoc) {
        return Promise.resolve(this);
      }),
    };
    model = {
      create: jest.fn().mockImplementation(() => Promise.resolve(lastDoc)),
      findOne: jest.fn(),
    };
    mockFindOneResult(null); // default: no duplicate
    discord = { notify: jest.fn() };
    mailer = { send: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: getModelToken(SupportContact.name), useValue: model },
        { provide: DiscordNotifierService, useValue: discord },
        { provide: MailerService, useValue: mailer },
      ],
    }).compile();

    service = moduleRef.get(SupportService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('persists submission, fires both channels in parallel, returns sent status', async () => {
    discord.notify.mockResolvedValue({ status: 'sent' });
    mailer.send.mockResolvedValue({ status: 'sent' });

    const res = await service.submit(buildDto(), '1.2.3.4');

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alice',
        email: 'alice@example.com',
        subject: 'Help',
        ip: '1.2.3.4',
        status: { discord: 'pending', email: 'pending' },
        dedupeHash: expect.any(String) as unknown as string,
      }),
    );
    expect(discord.notify).toHaveBeenCalledTimes(1);
    expect(mailer.send).toHaveBeenCalledTimes(1);
    expect(lastDoc.save).toHaveBeenCalledTimes(1);
    expect(lastDoc.status).toEqual({ discord: 'sent', email: 'sent' });
    expect(lastDoc.error).toBeUndefined();
    expect(res.status).toEqual({ discord: 'sent', email: 'sent' });
    expect(res.id).toBe(lastDoc._id.toString());
  });

  it('records per-channel errors when one delivery fails', async () => {
    discord.notify.mockResolvedValue({ status: 'sent' });
    mailer.send.mockResolvedValue({ status: 'failed', error: 'auth refused' });

    const res = await service.submit(buildDto());

    expect(lastDoc.status).toEqual({ discord: 'sent', email: 'failed' });
    expect(lastDoc.error).toEqual({ email: 'auth refused' });
    expect(res.status.email).toBe('failed');
  });

  it('still persists when both channels fail', async () => {
    discord.notify.mockResolvedValue({ status: 'failed', error: '503' });
    mailer.send.mockResolvedValue({ status: 'failed', error: 'timeout' });

    const res = await service.submit(buildDto());

    expect(lastDoc.save).toHaveBeenCalled();
    expect(lastDoc.status).toEqual({ discord: 'failed', email: 'failed' });
    expect(lastDoc.error).toEqual({ discord: '503', email: 'timeout' });
    expect(res.status).toEqual({ discord: 'failed', email: 'failed' });
  });

  it('reflects unconfigured channels without raising', async () => {
    discord.notify.mockResolvedValue({ status: 'unconfigured' });
    mailer.send.mockResolvedValue({ status: 'unconfigured' });

    const res = await service.submit(buildDto());

    expect(lastDoc.status).toEqual({
      discord: 'unconfigured',
      email: 'unconfigured',
    });
    expect(lastDoc.error).toBeUndefined();
    expect(res.status).toEqual({
      discord: 'unconfigured',
      email: 'unconfigured',
    });
  });

  describe('time-to-fill check', () => {
    it('rejects submissions arriving < 2s after form mount', async () => {
      const dto = buildDto({ submittedAt: FIXED_NOW.getTime() - 500 });
      await expect(service.submit(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(model.create).not.toHaveBeenCalled();
    });

    it('rejects submittedAt in the future (clock skew / spoof)', async () => {
      const dto = buildDto({ submittedAt: FIXED_NOW.getTime() + 10_000 });
      await expect(service.submit(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects ancient submittedAt (stale page / spoof)', async () => {
      const dto = buildDto({
        submittedAt: FIXED_NOW.getTime() - 25 * 60 * 60 * 1000,
      });
      await expect(service.submit(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('dedupe', () => {
    it('rejects when an identical submission exists in the last hour', async () => {
      mockFindOneResult({ _id: 'old-doc' });
      discord.notify.mockResolvedValue({ status: 'sent' });
      mailer.send.mockResolvedValue({ status: 'sent' });

      await expect(
        service.submit(buildDto(), '1.2.3.4'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(model.create).not.toHaveBeenCalled();
      expect(discord.notify).not.toHaveBeenCalled();
      expect(mailer.send).not.toHaveBeenCalled();
    });

    it('queries by dedupeHash and a 1-hour window', async () => {
      discord.notify.mockResolvedValue({ status: 'sent' });
      mailer.send.mockResolvedValue({ status: 'sent' });

      await service.submit(buildDto(), '1.2.3.4');

      expect(model.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          dedupeHash: expect.any(String) as unknown as string,
          createdAt: { $gte: new Date(FIXED_NOW.getTime() - 60 * 60 * 1000) },
        }),
      );
    });
  });
});
