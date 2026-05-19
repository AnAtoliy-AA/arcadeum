import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SupportContact,
  SupportContactSchema,
} from './schemas/support-contact.schema';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { DiscordNotifierService } from './lib/discord-notifier.service';
import { MailerService } from './lib/mailer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportContact.name, schema: SupportContactSchema },
    ]),
  ],
  controllers: [SupportController],
  providers: [SupportService, DiscordNotifierService, MailerService],
})
export class SupportModule {}
