import { memo } from 'react';
import type { ReactElement } from 'react';
import { StyledButton, Shimmer } from './StyledButton';
import type { ButtonProps } from './types';

export { Shimmer };

import { filterProps } from '../../utils/filterProps';

export const Button = memo(function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  showShimmer = false,
  fullWidth,
  disabled,
  pulse = false,
  jump = false,
  isActive,
  pill = false,
  gameVariant,
  onPress,
  onClick,
  icon,
  ...rest
}: ButtonProps): ReactElement {
  const filteredProps = filterProps({ ...rest, onPress, onClick });

  return (
    <StyledButton
      ref={rest.ref as unknown as React.Ref<HTMLElement>}
      buttonSize={size}
      isActive={isActive && !loading && !disabled}
      disabled={loading || disabled}
      animation="medium"
      fontWeight="600"
      letterSpacing={0.5}
      variant={variant}
      fullWidth={fullWidth}
      pulse={pulse}
      jump={jump}
      pill={pill}
      gameVariant={gameVariant}
      {...filteredProps}
    >
      {children}
      {showShimmer && <Shimmer />}
    </StyledButton>
  );
});

Button.displayName = 'Button';
