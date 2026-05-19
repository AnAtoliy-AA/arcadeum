import { Injectable, Logger } from '@nestjs/common';
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

export type SupportSubmitResult = {
  id: string;
  status: { discord: SupportChannelStatus; email: SupportChannelStatus };
};

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
    const doc = await this.model.create({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      ip,
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
