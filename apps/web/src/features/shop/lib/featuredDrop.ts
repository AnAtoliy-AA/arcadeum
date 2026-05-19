import type { EffectiveShopItem, FeaturedDropView } from '../server/shop.types';

export interface FeaturedDropOptions {
  /**
   * Inventory ids the user already owns (live, unsold). The featured drop
   * is the "limited" headline slot — showing an item the user already owns
   * defeats the purpose, so candidates with these ids are filtered out
   * before tier selection.
   */
  ownedItemIds?: ReadonlySet<string>;
  /**
   * Override for tests / deterministic SSR. Defaults to `new Date()`.
   * Only the UTC day is read; time-of-day is ignored.
   */
  today?: Date;
}

function dayOfYearUtc(d: Date): number {
  const startOfYear = Date.UTC(d.getUTCFullYear(), 0, 0);
  const startOfDay = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
  );
  return Math.floor((startOfDay - startOfYear) / (24 * 60 * 60 * 1000));
}

/**
 * Pick the headline item for the /shop hero card.
 *
 * Selection cascade:
 *   1. Unowned legendaries — the "limited drop" framing only makes sense
 *      for something the user can actually buy.
 *   2. Unowned epics — fallback for users who own every legendary.
 *   3. `null` — every premium slot is already owned; hide the hero
 *      rather than show an "Equip" CTA the catalog rows already surface.
 *
 * Within a tier, candidates are sorted by id and the choice rotates by
 * UTC day-of-year, so two visits on the same day see the same item but
 * the headline changes day-to-day across the catalog. Stable per-day
 * pick is also necessary for SSR / preview correctness — random pick
 * would hydrate-mismatch on the client.
 *
 * `gemToCoinRate` is kept in the signature for call-site compatibility
 * but no longer affects selection — the previous price-sorted variant
 * always pinned the priciest legendary to the hero, which made the
 * headline never change in practice.
 */
export function pickFeaturedDrop(
  catalog: EffectiveShopItem[],
  _gemToCoinRate = 100,
  options: FeaturedDropOptions = {},
): FeaturedDropView | null {
  const owned = options.ownedItemIds ?? new Set<string>();
  const today = options.today ?? new Date();
  const dayIndex = dayOfYearUtc(today);

  const isAvailable = (c: EffectiveShopItem) => c.available;
  const isUnowned = (c: EffectiveShopItem) => !owned.has(c.id);

  const tiers: ReadonlyArray<EffectiveShopItem['rarity']> = [
    'legendary',
    'epic',
  ];

  for (const rarity of tiers) {
    const tier = catalog
      .filter((c) => isAvailable(c) && isUnowned(c) && c.rarity === rarity)
      .sort((a, b) => a.id.localeCompare(b.id));
    if (tier.length === 0) continue;
    const pick = tier[dayIndex % tier.length];
    return { itemId: pick.id, endsAtIso: null };
  }

  return null;
}
