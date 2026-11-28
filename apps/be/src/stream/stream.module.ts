import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import {
  StreamSettingsDoc,
  StreamSettingsSchema,
} from './schemas/stream-settings.schema';
import {
  StreamSettingsAudit,
  StreamSettingsAuditSchema,
} from './schemas/stream-settings-audit.schema';
import {
  StreamCommand,
  StreamCommandSchema,
} from './schemas/stream-command.schema';
import {
  StreamStatusDoc,
  StreamStatusSchema,
} from './schemas/stream-status.schema';
import { StreamService } from './stream.service';
import { StreamServiceGuard } from './stream-service.guard';
import { AdminStreamController } from './admin-stream.controller';
import { StreamServiceController } from './stream-service.controller';

/**
 * Like EconomyModule, this does not import AuthModule (avoids cycles):
 * JwtAuthGuard works through the globally registered passport strategy and
 * RolesGuard is provided locally.
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StreamSettingsDoc.name, schema: StreamSettingsSchema },
      { name: StreamSettingsAudit.name, schema: StreamSettingsAuditSchema },
      { name: StreamCommand.name, schema: StreamCommandSchema },
      { name: StreamStatusDoc.name, schema: StreamStatusSchema },
    ]),
  ],
  providers: [StreamService, StreamServiceGuard, RolesGuard, JwtAuthGuard],
  controllers: [AdminStreamController, StreamServiceController],
  exports: [StreamService],
})
export class StreamModule {}
