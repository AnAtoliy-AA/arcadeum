import React from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button } from '@arcadeum/ui';

type CommonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

type ShipPaletteProps = CommonProps & {
  backgroundColor?: string;
  borderColor?: string;
};

export const ShipPalette = ({
  className,
  backgroundColor,
  borderColor,
  style,
  ...props
}: ShipPaletteProps) => (
  <div
    className={cx(
      'flex flex-col items-center gap-1.5 p-3',
      'max-[1150px]:flex-row max-[1150px]:overflow-x-auto max-[1150px]:p-1.5 max-[1150px]:gap-1.5 max-[1150px]:w-full max-[1150px]:items-center',
      '[@media(max-height:480px)]:p-1.5 [@media(max-height:480px)]:gap-1',
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

type ShipItemProps = CommonProps & {
  isPlaced?: boolean;
  animated?: boolean;
};

// Border/bg colors passed as inline props from useSeaBattleTheme()
export const ShipItem = ({
  className,
  style,
  isPlaced,
  animated,
  ...props
}: ShipItemProps) => (
  <div
    className={cx(
      'flex flex-row items-center gap-1.5 px-2 py-1.5 border rounded-[8px] max-w-[240px] w-full',
      'max-[1150px]:shrink-0 max-[1150px]:w-auto max-[1150px]:px-1.5 max-[1150px]:py-1',
      isPlaced ? 'opacity-50 cursor-default' : 'cursor-grab',
      animated && 'transition-all duration-300 ease-out',
      className,
    )}
    style={style}
    {...props}
  />
);

export const ShipPreview = ({ className, ...props }: CommonProps) => (
  <div
    className={cx('flex flex-row items-stretch gap-[1.5px]', className)}
    {...props}
  />
);

type ShipCellProps = CommonProps & {
  backgroundColor?: string;
};

// Pass backgroundColor, borderColor inline from useSeaBattleTheme()
export const ShipCell = ({
  className,
  backgroundColor,
  style,
  ...props
}: ShipCellProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch w-[14px] h-[14px] rounded-[2px] border-[0.5px]',
      className,
    )}
    style={{
      ...(backgroundColor ? { backgroundColor } : {}),
      ...(style ?? {}),
    }}
    {...props}
  />
);

type ShipNameProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  color?: string;
};

export const ShipName = ({
  className,
  color,
  style,
  ...props
}: ShipNameProps) => (
  <span
    className={cx('text-[13px] max-[1150px]:text-[11px]', className)}
    style={{
      ...(color ? { color } : {}),
      ...(style ?? {}),
    }}
    {...props}
  />
);

export const PlacementActions = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'flex flex-row items-center justify-center gap-2 w-full px-2 py-2 flex-wrap',
      'xl:gap-3 xl:px-4 xl:py-4',
      '[@media(max-height:480px)]:py-1 [@media(max-height:480px)]:gap-1.5',
      className,
    )}
    {...props}
  />
);

// Re-export Button as ActionButton and RotateButton for call sites that import by name
export { Button as ActionButton, Button as RotateButton };
