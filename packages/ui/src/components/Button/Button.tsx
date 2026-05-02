import React, { memo, Children, useMemo } from 'react';
import type { ReactElement } from 'react';
import { StyledButton, Shimmer } from './StyledButton';
import { Typography } from '../Typography/Typography';
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

  const hasTextChildren = Children.toArray(children).some(
    child => typeof child === 'string' || typeof child === 'number'
  );

  const renderedChildren = hasTextChildren ? (
    <Typography
      uiSize={size as any}
      color="inherit"
      fontWeight="600"
    // Use display="contents" to avoid breaking flex layout if possible, 
    // or just rely on it being a single flex item.
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

  return (
    <StyledButton
      ref={rest.ref as unknown as React.Ref<HTMLElement>}
      $uiSize={size as any}
      size={undefined as any}
      isActive={isActive && !loading && !disabled}
      disabled={loading || disabled}
      animation="medium"
      fontWeight="600"
      letterSpacing={0.5}
      variant={variant as any}
      fullWidth={fullWidth}
      pulse={pulse}
      jump={jump}
      pill={pill}
      gameVariant={gameVariant}
      {...filteredProps}
    >
      {renderedIcon}
      {renderedChildren}
      {showShimmer && <Shimmer />}
    </StyledButton>
  );
});

Button.displayName = 'Button';

