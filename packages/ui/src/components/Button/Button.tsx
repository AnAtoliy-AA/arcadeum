import { memo } from 'react';
import type { ReactElement } from 'react';
import { StyledButton, Shimmer } from './StyledButton';
import type { ButtonProps } from './types';

export { Shimmer };

export const Button = memo(function Button({
  size,
  isActive,
  loading,
  disabled,
  showShimmer,
  children,
  gameVariant,
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
      gameVariant={gameVariant}
      // Destructure transient props that might leak
      {...(() => {
        const {
          $variant,
          $status,
          $isMyTurn,
          $isActive,
          ...props
        } = rest as Record<string, unknown>;
        return props;
      })()}
    >
      {children}
      {showShimmer && <Shimmer />}
    </StyledButton>
  );
});

Button.displayName = 'Button';
