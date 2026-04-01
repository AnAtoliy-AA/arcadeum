'use client';

import { GetProps } from 'tamagui';
import { useMemo, Children } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import Link from 'next/link';
import { Typography } from '../Typography/Typography';
import { StyledLinkButton } from './StyledLinkButton';
import type { ButtonVariant, ButtonSize } from './types';

// Variants that use vibrant backgrounds and need white text for contrast
const VIBRANT_VARIANTS = ['primary', 'secondary', 'danger', 'success', 'warning', 'info'];

type StyledLinkButtonProps = GetProps<typeof StyledLinkButton>;

export interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
  fullWidth?: boolean;
  isActive?: boolean;
  id?: string;
  className?: string;
  onPress?: StyledLinkButtonProps['onPress'];
  onClick?: MouseEventHandler<any>;
  'data-testid'?: string;
  'aria-label'?: string;
}

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
      onPress,
      onClick,
      id,
      className,
      'aria-label': ariaLabel,
      'data-testid': testId,
      ...props
    },
    ref
  ) => {
    const renderedChildren = useMemo(
      () =>
        Children.map(children, (child) => {
          if (typeof child === 'string') {
            const isVibrant = VIBRANT_VARIANTS.includes((variant as string) || 'primary');
            return (
              <Typography 
                uiSize={size} 
                variant="label"
                color={isVibrant ? `$${variant || 'primary'}Text` as never : undefined}
              >
                {child}
              </Typography>
            );
          }
          return child;
        }),
      [children, size]
    );

    return (
      <Link
        href={href}
        passHref
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        <StyledLinkButton
          as="span"
          variant={variant}
          buttonSize={size}
          fullWidth={fullWidth}
          isActive={isActive}
          className={className}
          id={id}
          aria-label={ariaLabel}
          onPress={onPress}
          onClick={onClick}
          {...props}
          ref={ref}
          data-testid={testId}
        >
          {renderedChildren}
        </StyledLinkButton>
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';
