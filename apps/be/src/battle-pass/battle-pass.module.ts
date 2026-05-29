import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BattlePassController } from './battle-pass.controller';
import { BattlePassService } from './battle-pass.service';
import {
  BattlePassProgress,
  BattlePassProgressSchema,
} from './schemas/battle-pass-progress.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BattlePassProgress.name, schema: BattlePassProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    forwardRef(() => GamesModule),
  ],
  controllers: [BattlePassController],
  providers: [BattlePassService],
  exports: [BattlePassService],
})
export class BattlePassModule {}
