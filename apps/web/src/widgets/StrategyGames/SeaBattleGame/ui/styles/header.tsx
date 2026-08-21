import React from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

type CommonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const CompactHeaderContainer = ({
  className,
  ...props
}: CommonProps) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between w-full gap-4 py-2 pb-3 z-[100] bg-[var(--background)] border-b border-b-[var(--glassBorder)]',
      'max-[800px]:flex-col max-[800px]:items-center max-[800px]:gap-2',
      className,
    )}
    {...props}
  />
);

export const HeaderTitleArea = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch min-w-0 flex-1',
      'max-[800px]:items-center',
      className,
    )}
    {...props}
  />
);

export const PlacementHeader = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between gap-4 mb-5',
      'max-[800px]:flex-col max-[800px]:items-stretch max-[800px]:gap-2 max-[800px]:mb-3',
      className,
    )}
    {...props}
  />
);
