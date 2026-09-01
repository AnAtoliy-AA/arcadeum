import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function StatsLoading(): ReactElement {
  const metricIndices = [0, 1, 2, 3];
  const rowIndices = [0, 1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricIndices.map((i) => (
          <GlassPanel key={i} className="gap-3">
            <ShimmerBox className="h-4 w-24" />
            <ShimmerBox className="h-9 w-32 rounded-lg" />
            <ShimmerBox className="h-3 w-16" />
          </GlassPanel>
        ))}
      </div>
      <GlassPanel className="gap-6">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-4">
          <ShimmerBox className="h-6 w-40" />
          <div className="flex gap-2">
            <ShimmerBox className="h-8 w-20 rounded-lg" />
            <ShimmerBox className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {rowIndices.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-[var(--borderColor)]/10 p-3"
            >
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-8 w-8 rounded-full" />
                <ShimmerBox className="h-9 w-9 rounded-full" />
                <ShimmerBox className="h-5 w-32" />
              </div>
              <div className="flex items-center gap-6">
                <ShimmerBox className="h-5 w-16" />
                <ShimmerBox className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
