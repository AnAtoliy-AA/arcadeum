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
import { User, type UserDocument } from '../auth/schemas/user.schema';
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
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Optional()
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel?: Model<UserInventoryItemDocument>,
  ) {}

  async getSettings(gameId?: string): Promise<XpSettingsValues> {
    const global = await this.loadRaw(GLOBAL_SCOPE);
    if (!gameId || gameId === GLOBAL_SCOPE) {
      return this.mergeSettings(global);
    }
    const game = await this.loadRaw(gameId);
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

  /**
   * Atomically add XP to a user (default connection, same DB the profile API
   * reads from). Throws when the user does not exist so failures are visible
   * to callers instead of silently no-op'ing.
   */
  async awardXp(userId: string, amount: number): Promise<number> {
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: userId },
        { $inc: { xp: amount } },
        { new: true, projection: { xp: 1 } },
      )
      .lean<{ xp?: number } | null>();
    if (!updated) {
      throw new Error(`XP award failed: user ${userId} not found`);
    }
    const total = updated.xp ?? 0;
    if (total > 0 && this.inventoryModel) {
      const level = computeLevelFromXp(total);
      await grantLevelBadges(userId, level, this.inventoryModel);
    }
    return total;
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

  /** Raw stored overrides for a scope (only fields that were explicitly set). */
  private async loadRaw(scope: string): Promise<Partial<XpSettingsValues>> {
    const doc = await this.settingsModel
      .findOne({ scope })
      .lean<XpSettingsDocument | null>();
    if (!doc) return {};
    const raw: Partial<XpSettingsValues> = {};
    if (doc.winXp != null) raw.winXp = doc.winXp;
    if (doc.lossXp != null) raw.lossXp = doc.lossXp;
    if (doc.drawXp != null) raw.drawXp = doc.drawXp;
    if (doc.soloCoefficient != null) raw.soloCoefficient = doc.soloCoefficient;
    if (doc.botCoefficient != null) raw.botCoefficient = doc.botCoefficient;
    return raw;
  }

  /** Precedence: built-in defaults < global scope < per-game scope. A stored 0 is respected. */
  private mergeSettings(
    ...layers: Array<Partial<XpSettingsValues>>
  ): XpSettingsValues {
    const merged: XpSettingsValues = {
      winXp: DEFAULT_XP.WIN,
      lossXp: DEFAULT_XP.LOSS,
      drawXp: DEFAULT_XP.DRAW,
      soloCoefficient: DEFAULT_XP.SOLO_COEFF,
      botCoefficient: DEFAULT_XP.BOT_COEFF,
    };
    for (const layer of layers) {
      merged.winXp = layer.winXp ?? merged.winXp;
      merged.lossXp = layer.lossXp ?? merged.lossXp;
      merged.drawXp = layer.drawXp ?? merged.drawXp;
      merged.soloCoefficient = layer.soloCoefficient ?? merged.soloCoefficient;
      merged.botCoefficient = layer.botCoefficient ?? merged.botCoefficient;
    }
    return merged;
  }
}
