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

type PlayerSectionProps = CommonProps & {
  isTargetable?: boolean;
  animated?: boolean;
  backgroundColor?: string;
  borderColor?: string;
};

export const PlayerSection = ({
  className,
  style,
  id,
  title,
  isTargetable,
  animated,
  backgroundColor,
  borderColor,
  children,
}: PlayerSectionProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch relative gap-1 p-2.5 border-2 rounded-[12px] min-w-0 min-h-0 w-full overflow-visible',
      'max-[1150px]:p-2 max-[1150px]:gap-1',
      'max-[800px]:p-1 max-[800px]:gap-[2px] max-[800px]:rounded-[8px]',
      '[@media(max-height:480px)]:p-1 [@media(max-height:480px)]:gap-[1px]',
      '[@media(orientation:landscape)_and_(max-height:520px)]:p-1 [@media(orientation:landscape)_and_(max-height:520px)]:gap-[1px]',
      isTargetable ? 'cursor-crosshair' : 'cursor-default',
      animated !== false && 'transition-all duration-300 ease-out',
      className,
    )}
    id={id}
    title={title}
    style={{
      ...(backgroundColor ? { backgroundColor } : {}),
      ...(borderColor ? { borderColor } : {}),
      ...(style ?? {}),
    }}
  >
    {children}
  </div>
);

// Natural-height wrapper. In fit-grid mode the `.sb-fit-grid > *` CSS
// rule stretches it to fill its grid cell; in mobile vertical (1-col flex
// column) we leave it at content height so the page scrolls naturally
// between boards instead of each board taking the full viewport height.
export const PlayerSectionWrapper = ({
  className,
  style,
  id,
  title,
  'data-testid': testId,
  children,
}: CommonProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch relative overflow-visible pt-[8px] w-full min-w-0',
      'max-[800px]:pt-[6px]',
      '[@media(max-height:480px)]:pt-[4px]',
      className,
    )}
    style={style}
    id={id}
    title={title}
    data-testid={testId}
  >
    {children}
  </div>
);

type BadgeWrapperProps = CommonProps;

export const BadgeWrapper = ({
  className,
  style,
  id,
  title,
  'data-testid': testId,
  children,
}: BadgeWrapperProps) => (
  <div
    className={cx(
      'flex flex-row items-stretch absolute top-0 z-[10] left-1/2 -translate-x-1/2',
      className,
    )}
    style={style}
    id={id}
    title={title}
    data-testid={testId}
  >
    {children}
  </div>
);

type PlayerNameProps = {
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  children?: React.ReactNode;
};

export const PlayerName = ({
  className,
  color,
  style,
  'data-testid': testId,
  children,
}: PlayerNameProps) => (
  <span
    data-testid={testId}
    className={cx(
      'is_PlayerName m-0 flex flex-row items-center justify-center gap-1.5 text-[15px] font-semibold text-center max-[800px]:text-[13px] min-w-0',
      className,
    )}
    style={{
      ...(color ? { color } : {}),
      ...(style ?? {}),
    }}
  >
    {children}
  </span>
);

export const PlayerStats = ({
  className,
  style,
  id,
  title,
  'data-testid': testId,
  children,
}: CommonProps) => (
  <div
    className={cx(
      'is_PlayerStats flex flex-col items-stretch w-full text-[14px]',
      className,
    )}
    style={style}
    id={id}
    title={title}
    data-testid={testId}
  >
    {children}
  </div>
);
