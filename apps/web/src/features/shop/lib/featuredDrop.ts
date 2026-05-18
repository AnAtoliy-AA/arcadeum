import type { EffectiveShopItem, FeaturedDropView } from '../server/shop.types';

function priceCoinEquivalent(
  item: EffectiveShopItem,
  gemToCoinRate: number,
): number {
  return item.priceCurrency === 'coins'
    ? item.priceAmount
    : item.priceAmount * gemToCoinRate;
}

export function pickFeaturedDrop(
  catalog: EffectiveShopItem[],
  gemToCoinRate = 100,
): FeaturedDropView | null {
  const candidates = catalog.filter(
    (c) => c.available && (c.rarity === 'legendary' || c.rarity === 'epic'),
  );
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => {
    if (a.rarity !== b.rarity) return a.rarity === 'legendary' ? -1 : 1;
    return (
      priceCoinEquivalent(b, gemToCoinRate) -
      priceCoinEquivalent(a, gemToCoinRate)
    );
  });
  return { itemId: sorted[0].id, endsAtIso: null };
}
