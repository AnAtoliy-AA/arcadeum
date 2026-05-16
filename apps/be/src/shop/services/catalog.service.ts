import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SHOP_CATALOG, getCatalogItem } from '../lib/shop-catalog';
import {
  isShopCategory,
  isShopPriceCurrency,
  isShopRarity,
  type EffectiveShopItem,
  type ShopCategory,
  type ShopItemDef,
  type ShopPriceCurrency,
  type ShopRarity,
} from '../lib/shop-types';
import {
  ShopItemOverride,
  type ShopItemOverrideDocument,
} from '../schemas/shop-item-override.schema';

interface CacheEntry {
  value: EffectiveShopItem;
  expiresAt: number;
}

export interface ListEffectiveFilter {
  category?: ShopCategory;
  rarity?: ShopRarity;
  includeUnavailable?: boolean;
}

export interface SetOverridePatch {
  available?: boolean | null;
  priceAmount?: number | null;
  priceCurrency?: ShopPriceCurrency | null;
}

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs: number;

  constructor(
    @InjectModel(ShopItemOverride.name)
    private readonly overrideModel: Model<ShopItemOverrideDocument>,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('SHOP_CACHE_TTL_SECONDS');
    const parsed = raw !== undefined && raw !== '' ? Number(raw) : 60;
    this.ttlMs =
      Number.isFinite(parsed) && parsed >= 0 ? parsed * 1000 : 60_000;
  }

  async getEffective(itemId: string): Promise<EffectiveShopItem | null> {
    const def = getCatalogItem(itemId);
    if (!def) return null;

    const now = Date.now();
    const cached = this.cache.get(itemId);
    if (cached && cached.expiresAt > now) return cached.value;

    const override = await this.overrideModel.findOne({ itemId }).lean();
    const effective = this.applyOverride(def, override);

    if (this.ttlMs > 0) {
      this.cache.set(itemId, { value: effective, expiresAt: now + this.ttlMs });
    }
    return effective;
  }

  async listEffective(
    filter?: ListEffectiveFilter,
  ): Promise<EffectiveShopItem[]> {
    const overrides = await this.overrideModel.find().lean();
    const overrideMap = new Map(overrides.map((o) => [o.itemId, o]));
    const includeUnavailable = filter?.includeUnavailable ?? false;
    const out: EffectiveShopItem[] = [];

    for (const def of Object.values(SHOP_CATALOG)) {
      if (filter?.category && def.category !== filter.category) continue;
      if (filter?.rarity && def.rarity !== filter.rarity) continue;
      const effective = this.applyOverride(
        def,
        overrideMap.get(def.id) ?? null,
      );
      if (!includeUnavailable && !effective.available) continue;
      out.push(effective);
    }
    return out;
  }

  async setOverride(
    itemId: string,
    patch: SetOverridePatch,
    adminUserId: string,
  ): Promise<EffectiveShopItem> {
    const def = getCatalogItem(itemId);
    if (!def) {
      throw new BadRequestException('shop.unknownItem');
    }
    if (
      patch.priceCurrency !== undefined &&
      patch.priceCurrency !== null &&
      !isShopPriceCurrency(patch.priceCurrency)
    ) {
      throw new BadRequestException('shop.invalidCurrency');
    }
    if (
      patch.priceAmount !== undefined &&
      patch.priceAmount !== null &&
      (!Number.isInteger(patch.priceAmount) ||
        patch.priceAmount < 0 ||
        patch.priceAmount > 1_000_000)
    ) {
      throw new BadRequestException('shop.invalidPrice');
    }
    if (
      patch.priceCurrency !== undefined &&
      patch.priceCurrency !== null &&
      (patch.priceAmount === undefined || patch.priceAmount === null)
    ) {
      throw new BadRequestException('shop.priceCurrencyRequiresAmount');
    }

    const update: Record<string, unknown> = { updatedBy: adminUserId };
    if (patch.available !== undefined) update.available = patch.available;
    if (patch.priceAmount !== undefined) update.priceAmount = patch.priceAmount;
    if (patch.priceCurrency !== undefined)
      update.priceCurrency = patch.priceCurrency;

    await this.overrideModel.findOneAndUpdate(
      { itemId },
      { $set: update },
      { upsert: true, new: true },
    );

    this.invalidate(itemId);
    const effective = await this.getEffective(itemId);
    if (!effective) {
      throw new BadRequestException('shop.unknownItem');
    }
    return effective;
  }

  invalidate(itemId: string): void {
    this.cache.delete(itemId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  validateCategory(value: string): ShopCategory {
    if (!isShopCategory(value)) {
      throw new BadRequestException('shop.invalidCategory');
    }
    return value;
  }

  validateRarity(value: string): ShopRarity {
    if (!isShopRarity(value)) {
      throw new BadRequestException('shop.invalidRarity');
    }
    return value;
  }

  private applyOverride(
    def: ShopItemDef,
    override: Partial<{
      available: boolean | null;
      priceAmount: number | null;
      priceCurrency: ShopPriceCurrency | null;
    }> | null,
  ): EffectiveShopItem {
    const available =
      override?.available === null || override?.available === undefined
        ? true
        : override.available;
    const priceAmount =
      override?.priceAmount === null || override?.priceAmount === undefined
        ? def.defaultPriceAmount
        : override.priceAmount;
    const priceCurrency =
      override?.priceCurrency === null || override?.priceCurrency === undefined
        ? def.defaultPriceCurrency
        : override.priceCurrency;
    const overridden =
      override !== null &&
      override !== undefined &&
      (override.available !== null ||
        override.priceAmount !== null ||
        override.priceCurrency !== null);
    return {
      ...def,
      available,
      priceAmount,
      priceCurrency,
      overridden,
    };
  }
}
