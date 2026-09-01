import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function StandardLoading(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <GlassPanel className="gap-6 p-8">
        <div className="flex items-center gap-4">
          <ShimmerBox className="h-12 w-12 rounded-2xl" />
          <div className="flex flex-1 flex-col gap-2">
            <ShimmerBox className="h-7 w-2/5" />
            <ShimmerBox className="h-4 w-1/4" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-11/12" />
          <ShimmerBox className="h-4 w-3/4" />
        </div>
        <ShimmerBox className="h-52 w-full rounded-2xl" />
        <div className="flex flex-col gap-3">
          <ShimmerBox className="h-4 w-full" />
          <ShimmerBox className="h-4 w-4/5" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <ShimmerBox className="h-10 w-28 rounded-xl" />
          <ShimmerBox className="h-10 w-36 rounded-xl" />
        </div>
      </GlassPanel>
    </div>
  );
}
