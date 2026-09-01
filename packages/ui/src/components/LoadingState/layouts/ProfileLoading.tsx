import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function ProfileLoading(): ReactElement {
  const statIndices = [0, 1, 2];
  const historyIndices = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-8">
      <GlassPanel className="gap-6 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ShimmerBox className="h-24 w-24 rounded-full" />
          <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
            <div className="flex items-center gap-3">
              <ShimmerBox className="h-8 w-44" />
              <ShimmerBox className="h-6 w-16 rounded-full" />
            </div>
            <ShimmerBox className="h-4 w-64" />
            <ShimmerBox className="h-3 w-full max-w-md rounded-full" />
          </div>
          <ShimmerBox className="h-10 w-32 rounded-xl" />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {statIndices.map((i) => (
          <GlassPanel key={i} className="gap-2">
            <ShimmerBox className="h-4 w-24" />
            <ShimmerBox className="h-8 w-20" />
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="gap-4">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
          <ShimmerBox className="h-6 w-36" />
          <ShimmerBox className="h-6 w-20 rounded-md" />
        </div>
        <div className="flex flex-col gap-3">
          {historyIndices.map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-[var(--borderColor)]/10 p-3"
            >
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-10 w-10 rounded-xl" />
                <div className="flex flex-col gap-1">
                  <ShimmerBox className="h-4 w-28" />
                  <ShimmerBox className="h-3 w-16" />
                </div>
              </div>
              <ShimmerBox className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
