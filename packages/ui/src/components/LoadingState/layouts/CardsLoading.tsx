import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function CardsLoading(): ReactElement {
  const cardIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <ShimmerBox className="h-9 w-24 rounded-xl" />
          <ShimmerBox className="h-9 w-24 rounded-xl" />
        </div>
        <ShimmerBox className="h-9 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {cardIndices.map((i) => (
          <GlassPanel key={i} className="gap-3 p-4">
            <ShimmerBox className="aspect-square w-full rounded-2xl" />
            <ShimmerBox className="h-5 w-3/4" />
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-5 w-16 rounded-full" />
              <ShimmerBox className="h-5 w-12" />
            </div>
            <ShimmerBox className="mt-2 h-9 w-full rounded-xl" />
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
