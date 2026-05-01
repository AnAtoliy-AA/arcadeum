import { Text, styled } from 'tamagui';
import { memo } from 'react';

const StyledBadge = styled(Text, {
  name: 'IdleBadge',
  fontSize: '$1',
  fontWeight: '600',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  borderRadius: '$1',
  borderWidth: 1,

  variants: {
    variant: {
      idle: {
        backgroundColor: '$warningBgSoft',
        color: '$warning',
        borderColor: '$warningBorder',
      },
      offline: {
        backgroundColor: '$dangerBgSoft',
        color: '$danger',
        borderColor: '$dangerBorder',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'idle',
  },
});

export type IdleBadgeProps = {
  variant?: 'idle' | 'offline';
  label?: string;
};

export const IdleBadge = memo(function IdleBadge({ variant = 'idle', label }: IdleBadgeProps) {
  const emoji = variant === 'offline' ? '🔴' : '💤';
  const defaultLabel = variant === 'offline' ? 'Offline' : 'Idle';
  return (
    <StyledBadge variant={variant} data-testid="idle-badge">
      {emoji} {label || defaultLabel}
    </StyledBadge>
  );
});
