'use client';

import {
  forwardRef,
  type ReactNode,
  type CSSProperties,
  type MouseEventHandler,
} from 'react';

export type LaunchButtonProps = {
  children?: ReactNode;
  icon?: ReactNode;
  isLaunching?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  fullWidth?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
};

const buttonStyle = (
  isLaunching: boolean,
  disabled: boolean,
  fullWidth: boolean,
): CSSProperties => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '12px 20px',
  borderRadius: 12,
  borderWidth: 0,
  cursor: disabled || isLaunching ? 'not-allowed' : 'pointer',
  background:
    'linear-gradient(120deg, var(--primary) 0%, color-mix(in srgb, var(--accent) 80%, var(--primary)) 100%)',
  color: 'var(--primaryText, #ffffff)',
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: 0.2,
  boxShadow:
    '0 8px 24px rgba(56, 189, 248, 0.25), 0 2px 6px rgba(56, 189, 248, 0.30)',
  transition:
    'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease, opacity 220ms ease',
  width: fullWidth ? '100%' : 'auto',
  opacity: disabled ? 0.5 : 1,
  overflow: 'hidden',
  fontFamily: 'inherit',
});

const rocketBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition:
    'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 700ms ease',
};

const rocketLaunchingStyle: CSSProperties = {
  transform: 'translate(120px, -80px) rotate(-30deg)',
  opacity: 0,
};

const flashStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)',
  pointerEvents: 'none',
  opacity: 0,
  animation: 'launchButtonFlash 700ms ease-out forwards',
};

const flashKeyframes = `
@keyframes launchButtonFlash {
  0% { opacity: 0; transform: scale(0.6); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.4); }
}
`;

const RocketIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m22 2-11 11" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </svg>
);

export const LaunchButton = forwardRef<HTMLButtonElement, LaunchButtonProps>(
  function LaunchButton(
    {
      children,
      icon,
      isLaunching = false,
      disabled = false,
      type = 'submit',
      onClick,
      fullWidth = false,
      'aria-label': ariaLabel,
      'data-testid': testId,
    },
    ref,
  ) {
    const renderedIcon = icon ?? <RocketIcon />;
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || isLaunching}
        aria-busy={isLaunching || undefined}
        aria-label={ariaLabel}
        data-testid={testId}
        style={buttonStyle(isLaunching, disabled, fullWidth)}
      >
        <style>{flashKeyframes}</style>
        {isLaunching ? <span aria-hidden="true" style={flashStyle} /> : null}
        <span
          aria-hidden="true"
          style={{
            ...rocketBaseStyle,
            ...(isLaunching ? rocketLaunchingStyle : null),
          }}
        >
          {renderedIcon}
        </span>
        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      </button>
    );
  },
);

LaunchButton.displayName = 'LaunchButton';
