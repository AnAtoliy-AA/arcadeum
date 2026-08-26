import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'small' | 'large' | 'tiny';

const SIZE_MAP: Record<string, string> = {
  tiny: '12px',
  sm: '16px',
  small: '16px',
  md: '24px',
  lg: '36px',
  large: '36px',
};

const BORDER_MAP: Record<string, string> = {
  tiny: '1.5px',
  sm: '2px',
  small: '2px',
  md: '3px',
  lg: '4px',
  large: '4px',
};

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}) => {
  const s = SIZE_MAP[size] ?? SIZE_MAP.md;
  const b = BORDER_MAP[size] ?? BORDER_MAP.md;

  return (
    <div
      role="status"
      aria-label={ariaLabel ?? 'Loading'}
      className={className}
      data-testid={dataTestId}
      style={{
        width: s,
        height: s,
        borderRadius: '50%',
        border: `${b} solid ${color ?? 'var(--color-primary, #3b82f6)'}`,
        borderTopColor: 'transparent',
        animation: 'arcadeum-spin 0.6s linear infinite',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
};
