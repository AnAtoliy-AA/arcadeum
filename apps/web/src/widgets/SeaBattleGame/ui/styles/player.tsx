import React from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

type CommonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

type PlayerSectionProps = CommonProps & {
  isTargetable?: boolean;
  animated?: boolean;
  backgroundColor?: string;
  borderColor?: string;
};

export const PlayerSection = ({
  className,
  style,
  isTargetable,
  animated,
  backgroundColor,
  borderColor,
  ...props
}: PlayerSectionProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch relative gap-1.5 p-3 border-2 rounded-[12px] min-w-0 min-h-0 w-full overflow-visible',
      'max-[1150px]:p-2 max-[1150px]:gap-1',
      'max-[800px]:p-1 max-[800px]:gap-[2px] max-[800px]:rounded-[8px]',
      '[@media(max-height:480px)]:p-1 [@media(max-height:480px)]:gap-[1px]',
      isTargetable ? 'cursor-crosshair' : 'cursor-default',
      animated !== false && 'transition-all duration-300 ease-out',
      className,
    )}
    style={{
      ...(backgroundColor ? { backgroundColor } : {}),
      ...(borderColor ? { borderColor } : {}),
      ...(style ?? {}),
    }}
    {...props}
  />
);

// Natural-height wrapper. In fit-grid mode the `.sb-fit-grid > *` CSS
// rule stretches it to fill its grid cell; in mobile vertical (1-col flex
// column) we leave it at content height so the page scrolls naturally
// between boards instead of each board taking the full viewport height.
export const PlayerSectionWrapper = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch relative overflow-visible pt-[8px] w-full min-w-0',
      'max-[800px]:pt-[6px]',
      '[@media(max-height:480px)]:pt-[4px]',
      className,
    )}
    {...props}
  />
);

type BadgeWrapperProps = CommonProps;

export const BadgeWrapper = ({
  className,
  style,
  ...props
}: BadgeWrapperProps) => (
  <div
    className={cx(
      'flex flex-row items-stretch absolute top-0 z-[10] left-1/2 -translate-x-1/2',
      className,
    )}
    style={style}
    {...props}
  />
);

type PlayerNameProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  color?: string;
};

export const PlayerName = ({
  className,
  color,
  style,
  ...props
}: PlayerNameProps) => (
  <span
    className={cx(
      'is_PlayerName m-0 flex flex-row items-center justify-center gap-1.5 text-[15px] font-semibold text-center max-[800px]:text-[13px] min-w-0',
      className,
    )}
    style={{
      ...(color ? { color } : {}),
      ...(style ?? {}),
    }}
    {...props}
  />
);

export const PlayerStats = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'is_PlayerStats flex flex-col items-stretch w-full text-[14px]',
      className,
    )}
    {...props}
  />
);
