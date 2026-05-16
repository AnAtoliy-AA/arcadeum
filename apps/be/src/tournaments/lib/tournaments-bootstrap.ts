import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from '../schemas/tournament.schema';

@Injectable()
export class TournamentsBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(TournamentsBootstrap.name);

  constructor(
    @InjectModel(Tournament.name) private readonly model: Model<Tournament>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const [feeRes, prizeRes, winnerRes] = await Promise.all([
      this.model.updateMany(
        { entryFeeCoins: { $exists: false } },
        { $set: { entryFeeCoins: 0 } },
      ),
      this.model.updateMany(
        { prizePoolCoins: { $exists: false } },
        { $set: { prizePoolCoins: 0 } },
      ),
      this.model.updateMany(
        { winnerUserId: { $exists: false } },
        { $set: { winnerUserId: null } },
      ),
    ]);
    const total =
      (feeRes.modifiedCount ?? 0) +
      (prizeRes.modifiedCount ?? 0) +
      (winnerRes.modifiedCount ?? 0);
    if (total > 0) {
      this.logger.log(
        `Tournament backfill: fee=${feeRes.modifiedCount ?? 0}, prize=${prizeRes.modifiedCount ?? 0}, winner=${winnerRes.modifiedCount ?? 0}`,
      );
    }
  }
}
