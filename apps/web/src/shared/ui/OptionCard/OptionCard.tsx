'use client';

import { YStack, Text, styled } from 'tamagui';
import { ReactNode } from 'react';

export interface OptionCardProps {
  label: ReactNode;
  description?: ReactNode;
  isActive?: boolean;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: () => void;
  icon?: ReactNode;
  'data-testid'?: string;
  className?: string;
}

const StyledOptionCard = styled(YStack, {
  name: 'OptionCard',
  tag: 'button',
  role: 'button',
  type: 'button',
  borderRadius: 12,
  borderWidth: 1,
  padding: '$5',
  gap: '$2',
  cursor: 'pointer',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  variants: {
    isActive: {
      true: {
        backgroundColor: 'rgba(87, 195, 255, 0.1)',
        borderColor: '$primary',
        elevation: '$small',
        shadowColor: '$primary',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        shadowOpacity: 0.5,
      },
      false: {
        hoverStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.07)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          y: -2,
        },
      },
    },
    animated: {
      true: {
        animation: 'medium',
      },
    },
  } as const,

  defaultVariants: {
    isActive: false,
    animated: true,
  },
} as Record<string, unknown>) as React.ComponentType<Record<string, unknown>>;

const Description = styled(Text, {
  fontSize: '$3',
  opacity: 0.7,
  lineHeight: '$2',
  color: '$color',
});

const Label = styled(Text, {
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const ActiveIndicator = styled(YStack, {
  position: 'absolute',
  top: 10,
  right: 10,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$primary',
  shadowColor: '$primary',
  shadowRadius: 10,
  shadowOpacity: 1,
  opacity: 0,

  variants: {
    visible: {
      true: {
        opacity: 1,
      },
    },
  } as const,
});

export function OptionCard({
  label,
  description,
  isActive,
  onPress,
  onClick,
  icon,
  'data-testid': dataTestId,
  ...rest
}: OptionCardProps) {
  return (
    <StyledOptionCard
      isActive={isActive}
      onClick={onClick || onPress}
      data-testid={dataTestId}
      {...rest}
      {...({
        'aria-pressed': isActive ? 'true' : 'false',
        role: 'button',
        tabIndex: 0,
      } as Record<string, unknown>)}
      style={{
        scrollMarginTop: 100,
        textAlign: 'left',
      }}
    >
      <ActiveIndicator visible={isActive} />
      <YStack gap="$1">
        <YStack flexDirection="row" alignItems="center" gap="$3">
          {icon}
          <Label>{label}</Label>
        </YStack>
        {description && <Description>{description}</Description>}
      </YStack>
    </StyledOptionCard>
  );
}
