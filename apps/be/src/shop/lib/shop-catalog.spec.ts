import {
  SHOP_CATALOG,
  SHOP_CATALOG_IDS,
  getCatalogItem,
  listStarterItems,
} from './shop-catalog';
import {
  SHOP_CATEGORIES,
  SHOP_PRICE_CURRENCIES,
  SHOP_RARITIES,
} from './shop-types';

describe('SHOP_CATALOG', () => {
  it('ids are unique and stable kebab-case', () => {
    const ids = Object.keys(SHOP_CATALOG);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)+$/);
      expect(SHOP_CATALOG[id].id).toBe(id);
    }
  });

  it('every entry uses a valid enum tuple', () => {
    for (const item of Object.values(SHOP_CATALOG)) {
      expect(SHOP_CATEGORIES).toContain(item.category);
      expect(SHOP_RARITIES).toContain(item.rarity);
      expect(SHOP_PRICE_CURRENCIES).toContain(item.defaultPriceCurrency);
      expect(item.defaultPriceAmount).toBeGreaterThanOrEqual(0);
      expect(item.defaultPriceAmount).toBeLessThanOrEqual(1_000_000);
    }
  });

  it('every i18n key starts with items.<category>.', () => {
    for (const item of Object.values(SHOP_CATALOG)) {
      expect(item.nameKey.startsWith(`items.${item.category}.`)).toBe(true);
      expect(item.descKey.startsWith(`items.${item.category}.`)).toBe(true);
    }
  });

  it('every assetUrl points under /shop/', () => {
    for (const item of Object.values(SHOP_CATALOG)) {
      expect(item.assetUrl.startsWith('/shop/')).toBe(true);
    }
  });

  it('starter items are priced 0', () => {
    const starters = listStarterItems();
    expect(starters.length).toBeGreaterThanOrEqual(2);
    for (const s of starters) {
      expect(s.defaultPriceAmount).toBe(0);
      expect(s.starter).toBe(true);
    }
  });

  it('starter set covers both avatar and badge categories', () => {
    const categories = new Set(listStarterItems().map((i) => i.category));
    expect(categories.has('avatar')).toBe(true);
    expect(categories.has('badge')).toBe(true);
  });

  it('non-starter items always have non-zero price', () => {
    for (const item of Object.values(SHOP_CATALOG)) {
      if (!item.starter) {
        expect(item.defaultPriceAmount).toBeGreaterThan(0);
      }
    }
  });

  it('getCatalogItem returns the item or null', () => {
    const firstId = SHOP_CATALOG_IDS[0];
    expect(getCatalogItem(firstId)).toBe(SHOP_CATALOG[firstId]);
    expect(getCatalogItem('does-not-exist')).toBeNull();
  });

  it('SHOP_CATALOG_IDS matches Object.keys(SHOP_CATALOG)', () => {
    expect(new Set(SHOP_CATALOG_IDS)).toEqual(
      new Set(Object.keys(SHOP_CATALOG)),
    );
  });

  it('seeds at least one item at every rarity tier in v1 categories', () => {
    const tiers = new Set(
      Object.values(SHOP_CATALOG)
        .filter((i) => i.category === 'avatar' || i.category === 'badge')
        .map((i) => i.rarity),
    );
    expect(tiers.has('common')).toBe(true);
    expect(tiers.has('rare')).toBe(true);
    expect(tiers.has('epic')).toBe(true);
    expect(tiers.has('legendary')).toBe(true);
  });
});
