import React from 'react';
import { cx } from '../../utils/cx';

export type DividerProps = {
  vertical?: boolean;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  id?: string;
};

const spacingClasses: Record<NonNullable<DividerProps['spacing']>, string> = {
  none: 'm-0',
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
};

export const Divider = ({
  vertical = false,
  spacing = 'md',
  className,
  style,
  'data-testid': dataTestId,
  id,
}: DividerProps) => (
  <div
    role="separator"
    id={id}
    data-testid={dataTestId}
    style={style}
    className={cx(
      'bg-[var(--borderColor)] opacity-50',
      vertical ? 'h-full w-px' : 'h-px w-full',
      spacingClasses[spacing],
      className,
    )}
  />
);
