import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function AuthLoading(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center pt-8">
      <GlassPanel className="w-full items-center gap-6 p-8">
        <ShimmerBox className="h-16 w-16 rounded-2xl" />
        <div className="flex flex-col items-center gap-2">
          <ShimmerBox className="h-8 w-44 rounded-xl" />
          <ShimmerBox className="h-4 w-56" />
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-3 w-16" />
            <ShimmerBox className="h-11 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-3 w-20" />
            <ShimmerBox className="h-11 w-full rounded-xl" />
          </div>
          <ShimmerBox className="mt-2 h-12 w-full rounded-xl" />
        </div>
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-[var(--glassBorder)]" />
          <ShimmerBox className="h-3 w-8" />
          <div className="h-px flex-1 bg-[var(--glassBorder)]" />
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <ShimmerBox className="h-11 w-full rounded-xl" />
          <ShimmerBox className="h-11 w-full rounded-xl" />
        </div>
      </GlassPanel>
    </div>
  );
}
