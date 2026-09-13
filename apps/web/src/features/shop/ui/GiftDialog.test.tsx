import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GiftDialog } from './GiftDialog';
import { apiClient } from '@/shared/lib/api-client';
import { loadCatalog } from '@/features/shop/lib/catalogCache';
import type {
  EffectiveShopItem,
  InventoryItemView,
} from '../server/shop.types';

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'test-token' },
  }),
}));

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/features/shop/lib/catalogCache', () => ({
  loadCatalog: vi.fn(),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'pages.shop.items.avatar.fox01.name') return 'Fox';
      return key;
    },
  }),
}));

const mockCatalog: EffectiveShopItem[] = [
  {
    id: 'avatar-fox-01',
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/shop/avatars/fox-01.png',
    colorValue: null,
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 200,
    priceCurrency: 'coins',
    overridden: false,
  },
];

const mockInventory: InventoryItemView[] = [
  {
    rowId: 'row-1',
    itemId: 'avatar-fox-01',
    purchaseId: 'p1',
    acquiredVia: 'coins',
    paidAmount: 200,
    paidCurrency: 'coins',
    soldAt: null,
    createdAt: new Date().toISOString(),
  },
];

describe('GiftDialog', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockResolvedValue({ items: mockInventory });
    vi.mocked(loadCatalog).mockResolvedValue(mockCatalog);
  });

  it('renders item preview and human-readable name in gifts items list', async () => {
    render(
      <GiftDialog
        open={true}
        onClose={vi.fn()}
        recipientId="user-2"
        recipientName="Bob"
        recipientAvatarId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('gift-item-avatar-fox-01')).toBeInTheDocument();
    });

    expect(screen.getByText('Fox')).toBeInTheDocument();
    expect(screen.getByText('avatar-fox-01')).toBeInTheDocument();
    expect(screen.getByTestId('shop-asset-avatar-fox-01')).toBeInTheDocument();
  });
});
