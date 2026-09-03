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

export function Spinner({
  size = 'md',
  color,
  className,
  id,
  role,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}) {
  const s = SIZE_MAP[size] ?? SIZE_MAP.md;
  const b = BORDER_MAP[size] ?? BORDER_MAP.md;

  return (
    <div
      id={id}
      role={role ?? 'status'}
      aria-label={ariaLabel ?? 'Loading'}
      data-testid={dataTestId}
      className={className}
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
}
