import type { CSSProperties, ReactNode } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

export function ActionBar({
  className,
  style,
  'data-testid': testId,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch sticky bottom-0 z-[40] py-2 px-3 gap-2 border-t border-t-[var(--glassBorder)] items-center justify-end shrink-0 w-full',
        className,
      )}
      style={{
        backgroundColor: 'rgba(15,17,22,0.85)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        ...style,
      }}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
