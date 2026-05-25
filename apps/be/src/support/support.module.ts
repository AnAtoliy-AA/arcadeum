import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SupportContact,
  SupportContactSchema,
} from './schemas/support-contact.schema';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { DiscordNotifierService } from './lib/discord-notifier.service';
import { MailerModule } from './mailer.module';
import { OriginGuard } from './lib/origin.guard';
import { SupportThrottlerGuard } from './lib/support-throttler.guard';

@Module({
  imports: [
    MailerModule,
    MongooseModule.forFeature([
      { name: SupportContact.name, schema: SupportContactSchema },
    ]),
  ],
  controllers: [SupportController],
  providers: [
    SupportService,
    DiscordNotifierService,
    OriginGuard,
    SupportThrottlerGuard,
  ],
})
export class SupportModule {}
