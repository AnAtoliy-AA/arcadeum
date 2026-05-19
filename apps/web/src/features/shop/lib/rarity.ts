import type { ShopRarity } from '../server/shop.types';

export const RARITY_COLOR: Record<ShopRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#facc15',
};

export const RARITY_GLOW: Record<ShopRarity, string> = {
  common: 'rgba(156,163,175,0.18)',
  rare: 'rgba(59,130,246,0.22)',
  epic: 'rgba(168,85,247,0.26)',
  legendary: 'rgba(250,204,21,0.30)',
};

export const RARITY_ORDER: ShopRarity[] = [
  'common',
  'rare',
  'epic',
  'legendary',
];
