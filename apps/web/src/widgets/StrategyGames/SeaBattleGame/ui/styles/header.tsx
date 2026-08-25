import React from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

type CommonProps = {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
};

export const CompactHeaderContainer = ({
  className,
  children,
}: CommonProps) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between w-full gap-4 py-2 pb-3 z-[100] bg-[var(--background)] border-b border-b-[var(--glassBorder)]',
      'max-[800px]:flex-col max-[800px]:items-center max-[800px]:gap-2',
      className,
    )}
  >
    {children}
  </div>
);

export const HeaderTitleArea = ({ className, children }: CommonProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch min-w-0 flex-1',
      'max-[800px]:items-center',
      className,
    )}
  >
    {children}
  </div>
);

export const PlacementHeader = ({ className, children }: CommonProps) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between gap-4 mb-5',
      'max-[800px]:flex-col max-[800px]:items-stretch max-[800px]:gap-2 max-[800px]:mb-3',
      className,
    )}
  >
    {children}
  </div>
);
