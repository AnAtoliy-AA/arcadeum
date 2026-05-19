import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SupportContact,
  type SupportContactDocument,
  type SupportChannelStatus,
} from './schemas/support-contact.schema';
import { SubmitContactDto } from './dto/submit-contact.dto';
import { DiscordNotifierService } from './lib/discord-notifier.service';
import { MailerService } from './lib/mailer.service';
import { dedupeHash } from './lib/dedupe-hash';

export type SupportSubmitResult = {
  id: string;
  status: { discord: SupportChannelStatus; email: SupportChannelStatus };
};

// Time-to-fill: any submission arriving < this many ms after the form
// mounted is treated as a bot. Real users take seconds to read + type;
// instant POSTs are not human-paced.
const MIN_FILL_TIME_MS = 2000;
// Reject identical submissions from the same IP within this window.
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    @InjectModel(SupportContact.name)
    private readonly model: Model<SupportContactDocument>,
    private readonly discord: DiscordNotifierService,
    private readonly mailer: MailerService,
  ) {}

  async submit(
    dto: SubmitContactDto,
    ip?: string,
  ): Promise<SupportSubmitResult> {
    const now = Date.now();

    // Time-to-fill: clamp to a sane range (submittedAt in the future or way
    // in the past = treat as bot/clock-skew bot).
    const elapsed = now - dto.submittedAt;
    if (elapsed < MIN_FILL_TIME_MS || elapsed > 24 * 60 * 60 * 1000) {
      throw new BadRequestException('form submitted too quickly');
    }

    const hash = dedupeHash({
      ip,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    });
    const recent = await this.model
      .findOne({
        dedupeHash: hash,
        createdAt: { $gte: new Date(now - DEDUPE_WINDOW_MS) },
      })
      .lean()
      .exec();
    if (recent) {
      throw new ConflictException('duplicate submission');
    }

    const doc = await this.model.create({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      ip,
      dedupeHash: hash,
      status: { discord: 'pending', email: 'pending' },
    });

    const payload = {
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    };

    const [discordRes, emailRes] = await Promise.all([
      this.discord.notify(payload),
      this.mailer.send(payload),
    ]);

    doc.status.discord = discordRes.status;
    doc.status.email = emailRes.status;
    const error: { discord?: string; email?: string } = {};
    if (discordRes.status === 'failed') error.discord = discordRes.error;
    if (emailRes.status === 'failed') error.email = emailRes.error;
    if (error.discord || error.email) doc.error = error;
    await doc.save();

    return {
      id: String(doc._id),
      status: { discord: discordRes.status, email: emailRes.status },
    };
  }
}
