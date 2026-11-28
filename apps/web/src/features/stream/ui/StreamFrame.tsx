import type { ReactNode } from 'react';

/**
 * Letterboxed 16:9 stage. The inner box is the largest 16:9 rectangle that
 * fits the viewport and is a size container, so every child can size itself
 * with `cqw`/`cqh` units (1cqw = 1% of the stage width, i.e. 19.2px at
 * 1920x1080 and 12.8px at 1280x720). One layout therefore serves both
 * capture resolutions with no reflow, no media queries and no layout shift.
 */
export function StreamFrame({
  children,
  testId = 'stream-frame',
}: {
  children: ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-stream-root
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black"
    >
      <div
        data-testid={testId}
        className="relative overflow-hidden bg-[var(--background)] text-[var(--color)] [container-type:size]"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
        }}
      >
        {children}
      </div>
    </div>
  );
}
