import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { XpSettings, XpSettingsDocument } from './schemas/xp-settings.schema';
import {
  DEFAULT_XP,
  type XpSettingsValues,
  xpForResult as computeXpForResult,
  levelFromXp as computeLevelFromXp,
  xpProgress as computeXpProgress,
} from './lib/xp-level';
import { grantLevelBadges } from './lib/level-rewards';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../shop/schemas/user-inventory-item.schema';

const GLOBAL_SCOPE = 'global';

@Injectable()
export class XpSettingsService {
  private readonly logger = new Logger(XpSettingsService.name);

  constructor(
    @InjectModel(XpSettings.name)
    private readonly settingsModel: Model<XpSettingsDocument>,
    @Optional()
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel?: Model<UserInventoryItemDocument>,
  ) {}

  async getSettings(gameId?: string): Promise<XpSettingsValues> {
    const global = await this.loadScope(GLOBAL_SCOPE);
    if (!gameId || gameId === GLOBAL_SCOPE) {
      return global;
    }
    const game = await this.loadScope(gameId);
    return this.mergeSettings(global, game);
  }

  async getXpReward(
    gameId: string,
    result: 'won' | 'lost' | 'draw',
    isSolo: boolean,
    hasBots: boolean,
  ): Promise<number> {
    const settings = await this.getSettings(gameId);
    return computeXpForResult(result, settings, isSolo, hasBots);
  }

  async awardXp(
    userId: string,
    userModel: Model<unknown>,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) return;
    const updated = await (
      userModel as unknown as Model<{ xp?: number }>
    ).findOneAndUpdate(
      { _id: userId },
      { $inc: { xp: amount } },
      { new: true, projection: { xp: 1 } },
    );
    if (updated?.xp && this.inventoryModel) {
      const level = computeLevelFromXp(updated.xp);
      await grantLevelBadges(userId, level, this.inventoryModel);
    }
  }

  async listAll(): Promise<
    Array<{
      scope: string;
      winXp: number;
      lossXp: number;
      drawXp: number;
      soloCoefficient: number;
      botCoefficient: number;
      isGlobal: boolean;
    }>
  > {
    const docs = await this.settingsModel
      .find()
      .sort({ scope: 1 })
      .lean<XpSettingsDocument[]>();
    return docs.map((d) => ({
      scope: d.scope,
      winXp: d.winXp ?? DEFAULT_XP.WIN,
      lossXp: d.lossXp ?? DEFAULT_XP.LOSS,
      drawXp: d.drawXp ?? DEFAULT_XP.DRAW,
      soloCoefficient: d.soloCoefficient ?? DEFAULT_XP.SOLO_COEFF,
      botCoefficient: d.botCoefficient ?? DEFAULT_XP.BOT_COEFF,
      isGlobal: d.scope === GLOBAL_SCOPE,
    }));
  }

  async updateSettings(
    scope: string,
    values: Partial<XpSettingsValues>,
    adminUserId: string,
  ): Promise<void> {
    const update: Record<string, unknown> = { updatedBy: adminUserId };
    if (values.winXp !== undefined) update.winXp = values.winXp;
    if (values.lossXp !== undefined) update.lossXp = values.lossXp;
    if (values.drawXp !== undefined) update.drawXp = values.drawXp;
    if (values.soloCoefficient !== undefined)
      update.soloCoefficient = values.soloCoefficient;
    if (values.botCoefficient !== undefined)
      update.botCoefficient = values.botCoefficient;

    await this.settingsModel.findOneAndUpdate(
      { scope },
      { $set: update },
      { upsert: true, new: true },
    );
  }

  async resetToDefaults(scope: string): Promise<void> {
    await this.settingsModel.deleteOne({ scope });
  }

  levelFromXp(xp: number): number {
    return computeLevelFromXp(xp);
  }

  xpProgress(xp: number) {
    return computeXpProgress(xp);
  }

  private async loadScope(scope: string): Promise<XpSettingsValues> {
    const doc = await this.settingsModel
      .findOne({ scope })
      .lean<XpSettingsDocument | null>();
    if (!doc) {
      return {
        winXp: DEFAULT_XP.WIN,
        lossXp: DEFAULT_XP.LOSS,
        drawXp: DEFAULT_XP.DRAW,
        soloCoefficient: DEFAULT_XP.SOLO_COEFF,
        botCoefficient: DEFAULT_XP.BOT_COEFF,
      };
    }
    return {
      winXp: doc.winXp ?? DEFAULT_XP.WIN,
      lossXp: doc.lossXp ?? DEFAULT_XP.LOSS,
      drawXp: doc.drawXp ?? DEFAULT_XP.DRAW,
      soloCoefficient: doc.soloCoefficient ?? DEFAULT_XP.SOLO_COEFF,
      botCoefficient: doc.botCoefficient ?? DEFAULT_XP.BOT_COEFF,
    };
  }

  private mergeSettings(
    global: XpSettingsValues,
    override: XpSettingsValues,
  ): XpSettingsValues {
    return {
      winXp: override.winXp || global.winXp,
      lossXp: override.lossXp || global.lossXp,
      drawXp: override.drawXp || global.drawXp,
      soloCoefficient: override.soloCoefficient || global.soloCoefficient,
      botCoefficient: override.botCoefficient || global.botCoefficient,
    };
  }
}
