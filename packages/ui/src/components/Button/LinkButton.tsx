'use client';

import { GetProps } from 'tamagui';
import { useMemo, Children } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import Link from 'next/link';
import { Typography } from '../Typography/Typography';
import { StyledLinkButton } from './StyledLinkButton';
import { Shimmer } from './StyledButton';
import type { ButtonVariant, ButtonSize } from './types';

// Variants that use vibrant backgrounds and need white text for contrast
const VIBRANT_VARIANTS = ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'victory'];

type StyledLinkButtonProps = GetProps<typeof StyledLinkButton>;

export interface LinkButtonProps extends StyledLinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  onPress?: StyledLinkButtonProps['onPress'];
  onClick?: MouseEventHandler<any>;
  'data-testid'?: string;
  'aria-label'?: string;
  prefetch?: boolean;
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
    const renderedChildren = useMemo(
      () =>
        Children.map(children, (child) => {
          if (typeof child === 'string') {
            const isVibrant = VIBRANT_VARIANTS.includes((variant as string) || 'primary');
            return (
              <Typography 
                uiSize={size} 
                variant="label"
                fontWeight="800"
                color={isVibrant ? `$${variant || 'primary'}Text` as never : undefined}
              >
                {child}
              </Typography>
            );
          }
          return child;
        }),
      [children, size, variant]
    );

    return (
      <Link
        href={href}
        passHref
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        prefetch={prefetch}
      >
        <StyledLinkButton
          as="span"
          variant={variant}
          buttonSize={size}
          fullWidth={fullWidth}
          isActive={isActive}
          pulse={pulse}
          jump={jump}
          pill={pill}
          className={className}
          id={id}
          aria-label={ariaLabel}
          onPress={onPress}
          onClick={onClick}
          {...props}
          ref={ref}
          data-testid={testId}
        >
          {icon}
          {renderedChildren}
          {showShimmer && <Shimmer />}
        </StyledLinkButton>
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';
