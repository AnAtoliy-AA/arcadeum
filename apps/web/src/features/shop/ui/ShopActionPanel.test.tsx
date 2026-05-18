import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { ShopActionPanel, type ShopActionLabels } from './ShopActionPanel';
import type {
  EffectiveShopItem,
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

const BALANCE: WalletBalanceView = { coins: 1_000, gems: 50 };

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

function renderPanel(overrides: {
  hoverItem?: EffectiveShopItem | null;
  activeSlot?: ShopCategory | null;
  preview?: Record<ShopCategory, EffectiveShopItem | null | undefined>;
  balance?: WalletBalanceView;
}) {
  return render(
    <Wrapper>
      <ShopActionPanel
        hoverItem={overrides.hoverItem ?? null}
        activeSlot={overrides.activeSlot ?? null}
        preview={overrides.preview ?? EMPTY_PREVIEW}
        inventory={[]}
        balance={overrides.balance ?? BALANCE}
        gemToCoinRate={100}
        nextGemPack={null}
        slotLabels={slotLabels}
        actionLabels={actionLabels}
        walletLabels={walletLabels}
        sellLabels={sellLabels}
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

  it('preview mode is display-only — no Buy/Equip/Unequip buttons (those live on the card)', () => {
    const { queryByTestId } = renderPanel({ hoverItem: item() });
    expect(queryByTestId('shop-action-buy-equip')).toBeNull();
    expect(queryByTestId('shop-action-equip')).toBeNull();
    expect(queryByTestId('shop-action-unequip')).toBeNull();
  });

  it('slot mode renders Selected slot eyebrow and Clear control', () => {
    const { getByTestId } = renderPanel({ activeSlot: 'badge' });
    const panel = getByTestId('shop-action-panel');
    expect(panel.getAttribute('data-mode')).toBe('slot');
    expect(panel.getAttribute('aria-label')).toBe('Selected slot');
    expect(getByTestId('shop-action-clear')).toBeInTheDocument();
  });
});
