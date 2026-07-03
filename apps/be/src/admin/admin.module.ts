import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { GameVisibilityModule } from './game-visibility/game-visibility.module';
import { GameRuleVisibilityModule } from './game-visibility/game-rule-visibility.module';
import { AdminBlockedIpsController } from './admin-blocked-ips.controller';
import { IpBlockService } from '../common/guards/ip-block.guard';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GameVisibilityModule,
    GameRuleVisibilityModule,
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminBlockedIpsController,
  ],
  providers: [RolesGuard, AdminUsersService, IpBlockService],
  exports: [IpBlockService],
})
export class AdminModule {}
