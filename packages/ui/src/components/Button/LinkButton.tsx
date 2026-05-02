'use client';

import { GetProps } from 'tamagui';
import React, { useMemo, Children } from 'react';
import { filterProps } from '../../utils/filterProps';
import type { ReactNode, MouseEventHandler, KeyboardEventHandler } from 'react';
import Link from 'next/link';
import { Typography } from '../Typography/Typography';
import { StyledLinkButton } from './StyledLinkButton';
import { Shimmer } from './StyledButton';
import type { ButtonVariant, ButtonSize, ResponsiveProp } from './types';


type StyledLinkButtonProps = GetProps<typeof StyledLinkButton>;

export type LinkButtonProps = Omit<StyledLinkButtonProps, 'size' | 'variant'> & {
  href: string;
  children: ReactNode;
  variant?: ResponsiveProp<ButtonVariant>;
  size?: ResponsiveProp<ButtonSize>;
  external?: boolean;
  fullWidth?: boolean;
  isActive?: boolean;
  pulse?: boolean;
  jump?: boolean;
  pill?: boolean;
  showShimmer?: boolean;
  icon?: ReactNode;
  id?: string;
  className?: string;
  /** @deprecated Use onClick instead */
  onPress?: StyledLinkButtonProps['onPress'];
  onClick?: MouseEventHandler<unknown>;
  'data-testid'?: string;
  'aria-label'?: string;
  prefetch?: boolean;
  as?: React.ElementType;
  fontWeight?: string | number;
  letterSpacing?: string | number;
};

export const LinkButton = StyledLinkButton.styleable<LinkButtonProps>(
  (
    {
      href,
      children,
      variant = 'primary',
      size = 'md',
      external,
      fullWidth,
      isActive,
      pulse,
      jump,
      pill,
      showShimmer,
      icon,
      onPress,
      onClick,
      id,
      className,
      'aria-label': ariaLabel,
      'data-testid': testId,
      prefetch,
      ...props
    },
    ref
  ) => {
    const hasTextChildren = Children.toArray(children).some(
      child => typeof child === 'string' || typeof child === 'number'
    );

    const renderedChildren = hasTextChildren ? (
      <Typography
        uiSize={size as any}
        color="inherit"
        fontWeight="600"
        variant="label"
      >
        {children}
      </Typography>
    ) : (
      children
    );

    const renderedIcon = icon && (typeof icon === 'string' || typeof icon === 'number') ? (
      <Typography uiSize={size as any} color="inherit">{icon}</Typography>
    ) : (
      icon
    );

    const filteredProps = filterProps({ ...props, onPress, onClick });

    return (
      <Link
        href={href}
        passHref
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        prefetch={prefetch}
      >
        <StyledLinkButton
          variant={variant as any}
          $uiSize={size as any}
          fullWidth={fullWidth}
          isActive={isActive}
          pulse={pulse}
          jump={jump}
          pill={pill}
          className={className}
          id={id}
          aria-label={ariaLabel}
          {...filteredProps}
          ref={ref}
          data-testid={testId}
        >
          {renderedIcon}
          {renderedChildren}
          {showShimmer && <Shimmer />}
        </StyledLinkButton>
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';
