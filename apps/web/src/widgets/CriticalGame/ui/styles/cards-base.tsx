import { styled, YStack } from 'tamagui';

export const Card = styled(YStack, {
  name: 'Card',
  aspectRatio: 2 / 3,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$3',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '$background',
  borderWidth: 2,
  borderColor: '$borderColor',

  variants: {
    isSticker: {
      true: {
        borderWidth: 0,
        backgroundColor: 'transparent',
      },
    },
    $variant: (val: string) => {
      if (val === 'cyberpunk') {
        return {
          borderRadius: 4,
          borderColor: '#06b6d4',
        };
      }
      if (val === 'underwater') {
        return {
          borderRadius: 24,
          borderColor: '#22d3ee',
        };
      }
      return {};
    },
    $cardType: (_val: unknown) => ({}),
    $index: (_val: unknown) => ({}),
  } as const,

  hoverStyle: {
    scale: 1.05,
    borderColor: '$primary',
    elevation: 8,
  },

  pressStyle: {
    scale: 0.98,
  },
});

export function GradientScrim() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
