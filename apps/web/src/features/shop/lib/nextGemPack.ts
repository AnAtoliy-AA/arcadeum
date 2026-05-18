import type { GemPackagePublic } from '@/features/gems/server/gems.types';
import type { NextGemPackView } from '../server/shop.types';

export function pickNextGemPack(
  currentGems: number,
  packs: GemPackagePublic[],
): NextGemPackView | null {
  const safe =
    Number.isFinite(currentGems) && currentGems > 0 ? currentGems : 0;
  const greater = packs
    .filter(({ gems: g }) => g > safe)
    .sort(({ gems: a }, { gems: b }) => a - b);
  const next = greater[0];
  if (!next) return null;
  const { name, gems: nextGems } = next;
  return { label: name, target: nextGems };
}
