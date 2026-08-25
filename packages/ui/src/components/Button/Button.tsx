'use client';
import { forwardRef, useMemo } from 'react';

import { ButtonProps } from './types';
import { resolveButtonClasses } from './buttonClasses';

/**
 * Shimmer overlay — a plain span animated with the btn-shimmer keyframes
 * defined in the web / ui Tailwind configs. Disabled in e2e mode so
 * screenshots stay stable.
 */
export const Shimmer = () => {
  if (process.env.NEXT_PUBLIC_E2E === 'true') return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-[-40%] top-0 w-[90%] animate-[btn-shimmer_2.25s_ease-in-out_infinite] bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.45),transparent)]"
      style={{ transform: 'skewX(-20deg)' }}
    />
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    shape,
    loading = false,
    showShimmer = false,
    fullWidth = false,
    disabled = false,
    pulse = false,
    jump = false,
    active = false,
    outline = false,
    ghost = false,
    rotatable = false,
    gameVariant,
    onClick,
    className,
    id,
    style,
    type,
    tabIndex,
    title,
    icon,
    'data-testid': dataTestId,
    'data-active': dataActive,
    'aria-pressed': ariaPressed,
    'aria-label': ariaLabel,
    'aria-selected': ariaSelected,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    'aria-controls': ariaControls,
    'aria-live': ariaLive,
    role,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
  },
  ref,
) {
  const classNames = useMemo(
    () =>
      resolveButtonClasses({
        variant,
        gameVariant,
        size,
        shape,
        active,
        outline,
        ghost,
        rotatable,
        fullWidth,
        disabled,
        loading,
        pulse,
        jump,
        className,
      }),
    [
      variant,
      gameVariant,
      size,
      shape,
      active,
      outline,
      ghost,
      rotatable,
      fullWidth,
      disabled,
      loading,
      pulse,
      jump,
      className,
    ],
  );
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      id={id}
      type={type ?? 'button'}
      className={classNames}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      aria-selected={ariaSelected}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      aria-controls={ariaControls}
      aria-live={ariaLive}
      role={role}
      data-testid={dataTestId}
      data-active={dataActive}
      style={style}
      tabIndex={tabIndex}
      title={title}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <span className="flex h-full w-full flex-row items-center justify-center gap-2 font-semibold tracking-[0.5px]">
        {icon}
        {children}
      </span>
      {showShimmer && !isDisabled ? <Shimmer /> : null}
    </button>
  );
});
