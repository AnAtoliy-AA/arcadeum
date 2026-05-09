import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

@Injectable()
export class WalletBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(WalletBootstrap.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const coinsResult = await this.userModel.updateMany(
      { coins: { $exists: false } },
      { $set: { coins: 0 } },
    );
    this.logger.log(
      `Backfill coins: ${coinsResult.modifiedCount} users updated`,
    );

    const gemsResult = await this.userModel.updateMany(
      { gems: { $exists: false } },
      { $set: { gems: 0 } },
    );
    this.logger.log(`Backfill gems: ${gemsResult.modifiedCount} users updated`);
  }
}
