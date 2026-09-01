import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function RoomLoading(): ReactElement {
  const playerIndices = [0, 1];
  const messageIndices = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-6 lg:h-[700px] lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <GlassPanel className="flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-9 w-9 rounded-xl" />
            <ShimmerBox className="h-6 w-36" />
            <ShimmerBox className="h-6 w-20 rounded-full" />
          </div>
          <ShimmerBox className="h-9 w-28 rounded-xl" />
        </GlassPanel>

        <GlassPanel className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              {playerIndices.map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <ShimmerBox className="h-16 w-16 rounded-full" />
                  <ShimmerBox className="h-4 w-20" />
                  <ShimmerBox className="h-3 w-12" />
                </div>
              ))}
            </div>
            <ShimmerBox className="h-64 w-64 rounded-2xl sm:h-80 sm:w-80" />
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="w-full gap-4 lg:w-80">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
          <ShimmerBox className="h-5 w-24" />
          <ShimmerBox className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {messageIndices.map((i) => (
            <div key={i} className="flex items-start gap-2">
              <ShimmerBox className="h-7 w-7 rounded-full" />
              <div className="flex flex-1 flex-col gap-1">
                <ShimmerBox className="h-3 w-16" />
                <ShimmerBox className="h-8 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <ShimmerBox className="h-10 w-full rounded-xl" />
      </GlassPanel>
    </div>
  );
}
