'use client';

import { useRef, useEffect, memo } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { Button } from '../Button';
import { Spinner } from '../Spinner/Spinner';
import { Typography } from '../Typography/Typography';
import { cx } from '../../utils/cx';

export interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  children?: ReactNode;
  loadMoreText?: string;
  allLoadedText?: string;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  loader?: ReactNode;
  endMessage?: ReactNode;
  'data-testid'?: string;
}

export const InfiniteScroll = memo(function InfiniteScroll({
  hasMore,
  isLoading = false,
  onLoadMore,
  children,
  loadMoreText = 'Load more',
  allLoadedText,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  loader,
  endMessage,
  'data-testid': testId,
}: InfiniteScrollProps): ReactElement {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (
      !target ||
      !hasMore ||
      isLoading ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return (
    <div className={cx('flex flex-col w-full', className)} data-testid={testId}>
      {children}

      {hasMore ? (
        <div
          ref={observerTarget}
          className="flex flex-col items-center justify-center p-4 gap-3 w-full"
          data-testid="infinite-scroll-trigger"
        >
          {isLoading && (loader ?? <Spinner size="sm" />)}
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            data-testid="infinite-scroll-load-more"
          >
            {loadMoreText}
          </Button>
        </div>
      ) : endMessage ? (
        <div
          className="flex flex-row items-center justify-center py-4 text-center w-full"
          data-testid="infinite-scroll-end"
        >
          {endMessage}
        </div>
      ) : allLoadedText ? (
        <div
          className="flex flex-row items-center justify-center py-4 text-center w-full"
          data-testid="infinite-scroll-all-loaded"
        >
          <Typography variant="caption" alpha="low">
            {allLoadedText}
          </Typography>
        </div>
      ) : null}
    </div>
  );
});
