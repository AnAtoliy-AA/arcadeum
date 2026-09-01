import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function GridLayout(): ReactElement {
  const cardIndices = [0, 1, 2, 3, 4, 5];
  const chipIndices = [0, 1, 2, 3, 4];
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ShimmerBox className="h-11 w-full max-w-md rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          {chipIndices.map((i) => (
            <ShimmerBox key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cardIndices.map((i) => (
          <GlassPanel key={i} className="gap-4">
            <ShimmerBox className="h-44 w-full rounded-2xl" />
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-6 w-36" />
              <ShimmerBox className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <ShimmerBox className="h-4 w-full" />
              <ShimmerBox className="h-4 w-4/5" />
            </div>
            <div className="mt-2 flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <ShimmerBox className="h-6 w-14 rounded-md" />
                <ShimmerBox className="h-6 w-14 rounded-md" />
              </div>
              <ShimmerBox className="h-9 w-24 rounded-xl" />
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
