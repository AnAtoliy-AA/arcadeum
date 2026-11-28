'use client';

import { Skeleton, SkeletonCircle } from '@arcadeum/ui';

export function ActivityFeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul
      aria-hidden
      data-testid="activity-feed-skeleton"
      className="grid grid-cols-1 gap-2.5 lg:grid-cols-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-3"
        >
          <SkeletonCircle width={36} height={36} delay={`${i * 80}ms`} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton
              height={12}
              width="55%"
              variant="text"
              delay={`${i * 80}ms`}
            />
            <Skeleton
              height={10}
              width="35%"
              variant="text"
              delay={`${i * 80}ms`}
            />
          </div>
          <Skeleton
            height={20}
            width={52}
            variant="rectangular"
            delay={`${i * 80}ms`}
          />
        </li>
      ))}
    </ul>
  );
}
