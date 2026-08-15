'use client';

import React, { Children, forwardRef, useMemo } from 'react';
import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import { resolveButtonClasses } from './buttonClasses';
import { Shimmer } from './Button';
import type {
  ButtonShape,
  ButtonSize,
  ButtonVariant,
  GameVariant,
} from './types';

export type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant | ButtonVariant[];
  size?: ButtonSize;
  shape?: ButtonShape;
  gameVariant?: GameVariant;
  external?: boolean;
  fullWidth?: boolean;
  active?: boolean;
  outline?: boolean;
  ghost?: boolean;
  rotatable?: boolean;
  pulse?: boolean;
  jump?: boolean;
  showShimmer?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: MouseEventHandler<unknown>;
  'data-testid'?: string;
  'data-active'?: string | boolean;
  'aria-label'?: string;
  prefetch?: boolean;
};

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    {
      href,
      children,
      variant = 'primary',
      size = 'md',
      shape,
      gameVariant,
      external,
      fullWidth,
      active,
      outline,
      ghost,
      rotatable,
      pulse,
      jump,
      showShimmer,
      loading,
      disabled = false,
      icon,
      onClick,
      id,
      className,
      style,
      'aria-label': ariaLabel,
      'data-testid': testId,
      'data-active': dataActive,
      prefetch,
    },
    ref,
  ) {
    const hasTextChildren = Children.toArray(children).some(
      (child) => typeof child === 'string' || typeof child === 'number',
    );

    const classes = useMemo(
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
      <Link
        href={href}
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        aria-disabled={isDisabled || undefined}
        data-testid={testId}
        data-active={dataActive}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        prefetch={prefetch ?? false}
        className={classes}
        style={style}
        onClick={isDisabled ? undefined : onClick}
        tabIndex={isDisabled ? -1 : undefined}
      >
        {icon}
        {hasTextChildren ? (
          <span className="flex h-full w-full flex-row items-center justify-center gap-2 font-semibold tracking-[0.5px]">
            {children}
          </span>
        ) : (
          children
        )}
        {showShimmer && !isDisabled ? <Shimmer /> : null}
      </Link>
    );
  },
);

LinkButton.displayName = 'LinkButton';
