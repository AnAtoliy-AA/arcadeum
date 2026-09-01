import type { ReactElement } from 'react';
import { ShimmerBox, GlassPanel } from './primitives';

export function HomeLoading(): ReactElement {
  const cardIndices = [0, 1, 2, 3];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center justify-between gap-12 py-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5">
          <ShimmerBox className="h-7 w-44 rounded-full" />
          <ShimmerBox className="h-14 w-4/5 rounded-2xl" />
          <ShimmerBox className="h-6 w-full max-w-xl rounded-xl" />
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-4 w-5/6" />
            <ShimmerBox className="h-4 w-3/4" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <ShimmerBox className="h-12 w-36 rounded-xl" />
            <ShimmerBox className="h-12 w-44 rounded-xl" />
          </div>
        </div>
        <div className="flex h-72 w-full flex-1 items-center justify-center lg:max-w-md">
          <div className="relative flex h-64 w-60 items-center justify-center">
            <ShimmerBox className="absolute h-56 w-44 -translate-x-8 -rotate-12 rounded-2xl opacity-40" />
            <ShimmerBox className="absolute h-60 w-48 translate-x-8 rotate-12 rounded-2xl opacity-60" />
            <ShimmerBox className="relative z-10 h-64 w-52 rounded-2xl shadow-2xl" />
          </div>
        </div>
      </div>

      <GlassPanel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-3 w-3 rounded-full" />
            <ShimmerBox className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-6">
            <ShimmerBox className="h-5 w-24" />
            <ShimmerBox className="h-5 w-24" />
            <ShimmerBox className="h-5 w-24" />
          </div>
        </div>
      </GlassPanel>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <ShimmerBox className="h-8 w-56 rounded-xl" />
          <ShimmerBox className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cardIndices.map((i) => (
            <GlassPanel key={i} className="gap-4">
              <ShimmerBox className="h-40 w-full rounded-2xl" />
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-10 w-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <ShimmerBox className="h-5 w-3/4" />
                  <ShimmerBox className="h-3 w-1/2" />
                </div>
              </div>
              <ShimmerBox className="mt-2 h-10 w-full rounded-xl" />
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}
