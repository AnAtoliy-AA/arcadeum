import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminShopTable } from './AdminShopTable';
import type { EffectiveShopItem } from '@/features/shop/server/shop.types';
import { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;
let observerCallback: ObserverCallback | null = null;

const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback;
  }
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

beforeEach(() => {
  observerCallback = null;
  mockObserve.mockReset();
  mockUnobserve.mockReset();
  mockDisconnect.mockReset();
  window.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

function createMockItem(index: number): EffectiveShopItem {
  return {
    id: `item-${index}`,
    category: 'avatar',
    rarity: 'rare',
    nameKey: `Avatar ${index}`,
    descKey: `Description ${index}`,
    defaultPriceAmount: 100 * index,
    defaultPriceCurrency: 'coins',
    priceAmount: 100 * index,
    priceCurrency: 'coins',
    available: true,
    overridden: false,
    colorValue: null,
    assetUrl: `/assets/shop/avatar-${index}.png`,
  };
}

describe('AdminShopTable with Infinite Scroll', () => {
  it('renders empty state when catalog is empty', () => {
    render(<AdminShopTable catalog={[]} labels={adminShopEn} />);
    expect(screen.getByTestId('admin-shop-empty')).toBeInTheDocument();
    expect(screen.getByText(adminShopEn.empty)).toBeInTheDocument();
  });

  it('renders initial batch and sets up intersection observer', () => {
    const mockCatalog: EffectiveShopItem[] = Array.from(
      { length: 25 },
      (_, i) => createMockItem(i + 1),
    );

    render(
      <AdminShopTable
        catalog={mockCatalog}
        labels={adminShopEn}
        initialBatchSize={10}
        batchSize={10}
      />,
    );

    expect(screen.getByTestId('admin-shop-count-header')).toHaveTextContent(
      'Showing 10 of 25 items',
    );
    expect(screen.getByTestId('admin-shop-row-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('admin-shop-row-item-10')).toBeInTheDocument();
    expect(
      screen.queryByTestId('admin-shop-row-item-11'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('admin-shop-infinite-scroll-trigger'),
    ).toBeInTheDocument();
    expect(mockObserve).toHaveBeenCalled();
  });

  it('loads more items when IntersectionObserver fires', () => {
    const mockCatalog: EffectiveShopItem[] = Array.from(
      { length: 25 },
      (_, i) => createMockItem(i + 1),
    );

    render(
      <AdminShopTable
        catalog={mockCatalog}
        labels={adminShopEn}
        initialBatchSize={10}
        batchSize={10}
      />,
    );

    act(() => {
      observerCallback?.([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('admin-shop-count-header')).toHaveTextContent(
      'Showing 20 of 25 items',
    );
    expect(screen.getByTestId('admin-shop-row-item-11')).toBeInTheDocument();
    expect(screen.getByTestId('admin-shop-row-item-20')).toBeInTheDocument();
    expect(
      screen.queryByTestId('admin-shop-row-item-21'),
    ).not.toBeInTheDocument();

    act(() => {
      observerCallback?.([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('admin-shop-count-header')).toHaveTextContent(
      'Showing 25 of 25 items',
    );
    expect(screen.getByTestId('admin-shop-row-item-25')).toBeInTheDocument();
    expect(screen.getByTestId('admin-shop-all-loaded')).toHaveTextContent(
      'All 25 items loaded',
    );
  });

  it('loads more items when load more button is clicked', () => {
    const mockCatalog: EffectiveShopItem[] = Array.from(
      { length: 25 },
      (_, i) => createMockItem(i + 1),
    );

    render(
      <AdminShopTable
        catalog={mockCatalog}
        labels={adminShopEn}
        initialBatchSize={10}
        batchSize={10}
      />,
    );

    const loadMoreBtn = screen.getByTestId('admin-shop-load-more');
    fireEvent.click(loadMoreBtn);

    expect(screen.getByTestId('admin-shop-count-header')).toHaveTextContent(
      'Showing 20 of 25 items',
    );
    expect(screen.getByTestId('admin-shop-row-item-15')).toBeInTheDocument();
  });
});
