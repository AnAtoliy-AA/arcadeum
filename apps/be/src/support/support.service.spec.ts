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

const dto: SubmitContactDto = {
  name: 'Alice',
  email: 'alice@example.com',
  subject: 'Help',
  message: 'I have a question',
};

describe('SupportService', () => {
  let service: SupportService;
  let model: { create: jest.Mock };
  let discord: { notify: jest.Mock };
  let mailer: { send: jest.Mock };
  let lastDoc: SavedDoc;

  beforeEach(async () => {
    lastDoc = {
      _id: new Types.ObjectId(),
      status: { discord: 'pending', email: 'pending' },
      save: jest.fn().mockImplementation(function (this: SavedDoc) {
        return Promise.resolve(this);
      }),
    };
    model = {
      create: jest.fn().mockImplementation(() => Promise.resolve(lastDoc)),
    };
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

  it('persists submission, fires both channels in parallel, returns sent status', async () => {
    discord.notify.mockResolvedValue({ status: 'sent' });
    mailer.send.mockResolvedValue({ status: 'sent' });

    const res = await service.submit(dto, '1.2.3.4');

    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Alice',
        email: 'alice@example.com',
        subject: 'Help',
        message: 'I have a question',
        ip: '1.2.3.4',
        status: { discord: 'pending', email: 'pending' },
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

    const res = await service.submit(dto);

    expect(lastDoc.status).toEqual({ discord: 'sent', email: 'failed' });
    expect(lastDoc.error).toEqual({ email: 'auth refused' });
    expect(res.status.email).toBe('failed');
  });

  it('still persists when both channels fail', async () => {
    discord.notify.mockResolvedValue({ status: 'failed', error: '503' });
    mailer.send.mockResolvedValue({ status: 'failed', error: 'timeout' });

    const res = await service.submit(dto);

    expect(lastDoc.save).toHaveBeenCalled();
    expect(lastDoc.status).toEqual({ discord: 'failed', email: 'failed' });
    expect(lastDoc.error).toEqual({ discord: '503', email: 'timeout' });
    expect(res.status).toEqual({ discord: 'failed', email: 'failed' });
  });

  it('reflects unconfigured channels without raising', async () => {
    discord.notify.mockResolvedValue({ status: 'unconfigured' });
    mailer.send.mockResolvedValue({ status: 'unconfigured' });

    const res = await service.submit(dto);

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
});
