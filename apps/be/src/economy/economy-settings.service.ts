import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  ECONOMY_KEYS_CONFIG,
  ECONOMY_KEYS,
  EconomyKey,
  isEconomyKey,
} from './economy-keys';
import {
  EconomySetting,
  EconomySettingDocument,
} from './schemas/economy-setting.schema';
import {
  EconomySettingsAudit,
  EconomySettingsAuditDocument,
} from './schemas/economy-settings-audit.schema';
import { WalletService } from '../wallet/wallet.service';
import type { EconomySettingView } from './interfaces/economy-setting.interface';
import type { EconomyAuditView } from './interfaces/economy-audit.interface';

interface CacheEntry {
  value: number;
  expiresAt: number;
}

type SettingLean = {
  key: string;
  value: number;
  updatedAt?: Date;
  updatedBy?: {
    _id: Types.ObjectId;
    displayName?: string;
    username?: string;
  } | null;
};

type AuditLean = {
  _id: Types.ObjectId;
  fromValue: number;
  toValue: number;
  adminUserId: { _id: Types.ObjectId; displayName?: string; username?: string };
  createdAt?: Date;
};

@Injectable()
export class EconomySettingsService {
  private readonly logger = new Logger(EconomySettingsService.name);
  private readonly cache = new Map<EconomyKey, CacheEntry>();
  private readonly ttlMs: number;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(EconomySetting.name)
    private readonly settingModel: Model<EconomySettingDocument>,
    @InjectModel(EconomySettingsAudit.name)
    private readonly auditModel: Model<EconomySettingsAuditDocument>,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('ECONOMY_CACHE_TTL_SECONDS');
    const parsed = raw !== undefined && raw !== '' ? Number(raw) : 60;
    this.ttlMs =
      Number.isFinite(parsed) && parsed >= 0 ? parsed * 1000 : 60_000;
  }

  async getNumber(key: EconomyKey): Promise<number> {
    if (!isEconomyKey(key)) {
      throw new BadRequestException('economy.unknownKey');
    }
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
    const resolved = await this.resolve(key);
    if (this.ttlMs > 0) {
      this.cache.set(key, { value: resolved, expiresAt: now + this.ttlMs });
    }
    return resolved;
  }

  async setNumber(
    key: EconomyKey,
    value: number,
    adminUserId: string,
  ): Promise<void> {
    if (!isEconomyKey(key)) {
      throw new BadRequestException('economy.unknownKey');
    }
    if (!this.isValidValue(value)) {
      throw new BadRequestException('economy.invalidValue');
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const fromValue = await this.resolveWithSession(key, session);
        await this.settingModel.findOneAndUpdate(
          { key },
          { $set: { value, updatedBy: new Types.ObjectId(adminUserId) } },
          { upsert: true, session, new: true },
        );
        await this.auditModel.create(
          [
            {
              key,
              fromValue,
              toValue: value,
              adminUserId: new Types.ObjectId(adminUserId),
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    this.invalidateKey(key);
  }

  async resetToDefault(key: EconomyKey, adminUserId: string): Promise<void> {
    if (!isEconomyKey(key)) {
      throw new BadRequestException('economy.unknownKey');
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const fromValue = await this.resolveWithSession(key, session);
        await this.settingModel.deleteOne({ key }, { session });
        const toValue = this.resolveWithoutDb(key);
        await this.auditModel.create(
          [
            {
              key,
              fromValue,
              toValue,
              adminUserId: new Types.ObjectId(adminUserId),
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    this.invalidateKey(key);
  }

  async listAll(): Promise<EconomySettingView[]> {
    const docs = await this.settingModel
      .find()
      .populate<{
        updatedBy: SettingLean['updatedBy'];
      }>('updatedBy', 'displayName username')
      .lean<SettingLean[]>();
    const byKey = new Map<string, SettingLean>();
    for (const d of docs) byKey.set(d.key, d);

    return ECONOMY_KEYS.map((key) => {
      const cfg = ECONOMY_KEYS_CONFIG[key];
      const doc = byKey.get(key);
      let currentValue: number;
      let source: 'override' | 'env' | 'default';
      if (doc && this.isValidValue(doc.value)) {
        currentValue = doc.value;
        source = 'override';
      } else {
        const envRaw = this.config.get<string>(cfg.env);
        const env = envRaw ? Number(envRaw) : NaN;
        if (this.isValidValue(env)) {
          currentValue = env;
          source = 'env';
        } else {
          currentValue = cfg.default;
          source = 'default';
        }
      }
      return {
        key,
        currentValue,
        defaultValue: cfg.default,
        source,
        updatedAt: doc?.updatedAt
          ? new Date(doc.updatedAt).toISOString()
          : null,
        updatedByLabel: doc?.updatedBy
          ? (doc.updatedBy.displayName ?? doc.updatedBy.username ?? null)
          : null,
      };
    });
  }

  async getAuditFor(
    key: EconomyKey,
    opts: { limit?: number } = {},
  ): Promise<EconomyAuditView[]> {
    if (!isEconomyKey(key)) {
      throw new BadRequestException('economy.unknownKey');
    }
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const rows = await this.auditModel
      .find({ key })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate<{
        adminUserId: AuditLean['adminUserId'];
      }>('adminUserId', 'displayName username')
      .lean<AuditLean[]>();
    return rows.map((r) => ({
      id: String(r._id),
      fromValue: r.fromValue,
      toValue: r.toValue,
      adminLabel:
        r.adminUserId?.displayName ?? r.adminUserId?.username ?? 'admin',
      changedAt: new Date(r.createdAt ?? Date.now()).toISOString(),
    }));
  }

  refreshCache(): void {
    this.cache.clear();
  }

  private async resolve(key: EconomyKey): Promise<number> {
    const doc = await this.settingModel
      .findOne({ key })
      .lean<{ value: number } | null>();
    if (doc && this.isValidValue(doc.value)) {
      return doc.value;
    }
    return this.resolveWithoutDb(key);
  }

  private async resolveWithSession(
    key: EconomyKey,
    session: ClientSession,
  ): Promise<number> {
    const doc = await this.settingModel
      .findOne({ key }, null, { session })
      .lean<{ value: number } | null>();
    if (doc && this.isValidValue(doc.value)) return doc.value;
    return this.resolveWithoutDb(key);
  }

  private resolveWithoutDb(key: EconomyKey): number {
    const cfg = ECONOMY_KEYS_CONFIG[key];
    const envRaw = this.config.get<string>(cfg.env);
    const env = envRaw ? Number(envRaw) : NaN;
    if (this.isValidValue(env)) return env;
    return cfg.default;
  }

  private isValidValue(v: unknown): v is number {
    return (
      typeof v === 'number' &&
      Number.isInteger(v) &&
      v >= 1 &&
      v <= WalletService.MAX_TRANSACTION_AMOUNT
    );
  }

  private invalidateKey(key: EconomyKey): void {
    this.cache.delete(key);
  }
}
