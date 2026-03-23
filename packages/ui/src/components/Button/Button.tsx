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
  onPress,
  onClick,
  ref,
  ...rest
}: ButtonProps): ReactElement {
  return (
    <StyledButton
      ref={ref}
      buttonSize={size}
      isActive={isActive && !loading && !disabled}
      disabled={loading || disabled}
      onPress={onPress}
      onClick={onClick}
      animation="medium"
      fontWeight="600"
      letterSpacing={0.5}
      gameVariant={gameVariant}
      {...(() => {
        const {
          $variant,
          $status,
          $isMyTurn,
          $isActive,
          textAlign: _textAlign,
          ...props
        } = rest as any;
        return props;
      })()}
      aria-pressed={(rest as any)['aria-pressed']}
    >
      {children}
      {showShimmer && <Shimmer />}
    </StyledButton>
  );
});

Button.displayName = 'Button';
