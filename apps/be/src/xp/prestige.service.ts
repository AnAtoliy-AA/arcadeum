import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';

const MAX_PRESTIGE = 99;
const LEVEL_REQUIRED = 99;

@Injectable()
export class PrestigeService {
  private readonly logger = new Logger(PrestigeService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getPrestige(userId: string): Promise<{
    prestige: number;
    xp: number;
    level: number;
    canPrestige: boolean;
  }> {
    const user = await this.userModel
      .findById(userId)
      .select('xp prestige')
      .lean<{ xp?: number; prestige?: number } | null>();
    if (!user) throw new BadRequestException('User not found');

    const xp = user.xp ?? 0;
    const prestige = user.prestige ?? 0;
    const level = this.levelFromXp(xp);

    return {
      prestige,
      xp,
      level,
      canPrestige: level >= LEVEL_REQUIRED && prestige < MAX_PRESTIGE,
    };
  }

  async prestige(userId: string): Promise<{
    prestige: number;
    xp: number;
    level: number;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const xp = user.xp ?? 0;
    const prestige = user.prestige ?? 0;
    const level = this.levelFromXp(xp);

    if (level < LEVEL_REQUIRED) {
      throw new BadRequestException(
        `Must reach level ${LEVEL_REQUIRED} to prestige`,
      );
    }
    if (prestige >= MAX_PRESTIGE) {
      throw new BadRequestException('Maximum prestige reached');
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $set: { xp: 0, prestige: prestige + 1 } },
    );

    return {
      prestige: prestige + 1,
      xp: 0,
      level: 1,
    };
  }

  private levelFromXp(xp: number): number {
    const level = Math.floor(Math.pow(xp / 103, 1 / 2.5));
    return Math.max(level, 1);
  }
}
