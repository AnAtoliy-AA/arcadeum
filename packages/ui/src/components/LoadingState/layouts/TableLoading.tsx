import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function TableLoading(): ReactElement {
  const rowIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ShimmerBox className="h-10 w-full max-w-sm rounded-xl" />
        <div className="flex gap-2">
          <ShimmerBox className="h-10 w-28 rounded-xl" />
          <ShimmerBox className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <GlassPanel className="p-0">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] bg-[var(--borderColor)]/10 px-6 py-4">
          <ShimmerBox className="h-4 w-28" />
          <ShimmerBox className="h-4 w-24" />
          <ShimmerBox className="h-4 w-20" />
          <ShimmerBox className="h-4 w-16" />
        </div>
        <div className="flex flex-col divide-y divide-[var(--glassBorder)]">
          {rowIndices.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-9 w-9 rounded-full" />
                <div className="flex flex-col gap-1">
                  <ShimmerBox className="h-4 w-32" />
                  <ShimmerBox className="h-3 w-20" />
                </div>
              </div>
              <ShimmerBox className="h-4 w-24" />
              <ShimmerBox className="h-6 w-20 rounded-full" />
              <ShimmerBox className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
