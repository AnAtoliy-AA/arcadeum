import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('../server/shop.actions', () => ({
  equipItemAction: vi.fn(),
  unequipItemAction: vi.fn(),
  purchaseItemAction: vi.fn(),
}));
vi.mock('../lib/syncEquippedToSession', () => ({
  syncEquippedToSession: vi.fn(),
}));

import { ShopActionPanel, type ShopActionLabels } from './ShopActionPanel';
import type {
  EffectiveShopItem,
  InventoryItemView,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const actionLabels: ShopActionLabels = {
  previewingEyebrow: 'Previewing',
  selectedSlotEyebrow: 'Selected slot',
  loadoutEyebrow: 'Your loadout',
  equippedEyebrow: 'Equipped',
  idleTitle: 'Hover an item to try it on',
  idleBody: 'Or tap a slot to filter.',
  buyEquip: 'Buy & equip',
  equip: 'Equip',
  unequip: 'Unequip',
  sell: 'Sell · 50%',
  clear: 'Clear',
  slotEmpty: 'Empty',
};

const slotLabels: Record<ShopCategory, { label: string; desc: string }> = {
  avatar: { label: 'Avatar', desc: '' },
  badge: { label: 'Badge', desc: '' },
  name_color: { label: 'Name color', desc: '' },
  game_skin: { label: 'Game skin', desc: '' },
};

const walletLabels = { nextPack: '', ofTarget: '' };
const sellLabels = {
  title: 'Sell item',
  sell: 'Sell',
  cancel: 'Cancel',
  refund: '',
  errors: {
    starterNotSellable: '',
    alreadySold: '',
    unequipFirst: '',
    generic: '',
  },
};

const EMPTY_PREVIEW = {
  avatar: null,
  badge: null,
  name_color: null,
  game_skin: null,
} satisfies Record<ShopCategory, EffectiveShopItem | null | undefined>;

const BALANCE: WalletBalanceView = { coins: 1000, gems: 50 };

function item(overrides: Partial<EffectiveShopItem> = {}): EffectiveShopItem {
  return {
    id: 'avatar-fox',
    category: 'avatar',
    rarity: 'rare',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/x.png',
    defaultPriceAmount: 100,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 100,
    priceCurrency: 'coins',
    overridden: false,
    ...overrides,
  };
}

const EMPTY_EQUIPPED: Record<ShopCategory, string | null> = {
  avatar: null,
  badge: null,
  name_color: null,
  game_skin: null,
};

function renderPanel(overrides: {
  hoverItem?: EffectiveShopItem | null;
  activeSlot?: ShopCategory | null;
  preview?: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  equippedIds?: Record<ShopCategory, string | null>;
  inventory?: InventoryItemView[];
  balance?: WalletBalanceView;
  onPurchaseFallback?: (item: EffectiveShopItem) => void;
}) {
  return render(
    <Wrapper>
      <ShopActionPanel
        hoverItem={overrides.hoverItem ?? null}
        activeSlot={overrides.activeSlot ?? null}
        preview={overrides.preview ?? EMPTY_PREVIEW}
        equippedIds={overrides.equippedIds ?? EMPTY_EQUIPPED}
        inventory={overrides.inventory ?? []}
        balance={overrides.balance ?? BALANCE}
        gemToCoinRate={100}
        nextGemPack={null}
        slotLabels={slotLabels}
        actionLabels={actionLabels}
        walletLabels={walletLabels}
        sellLabels={sellLabels}
        onPurchaseFallback={overrides.onPurchaseFallback ?? (() => {})}
      />
    </Wrapper>,
  );
}

describe('ShopActionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows idle mode and the wallet rail when nothing is hovered or selected', () => {
    const { getByTestId } = renderPanel({});
    const panel = getByTestId('shop-action-panel');
    expect(panel.getAttribute('data-mode')).toBe('idle');
    expect(panel.getAttribute('aria-live')).toBe('polite');
    expect(panel.getAttribute('aria-label')).toBe('Your loadout');
    expect(getByTestId('shop-wallet-rail')).toBeInTheDocument();
  });

  it('hover takes priority over an active slot (preview mode wins)', () => {
    const { getByTestId } = renderPanel({
      hoverItem: item(),
      activeSlot: 'badge',
    });
    expect(getByTestId('shop-action-panel').getAttribute('data-mode')).toBe(
      'preview',
    );
  });

  it('flips into slot mode when a slot is selected and nothing is hovered', () => {
    const { getByTestId } = renderPanel({ activeSlot: 'badge' });
    const panel = getByTestId('shop-action-panel');
    expect(panel.getAttribute('data-mode')).toBe('slot');
    expect(panel.getAttribute('aria-label')).toBe('Selected slot');
  });

  it('flags affordable=false when the user lacks the price currency', () => {
    const { getByTestId } = renderPanel({
      hoverItem: item({ priceCurrency: 'gems', priceAmount: 1000 }),
      balance: { coins: 5_000, gems: 5 },
    });
    expect(
      getByTestId('shop-action-buy-equip').getAttribute('data-affordable'),
    ).toBe('false');
  });

  it('routes the buy click through the fallback when un-affordable', () => {
    const fallback = vi.fn();
    const expensive = item({ priceCurrency: 'gems', priceAmount: 1000 });
    const { getByTestId } = renderPanel({
      hoverItem: expensive,
      balance: { coins: 0, gems: 5 },
      onPurchaseFallback: fallback,
    });
    fireEvent.click(getByTestId('shop-action-buy-equip'));
    expect(fallback).toHaveBeenCalledWith(expensive);
  });

  it('owned + equipped hover renders Unequip', () => {
    const equipped = item({ id: 'avatar-equipped' });
    const { getByTestId } = renderPanel({
      hoverItem: equipped,
      preview: { ...EMPTY_PREVIEW, avatar: equipped },
      equippedIds: { ...EMPTY_EQUIPPED, avatar: equipped.id },
      inventory: [
        {
          rowId: 'r1',
          itemId: equipped.id,
          purchaseId: 'p1',
          acquiredVia: 'coins',
          paidAmount: 100,
          paidCurrency: 'coins',
          soldAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    expect(getByTestId('shop-action-unequip')).toBeInTheDocument();
  });

  it('owned + not equipped hover renders Equip (preview overlays do NOT count as equipped)', () => {
    const owned = item({ id: 'avatar-other' });
    const { getByTestId, queryByTestId } = renderPanel({
      hoverItem: owned,
      // preview has the hover overlaid — this used to make the panel
      // wrongly think the item was equipped. Real equipped state is the
      // empty record, so we expect Equip not Unequip.
      preview: { ...EMPTY_PREVIEW, avatar: owned },
      equippedIds: EMPTY_EQUIPPED,
      inventory: [
        {
          rowId: 'r2',
          itemId: owned.id,
          purchaseId: 'p2',
          acquiredVia: 'coins',
          paidAmount: 100,
          paidCurrency: 'coins',
          soldAt: null,
          createdAt: '2026-01-01',
        },
      ],
    });
    expect(getByTestId('shop-action-equip')).toBeInTheDocument();
    expect(queryByTestId('shop-action-unequip')).toBeNull();
  });
});
