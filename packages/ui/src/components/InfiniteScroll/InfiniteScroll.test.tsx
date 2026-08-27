import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InfiniteScroll } from './InfiniteScroll';

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

describe('InfiniteScroll', () => {
  it('renders children and infinite scroll trigger when hasMore=true', () => {
    const onLoadMore = vi.fn();
    render(
      <InfiniteScroll hasMore={true} onLoadMore={onLoadMore}>
        <div>Child item</div>
      </InfiniteScroll>,
    );

    expect(screen.getByText('Child item')).toBeInTheDocument();
    expect(screen.getByTestId('infinite-scroll-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('infinite-scroll-load-more')).toBeInTheDocument();
    expect(mockObserve).toHaveBeenCalled();
  });

  it('triggers onLoadMore when intersection observer entry is intersecting', () => {
    const onLoadMore = vi.fn();
    render(
      <InfiniteScroll hasMore={true} onLoadMore={onLoadMore}>
        <div>Child item</div>
      </InfiniteScroll>,
    );

    act(() => {
      observerCallback?.([{ isIntersecting: true }]);
    });

    expect(onLoadMore).toHaveBeenCalled();
  });

  it('triggers onLoadMore when load more button is clicked', () => {
    const onLoadMore = vi.fn();
    render(
      <InfiniteScroll hasMore={true} onLoadMore={onLoadMore}>
        <div>Child item</div>
      </InfiniteScroll>,
    );

    fireEvent.click(screen.getByTestId('infinite-scroll-load-more'));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('renders allLoadedText when hasMore=false', () => {
    render(
      <InfiniteScroll
        hasMore={false}
        onLoadMore={vi.fn()}
        allLoadedText="All 20 items loaded"
      >
        <div>Child item</div>
      </InfiniteScroll>,
    );

    expect(screen.queryByTestId('infinite-scroll-trigger')).not.toBeInTheDocument();
    expect(screen.getByTestId('infinite-scroll-all-loaded')).toBeInTheDocument();
    expect(screen.getByText('All 20 items loaded')).toBeInTheDocument();
  });

  it('renders custom endMessage when provided and hasMore=false', () => {
    render(
      <InfiniteScroll
        hasMore={false}
        onLoadMore={vi.fn()}
        endMessage={<span>No more data</span>}
      >
        <div>Child item</div>
      </InfiniteScroll>,
    );

    expect(screen.getByTestId('infinite-scroll-end')).toBeInTheDocument();
    expect(screen.getByText('No more data')).toBeInTheDocument();
  });
});
