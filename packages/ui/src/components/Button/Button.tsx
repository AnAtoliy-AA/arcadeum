import { styled, YStack, TamaguiComponent } from 'tamagui';
import { memo } from 'react';
import type { ReactElement } from 'react';
import { StyledButton } from './StyledButton';
import { ButtonProps, ButtonVariant, GameVariant } from './types';

export { StyledButton, type ButtonVariant, type GameVariant };
export type { ButtonProps };

export const Shimmer: TamaguiComponent = styled(YStack, {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg, transparent, $glassBorder, transparent)',
  x: '-100%',
});

export const Button = memo(function Button({
  size,
  isActive,
  loading,
  disabled,
  showShimmer,
  gameVariant,
  children,
  ...rest
}: ButtonProps): ReactElement {
  return (
    <StyledButton
      buttonSize={size}
      isActive={isActive && !loading && !disabled}
      disabled={loading || disabled}
      animation="medium"
      fontWeight="600"
      letterSpacing={0.5}
      {...rest}
    >
      {children}
      {showShimmer && <Shimmer />}
    </StyledButton>
  );
});

Button.displayName = 'Button';
