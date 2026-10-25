import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PurchaseConfirmDialog } from './PurchaseConfirmDialog';
import { purchaseItemAction } from '../server/shop.actions';
import type {
  EffectiveShopItem,
  WalletBalanceView,
} from '../server/shop.types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('../server/shop.actions', () => ({
  purchaseItemAction: vi.fn(),
}));

vi.mock('../lib/syncEquippedToSession', () => ({
  syncEquippedToSession: vi.fn(),
}));

const mockItem: EffectiveShopItem = {
  id: 'avatar-nexus-star',
  category: 'avatar',
  rarity: 'legendary',
  priceAmount: 0,
  priceCurrency: 'coins',
  available: true,
  purchasable: true,
  nameKey: 'items.avatar_nexus_star.name',
  descKey: 'items.avatar_nexus_star.desc',
  assetUrl: '/shop/avatars/nexus-star.png',
  starter: false,
};

const mockBalance: WalletBalanceView = {
  coins: 100,
  gems: 10,
  arcadeum: 0,
};

const mockLabels = {
  title: 'Confirm Purchase',
  buy: 'Buy',
  cancel: 'Cancel',
  close: 'Close',
  yourBalance: 'You have {amount} {currency}.',
  free: 'Free',
  successTitle: 'Equipped',
  successBody: '{name} has been equipped.',
  signIn: 'Sign In',
  errors: {
    insufficientFunds: "You don't have enough to buy this.",
    unavailable: 'This item is not currently available.',
    unauthorized: 'Please sign in to complete purchase.',
    generic: 'Failed to complete purchase. Try again.',
  },
};

describe('PurchaseConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in button and unauthorized message when not authenticated', () => {
    render(
      <PurchaseConfirmDialog
        item={mockItem}
        itemName="Nexus Star"
        itemDesc="A powerful futuristic cosmic star."
        balance={mockBalance}
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        labels={mockLabels}
        isAuthenticated={false}
      />,
    );

    expect(screen.getByText('Confirm Purchase')).toBeInTheDocument();
    expect(screen.getByText('Nexus Star')).toBeInTheDocument();
    expect(
      screen.getByTestId('purchase-unauthorized-message'),
    ).toHaveTextContent('Please sign in to complete purchase.');
    expect(screen.getByTestId('purchase-signin-button')).toBeInTheDocument();
    expect(
      screen.queryByTestId('purchase-confirm-button'),
    ).not.toBeInTheDocument();
  });

  it('renders buy button and completes purchase when authenticated', async () => {
    vi.mocked(purchaseItemAction).mockResolvedValue({
      ok: true,
      data: {
        inventoryItem: {
          purchaseId: 'p-1',
          itemId: mockItem.id,
          category: mockItem.category,
          acquiredAt: 1000,
          acquiredVia: 'coins',
          paidAmount: 0,
          paidCurrency: 'coins',
          soldAt: null,
          refundAmount: null,
          refundCurrency: null,
        },
        equipped: {
          equippedAvatarId: mockItem.id,
          equippedBadgeId: null,
          equippedNameColorId: null,
          equippedFrameId: null,
          equippedAuraId: null,
          equippedBannerId: null,
          equippedGameSkinId: null,
          equippedBackgroundId: null,
        },
        balance: mockBalance,
      },
    });

    const onSuccess = vi.fn();

    render(
      <PurchaseConfirmDialog
        item={mockItem}
        itemName="Nexus Star"
        itemDesc="A powerful futuristic cosmic star."
        balance={mockBalance}
        open={true}
        onClose={vi.fn()}
        onSuccess={onSuccess}
        labels={mockLabels}
        isAuthenticated={true}
      />,
    );

    const buyButton = screen.getByTestId('purchase-confirm-button');
    expect(buyButton).toBeInTheDocument();
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(screen.getByText('Equipped')).toBeInTheDocument();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays real backend error message when purchase fails', async () => {
    vi.mocked(purchaseItemAction).mockResolvedValue({
      ok: false,
      error: 'generic',
      message: 'Network rate limit exceeded. Please wait a moment.',
    });

    render(
      <PurchaseConfirmDialog
        item={mockItem}
        itemName="Nexus Star"
        itemDesc="A powerful futuristic cosmic star."
        balance={mockBalance}
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        labels={mockLabels}
        isAuthenticated={true}
      />,
    );

    fireEvent.click(screen.getByTestId('purchase-confirm-button'));

    await waitFor(() => {
      expect(screen.getByTestId('purchase-error')).toHaveTextContent(
        'Network rate limit exceeded. Please wait a moment.',
      );
    });
  });

  it('switches to sign in button if purchase action returns unauthorized', async () => {
    vi.mocked(purchaseItemAction).mockResolvedValue({
      ok: false,
      error: 'unauthorized',
      message: 'Unauthorized',
    });

    render(
      <PurchaseConfirmDialog
        item={mockItem}
        itemName="Nexus Star"
        itemDesc="A powerful futuristic cosmic star."
        balance={mockBalance}
        open={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        labels={mockLabels}
        isAuthenticated={true}
      />,
    );

    fireEvent.click(screen.getByTestId('purchase-confirm-button'));

    await waitFor(() => {
      expect(
        screen.getByTestId('purchase-unauthorized-message'),
      ).toHaveTextContent('Please sign in to complete purchase.');
      expect(screen.getByTestId('purchase-signin-button')).toBeInTheDocument();
    });
  });
});
