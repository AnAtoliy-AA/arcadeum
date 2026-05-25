import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './lib/mailer.service';

// Narrow module that exposes ONLY MailerService — used by both SupportModule
// (for the contact form) and AuthModule (for transactional sends like the
// password-reset link). Keeping the surface this thin avoids pulling
// SupportController + its ThrottlerGuard into every module that just wants
// to send mail, which would force every integration test to register
// ThrottlerModule even when it doesn't exercise the support flow.
@Module({
  imports: [ConfigModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
