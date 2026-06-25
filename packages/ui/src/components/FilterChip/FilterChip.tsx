import { XStack, Text, styled } from 'tamagui';
import type { ReactNode } from 'react';

const ChipRoot = styled(XStack, {
  name: 'FilterChip',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1',
  paddingHorizontal: '$4',
  paddingVertical: 8,
  borderRadius: '$4',
  borderWidth: 1,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',

  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  shadowColor: 'rgba(0,0,0,0.3)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 1,

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },

  pressStyle: {
    scale: 0.97,
  },

  focusStyle: {
    outlineWidth: 0,
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(255, 255, 255, 0.4)',
      },
    },
    disabled: {
      true: {
        opacity: 0.4,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
  } as const,

  defaultVariants: {
    active: false,
    disabled: false,
  },
});

export type FilterChipProps = {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false';
  'data-testid'?: string;
};

export function FilterChip({
  children,
  active = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'data-testid': testId,
}: FilterChipProps) {
  return (
    <ChipRoot
      active={active}
      disabled={disabled}
      onPress={onClick}
      role="checkbox"
      aria-checked={active}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      testID={testId}
    >
      <Text
        fontSize="$3"
        fontWeight="600"
        color={active ? '#ffffff' : 'rgba(255,255,255,0.7)'}
      >
        {children}
      </Text>
    </ChipRoot>
  );
}
