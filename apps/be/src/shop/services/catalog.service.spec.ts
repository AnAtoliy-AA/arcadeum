import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { CatalogService } from './catalog.service';
import { ShopItemOverride } from '../schemas/shop-item-override.schema';
import { BadRequestException } from '@nestjs/common';
import { EconomySettingsService } from '../../economy/economy-settings.service';

type OverrideDoc = {
  itemId: string;
  available: boolean | null;
  priceAmount: number | null;
  priceCurrency: 'coins' | 'gems' | null;
};

class FakeOverrideModel {
  private docs = new Map<string, OverrideDoc>();

  find() {
    const docs = this.docs;
    return {
      lean: () => Promise.resolve(Array.from(docs.values())),
    };
  }

  findOne(filter: { itemId: string }) {
    const docs = this.docs;
    const id = filter.itemId;
    return {
      lean: () => Promise.resolve(docs.get(id) ?? null),
    };
  }

  findOneAndUpdate(
    filter: { itemId: string },
    update: { $set: Partial<OverrideDoc> },
  ): Promise<OverrideDoc> {
    const existing = this.docs.get(filter.itemId) ?? {
      itemId: filter.itemId,
      available: null,
      priceAmount: null,
      priceCurrency: null,
    };
    const next = { ...existing, ...update.$set };
    this.docs.set(filter.itemId, next as OverrideDoc);
    return Promise.resolve(next as OverrideDoc);
  }
}

describe('CatalogService', () => {
  let service: CatalogService;
  let overrideModel: FakeOverrideModel;

  beforeEach(async () => {
    overrideModel = new FakeOverrideModel();
    const module = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: getModelToken(ShopItemOverride.name),
          useValue: overrideModel,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('60') },
        },
        {
          provide: EconomySettingsService,
          useValue: {
            getNumber: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();
    service = module.get(CatalogService);
  });

  describe('getEffective', () => {
    it('returns null for unknown item', async () => {
      expect(await service.getEffective('does-not-exist')).toBeNull();
    });

    it('returns catalog defaults when no override exists', async () => {
      const item = await service.getEffective('avatar-fox-01');
      expect(item).toMatchObject({
        id: 'avatar-fox-01',
        available: true,
        priceAmount: 200,
        priceCurrency: 'coins',
        overridden: false,
      });
    });

    it('applies override fields when present', async () => {
      await service.setOverride(
        'avatar-fox-01',
        { available: false, priceAmount: 100, priceCurrency: 'coins' },
        'admin1',
      );
      const item = await service.getEffective('avatar-fox-01');
      expect(item).toMatchObject({
        available: false,
        priceAmount: 100,
        priceCurrency: 'coins',
        overridden: true,
      });
    });

    it('caches the result and reuses on second call', async () => {
      const spy = jest.spyOn(overrideModel, 'findOne');
      await service.getEffective('avatar-fox-01');
      await service.getEffective('avatar-fox-01');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('invalidate(itemId) clears the entry only for that item', async () => {
      const spy = jest.spyOn(overrideModel, 'findOne');
      await service.getEffective('avatar-fox-01');
      await service.getEffective('avatar-cat-01');
      service.invalidate('avatar-fox-01');
      await service.getEffective('avatar-fox-01');
      await service.getEffective('avatar-cat-01');
      // fox: miss, miss; cat: miss, hit
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  describe('listEffective', () => {
    it('filters by category', async () => {
      const list = await service.listEffective({ category: 'badge' });
      expect(list.every((i) => i.category === 'badge')).toBe(true);
    });

    it('filters by rarity', async () => {
      const list = await service.listEffective({ rarity: 'legendary' });
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((i) => i.rarity === 'legendary')).toBe(true);
    });

    it('excludes unavailable items by default', async () => {
      await service.setOverride(
        'avatar-fox-01',
        { available: false },
        'admin1',
      );
      const list = await service.listEffective();
      expect(list.some((i) => i.id === 'avatar-fox-01')).toBe(false);
    });

    it('includes unavailable items when includeUnavailable is true', async () => {
      await service.setOverride(
        'avatar-fox-01',
        { available: false },
        'admin1',
      );
      const list = await service.listEffective({ includeUnavailable: true });
      expect(list.some((i) => i.id === 'avatar-fox-01')).toBe(true);
    });
  });

  describe('setOverride', () => {
    it('rejects unknown item', async () => {
      await expect(
        service.setOverride('does-not-exist', { available: true }, 'admin1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects priceCurrency without priceAmount', async () => {
      await expect(
        service.setOverride(
          'avatar-fox-01',
          { priceCurrency: 'gems' },
          'admin1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects out-of-range price', async () => {
      await expect(
        service.setOverride(
          'avatar-fox-01',
          { priceAmount: -1, priceCurrency: 'coins' },
          'admin1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.setOverride(
          'avatar-fox-01',
          { priceAmount: 1_000_001, priceCurrency: 'coins' },
          'admin1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('invalidates cache so next read picks up the change', async () => {
      const first = await service.getEffective('avatar-fox-01');
      expect(first?.priceAmount).toBe(200);
      await service.setOverride(
        'avatar-fox-01',
        { priceAmount: 50, priceCurrency: 'coins' },
        'admin1',
      );
      const second = await service.getEffective('avatar-fox-01');
      expect(second?.priceAmount).toBe(50);
    });
  });

  describe('validateCategory / validateRarity', () => {
    it('returns the value on success', () => {
      expect(service.validateCategory('avatar')).toBe('avatar');
      expect(service.validateRarity('epic')).toBe('epic');
    });

    it('throws on invalid', () => {
      expect(() => service.validateCategory('bogus')).toThrow(
        BadRequestException,
      );
      expect(() => service.validateRarity('mythic')).toThrow(
        BadRequestException,
      );
    });
  });
});
