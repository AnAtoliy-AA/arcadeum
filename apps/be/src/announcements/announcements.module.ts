import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  Announcement,
  AnnouncementSchema,
} from './schemas/announcement.schema';
import { AnnouncementsService } from './announcements.service';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { PublicAnnouncementsController } from './public-announcements.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AdminAnnouncementsController, PublicAnnouncementsController],
  providers: [AnnouncementsService, RolesGuard],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
