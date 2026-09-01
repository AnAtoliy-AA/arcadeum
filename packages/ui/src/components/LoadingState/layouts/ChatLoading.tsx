import type { ReactElement } from 'react';
import { cx } from '../../../utils/cx';
import { ShimmerBox, GlassPanel } from './primitives';

export function ChatLoading(): ReactElement {
  const contactIndices = [0, 1, 2, 3, 4];
  const messageIndices = [0, 1, 2, 3, 4];
  return (
    <div className="flex h-[640px] gap-6">
      <GlassPanel className="hidden w-80 gap-4 p-4 md:flex">
        <ShimmerBox className="h-10 w-full rounded-xl" />
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          {contactIndices.map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2">
              <ShimmerBox className="h-11 w-11 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <ShimmerBox className="h-4 w-28" />
                <ShimmerBox className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
      <GlassPanel className="flex-1 gap-4 p-4">
        <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
          <div className="flex items-center gap-3">
            <ShimmerBox className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <ShimmerBox className="h-4 w-32" />
              <ShimmerBox className="h-3 w-16" />
            </div>
          </div>
          <ShimmerBox className="h-8 w-20 rounded-lg" />
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden py-2">
          {messageIndices.map((i) => (
            <div
              key={i}
              className={cx(
                'flex max-w-sm flex-col gap-1',
                i % 2 === 0 ? 'self-start' : 'self-end',
              )}
            >
              <ShimmerBox
                className={cx(
                  'h-12 w-64 rounded-2xl',
                  i % 2 === 0 ? 'rounded-tl-sm' : 'rounded-tr-sm',
                )}
              />
              <ShimmerBox className="h-2 w-12 self-end" />
            </div>
          ))}
        </div>
        <ShimmerBox className="h-12 w-full rounded-xl" />
      </GlassPanel>
    </div>
  );
}
