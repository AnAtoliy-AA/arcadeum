import type { ShopPriceCurrency } from '../server/shop.types';

export const CURRENCY_COLOR: Record<ShopPriceCurrency, string> = {
  coins: '#fbbf24',
  gems: '#a78bfa',
  arcadeum: '#22c55e',
};

export const CURRENCY_GLYPH: Record<ShopPriceCurrency, string> = {
  coins: '🪙',
  gems: '💎',
  arcadeum: '◎',
};
