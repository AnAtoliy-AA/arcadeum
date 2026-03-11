import { GetProps, styled, YStack, TamaguiComponent } from 'tamagui';
import { useMemo, Children } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import Link from 'next/link';
import { Typography } from '../Typography/Typography';
import { sharedButtonVariants, sharedButtonSizes } from './SharedButtonStyles';
import { ButtonVariant, ButtonSize } from './types';

const StyledLinkButton: TamaguiComponent<any, any, any, any> = styled(YStack, {
  name: 'LinkButton',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  borderRadius: '$4',
  cursor: 'pointer',

  variants: {
    ...sharedButtonSizes,
    ...sharedButtonVariants,

    fullWidth: {
      true: { width: '100%' },
    },
    isActive: {
      true: {
        opacity: 0.8,
        backgroundColor: '$glassBgHover',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    buttonSize: 'md',
  },
});

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
    },
    ref
  ) => {
    const renderedChildren = useMemo(
      () =>
        Children.map(children, (child) => {
          if (typeof child === 'string') {
            return (
              <Typography uiSize={size} variant="label">
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
          data-testid={testId}
          aria-label={ariaLabel}
          onPress={onPress}
          onClick={onClick}
          ref={ref}
        >
          {renderedChildren}
        </StyledLinkButton>
      </Link>
    );
  }
);



LinkButton.displayName = 'LinkButton';
